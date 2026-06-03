import { Controller, Get, UseGuards } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { UserRole } from "@workspace/db"

import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { Roles } from "../auth/roles"
import { RolesGuard } from "../auth/roles.guard"
import { ReportsService } from "./reports.service"

@ApiTags("reports")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("reports")
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get("summary")
  @ApiOperation({
    summary:
      "Realtime admin reports for extinguisher stock, inspection statuses, expired units, and maintenance history",
  })
  @ApiOkResponse({ description: "Returns realtime reporting data for the admin dashboard." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  @ApiForbiddenResponse({ description: "Only ADMIN users can view reports." })
  summary() {
    return this.reportsService.summary()
  }
}
