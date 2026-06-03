import { Module } from "@nestjs/common"

import { AuthModule } from "../auth/auth.module"
import { PrismaService } from "../prisma.service"
import { ExtinguishersController } from "./extinguishers.controller"
import { ExtinguishersService } from "./extinguishers.service"

@Module({
  imports: [AuthModule],
  controllers: [ExtinguishersController],
  providers: [ExtinguishersService, PrismaService],
})
export class ExtinguishersModule {}
