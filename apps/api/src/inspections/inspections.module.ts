import { Module } from "@nestjs/common"

import { AuthModule } from "../auth/auth.module"
import { PrismaService } from "../prisma.service"
import { InspectionsController } from "./inspections.controller"
import { InspectionsService } from "./inspections.service"

@Module({
  imports: [AuthModule],
  controllers: [InspectionsController],
  providers: [InspectionsService, PrismaService],
})
export class InspectionsModule {}
