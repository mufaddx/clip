import { Injectable, Logger } from "@nestjs/common";
import { execFile } from "child_process";
import { promisify } from "util";
import { mkdtemp, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import sharp from "sharp";

const execFileAsync = promisify(execFile);

/**
 * Best-effort perceptual content matching between a brand's uploaded
 * campaign creative and a clipper's published reel — closes the "no video
 * matching at all" gap in docs/campaigns/REEL_VERIFICATION.md.
 *
 * Deliberately NOT frame-exact or audio-based (that's a much bigger,
 * hash-database-backed system). This computes a difference-hash (dHash) off
 * one representative frame of each video — cheap, dependency-light, and
 * tolerant of re-encoding/compression, which is what actually happens when
 * a clipper re-uploads a video to Instagram. It is a signal, not a proof:
 * ReelsService only ever uses a LOW similarity score to escalate to manual
 * review, never to silently pass or silently reject — see verify() there.
 *
 * Needs the `ffmpeg` binary on PATH (added via the `NIXPACKS_PKGS=ffmpeg`
 * Railway env var on the api/worker services — not bundled as an npm
 * dependency, since ffmpeg is a system binary, not a JS package). If it's
 * missing, every call throws and the caller treats that as "couldn't
 * compute" — see the fail-safe handling in ReelsService.
 */
@Injectable()
export class MediaFingerprintService {
  private readonly logger = new Logger(MediaFingerprintService.name);

  /** 0..64 — lower means more similar (dHash is a 64-bit fingerprint). */
  private static readonly HASH_BITS = 64;

  /**
   * Downloads `url`, extracts one representative frame (for video) or uses
   * the image directly, and returns its 64-bit difference-hash as a hex
   * string. Works for both video and image media — ffprobe/ffmpeg handle
   * both without needing to know the type up front.
   */
  async computeHash(url: string): Promise<string> {
    const dir = await mkdtemp(join(tmpdir(), "vidlix-fp-"));
    try {
      const sourcePath = join(dir, "source");
      const framePath = join(dir, "frame.png");

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to download media for fingerprinting: HTTP ${res.status}`);
      const buffer = Buffer.from(await res.arrayBuffer());
      await writeFile(sourcePath, buffer);

      // Grab one frame ~1s in (skips a possibly-black opening frame) — works
      // for a still image too, ffmpeg just re-emits it as frame 1.
      await execFileAsync("ffmpeg", [
        "-y",
        "-ss",
        "00:00:01",
        "-i",
        sourcePath,
        "-frames:v",
        "1",
        "-q:v",
        "2",
        framePath,
      ]);

      // Downscale to 9x8 grayscale — the extra column feeds the
      // left-to-right pixel comparisons that make a dHash (8x8 = 64 bits).
      const { data } = await sharp(framePath)
        .resize(9, 8, { fit: "fill" })
        .grayscale()
        .raw()
        .toBuffer({ resolveWithObject: true });

      let bits = "";
      for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
          const left = data[row * 9 + col] as number;
          const right = data[row * 9 + col + 1] as number;
          bits += left < right ? "1" : "0";
        }
      }
      return BigInt("0b" + bits).toString(16).padStart(16, "0");
    } finally {
      await rm(dir, { recursive: true, force: true }).catch(() => {
        this.logger.warn(`Failed to clean up temp dir ${dir}`);
      });
    }
  }

  /** Hamming distance between two hex-encoded 64-bit hashes. */
  private hammingDistance(hashA: string, hashB: string): number {
    const a = BigInt("0x" + hashA);
    const b = BigInt("0x" + hashB);
    let x = a ^ b;
    let distance = 0;
    while (x > 0n) {
      distance += Number(x & 1n);
      x >>= 1n;
    }
    return distance;
  }

  /** 0 (nothing alike) .. 1 (identical frame). */
  similarity(hashA: string, hashB: string): number {
    return 1 - this.hammingDistance(hashA, hashB) / MediaFingerprintService.HASH_BITS;
  }
}
