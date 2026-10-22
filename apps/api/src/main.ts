import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module.js";
import { assertSecureProductionEnv } from "./config/production-env.js";

async function bootstrap() {
  assertSecureProductionEnv(process.env);

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Activate class-validator on all incoming DTOs.
  // - whitelist: strip properties not declared in the DTO.
  // - forbidNonWhitelisted: reject requests with unknown fields.
  // - transform: enable type coercion (e.g. string -> number from query).
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // CORS — allow the frontend dev server to call the API.
  // credentials: true is required so the browser stores/sends the refresh cookie.
  // origin must remain an explicit allowlist (single string today).
  const corsOrigin = process.env.CORS_ORIGIN ?? "http://localhost:5173";
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Intentionally NOT enabling Express "trust proxy". Auth rate limits key
  // off the direct socket address; honouring X-Forwarded-For blindly would
  // let clients spoof IPs. Enable trust proxy only behind a known reverse
  // proxy and with an explicit hop count when multi-instance limits require it.

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  Logger.log(`Soma API listening on http://localhost:${port}`, "Bootstrap");
  Logger.log(`CORS origin allowed: ${corsOrigin}`, "Bootstrap");
}

bootstrap().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : "bootstrap failed";
  Logger.error(message, "Bootstrap");
  process.exit(1);
});
