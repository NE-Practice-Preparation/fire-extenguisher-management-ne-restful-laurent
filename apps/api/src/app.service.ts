import { Injectable } from "@nestjs/common"

import { PrismaService } from "./prisma.service"

@Injectable()
export class AppService {
  constructor(private readonly prisma: PrismaService) {}

  getHealth() {
    return {
      status: "ok",
      service: "restful-template-api",
      database: this.prisma ? "configured" : "unavailable",
    }
  }
}
