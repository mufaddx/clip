import { IsIn, IsString, Matches, MaxLength } from "class-validator";

// Only image/video — a campaign asset is always creative content a
// clipper publishes, never an arbitrary file. See UploadsService.
const ALLOWED_CONTENT_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/quicktime",
  "video/webm",
] as const;

export class PresignUploadDto {
  @IsString()
  @MaxLength(255)
  // Letters, digits, dot, dash, underscore only — the actual object key is
  // generated server-side (see UploadsService.presignUpload), this is just
  // used to preserve the original extension safely.
  @Matches(/^[\w.\- ]+$/, { message: "filename contains characters that aren't allowed" })
  filename!: string;

  @IsString()
  @IsIn(ALLOWED_CONTENT_TYPES)
  contentType!: string;
}
