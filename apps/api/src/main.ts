import "reflect-metadata";
import { initSentry } from "./common/sentry";
initSentry(); // must run before anything else is imported, per Sentry's Node setup

import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { AppModule } from "./app.module";
import { getEnv } from "@clip/config";

/**
 * HTTP entrypoint for api.domain.in — see docs/architecture/BACKEND_ARCHITECTURE.md
 * "Request lifecycle" and docs/deployment/DEPLOYMENT_ARCHITECTURE.md (this process
 * is deployed separately from the worker entrypoint in worker.ts).
 */
async function bootstrap() {
  const env = getEnv();
  // rawBody: true preserves the unparsed request body alongside the parsed
  // one — required to verify webhook HMAC signatures (Meta, payment
  // provider), which must be computed over the exact bytes received, not
  // a re-serialized JSON object. See docs/api/WEBHOOKS.md.
  const app = await NestFactory.create(AppModule, { rawBody: true });

  app.use(helmet());
  app.use(cookieParser());

  // CORS: only the four known app origins may make credentialed requests —
  // see docs/deployment/DOMAIN_DEPLOYMENT.md "CORS".
  app.enableCors({
    origin: [env.PUBLIC_APP_URL, env.CLIPPER_APP_URL, env.BRAND_APP_URL, env.ADMIN_APP_URL],
    credentials: true,
  });

  // Whitelist strips unknown fields rather than accepting them — prevents
  // mass-assignment of fields like `role` from a crafted request body.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));

  app.setGlobalPrefix(""); // controllers declare their own "v1/..." prefix

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);
  console.log(`CLIP API listening on port ${port}`);
}

bootstrap();
