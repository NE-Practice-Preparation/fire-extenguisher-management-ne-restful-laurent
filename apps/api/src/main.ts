import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import helmet from "helmet"
import { ValidationPipe } from "@nestjs/common"

import { AppModule } from "./app.module"

function sanitizeEnvValue(value?: string) {
  return value?.trim().replace(/^["']|["']$/g, "").replace(/\/$/, "") ?? ""
}

function sanitizeDatabaseUrl() {
  const raw = process.env.DATABASE_URL
  if (!raw) return
  process.env.DATABASE_URL = sanitizeEnvValue(raw)
}

function allowedOrigins() {
  const fromEnv = sanitizeEnvValue(process.env.WEB_ORIGIN)
    .split(",")
    .map((origin) => sanitizeEnvValue(origin))
    .filter(Boolean)

  return [
    ...new Set([
      ...fromEnv,
      "http://localhost:3000",
      "https://fms-6.vercel.app",
    ]),
  ]
}

async function bootstrap() {
  sanitizeDatabaseUrl()
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3001
  const origins = allowedOrigins()

  app.enableCors({
    origin: origins,
    credentials: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    })
  )
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  )
  app.setGlobalPrefix("api")

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Fire Extinguisher Management API")
    .setDescription(
      "REST API for the Fire Extinguisher Management System with JWT authentication and role-based access (ADMIN, INSPECTOR, USER)."
    )
    .setVersion("1.0")
    .addBearerAuth()
    .build()
  const document = SwaggerModule.createDocument(app, swaggerConfig)
  SwaggerModule.setup("api/docs", app, document)

  await app.listen(port)
}

void bootstrap()
