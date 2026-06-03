import { NestFactory } from "@nestjs/core"
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger"
import helmet from "helmet"
import { ValidationPipe } from "@nestjs/common"

import { AppModule } from "./app.module"

async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  const port = process.env.PORT ?? 3001

  app.enableCors({
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true,
  })
  app.use(helmet())
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
