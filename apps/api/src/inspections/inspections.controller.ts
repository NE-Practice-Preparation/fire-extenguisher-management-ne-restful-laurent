import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"
import { UserRole } from "@workspace/db"

import { CurrentUser } from "../auth/current-user.decorator"
import { JwtAuthGuard, type JwtUser } from "../auth/jwt-auth.guard"
import { Roles } from "../auth/roles"
import { RolesGuard } from "../auth/roles.guard"
import { AssignInspectorDto } from "./dto/assign-inspector.dto"
import { CompleteInspectionDto } from "./dto/complete-inspection.dto"
import { CreateInspectionDto } from "./dto/create-inspection.dto"
import { QueryInspectionsDto } from "./dto/query-inspections.dto"
import { InspectionsService } from "./inspections.service"

@ApiTags("inspections")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("inspections")
export class InspectionsController {
  constructor(private readonly inspectionsService: InspectionsService) {}

  @Post()
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: "Schedule an inspection (USER/ADMIN)" })
  @ApiOkResponse({ description: "Returns the scheduled inspection." })
  @ApiForbiddenResponse({ description: "Only USER or ADMIN can schedule inspections." })
  create(@CurrentUser() user: JwtUser, @Body() dto: CreateInspectionDto) {
    return this.inspectionsService.create(user.sub, dto)
  }

  @Get()
  @ApiOperation({ summary: "List inspections (role-scoped, paginated, filter by status)" })
  @ApiOkResponse({ description: "Paginated inspections with metadata." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  findAll(@CurrentUser() user: JwtUser, @Query() query: QueryInspectionsDto) {
    return this.inspectionsService.findAll(user, query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an inspection by id (role-scoped access)" })
  @ApiParam({ name: "id", description: "Inspection id" })
  @ApiNotFoundResponse({ description: "Inspection not found." })
  findOne(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.inspectionsService.findOne(user, id)
  }

  @Patch(":id/cancel")
  @Roles(UserRole.USER, UserRole.ADMIN)
  @ApiOperation({ summary: "Cancel a scheduled inspection (creator or ADMIN)" })
  @ApiParam({ name: "id", description: "Inspection id" })
  cancel(@CurrentUser() user: JwtUser, @Param("id") id: string) {
    return this.inspectionsService.cancel(user, id)
  }

  @Patch(":id/assign")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Assign an inspector to an inspection (ADMIN)" })
  @ApiParam({ name: "id", description: "Inspection id" })
  assign(@Param("id") id: string, @Body() dto: AssignInspectorDto) {
    return this.inspectionsService.assignInspector(id, dto)
  }

  @Patch(":id/complete")
  @Roles(UserRole.INSPECTOR, UserRole.ADMIN)
  @ApiOperation({ summary: "Complete an inspection (assigned INSPECTOR or ADMIN)" })
  @ApiParam({ name: "id", description: "Inspection id" })
  complete(
    @CurrentUser() user: JwtUser,
    @Param("id") id: string,
    @Body() dto: CompleteInspectionDto
  ) {
    return this.inspectionsService.complete(user, id, dto)
  }
}
