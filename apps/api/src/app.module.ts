import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler"

import { AppController } from "./app.controller"
import { AppService } from "./app.service"
import { AuthModule } from "./auth/auth.module"
import { ExtinguishersModule } from "./extinguishers/extinguishers.module"
import { InspectionsModule } from "./inspections/inspections.module"
import { PrismaService } from "./prisma.service"
import { UsersModule } from "./users/users.module"

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [
        ".env.local",
        ".env",
        "../../.env.local",
        "../../.env",
        "../../packages/database/.env",
      ],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60_000, // 1 minute window
        limit: 100, // max requests per IP per window
      },
    ]),
    AuthModule,
    UsersModule,
    ExtinguishersModule,
    InspectionsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
