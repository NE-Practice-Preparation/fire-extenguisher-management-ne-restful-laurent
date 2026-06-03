import { Module } from "@nestjs/common"

import { AuthModule } from "../auth/auth.module"
import { MailModule } from "../mail/mail.module"
import { PrismaService } from "../prisma.service"
import { UsersController } from "./users.controller"
import { UsersService } from "./users.service"

@Module({
  imports: [AuthModule, MailModule],
  controllers: [UsersController],
  providers: [UsersService, PrismaService],
})
export class UsersModule {}
