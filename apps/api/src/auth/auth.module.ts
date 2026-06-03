import { Module } from "@nestjs/common"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { JwtModule, type JwtModuleOptions } from "@nestjs/jwt"

import { PrismaService } from "../prisma.service"
import { AuthController } from "./auth.controller"
import { AuthService } from "./auth.service"
import { JwtAuthGuard } from "./jwt-auth.guard"
import { RolesGuard } from "./roles.guard"

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET") ?? "dev-only-change-me",
        signOptions: {
          expiresIn: getJwtExpiresInSeconds(config),
        },
      }) satisfies JwtModuleOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, PrismaService, JwtAuthGuard, RolesGuard],
  exports: [JwtModule, JwtAuthGuard, RolesGuard],
})
export class AuthModule {}

function getJwtExpiresInSeconds(config: ConfigService) {
  const value = Number(config.get<string>("JWT_EXPIRES_IN") ?? 86_400)

  return Number.isFinite(value) && value > 0 ? value : 86_400
}
