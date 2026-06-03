import {
  Body,
  Controller,
  Delete,
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

import { JwtAuthGuard } from "../auth/jwt-auth.guard"
import { Roles } from "../auth/roles"
import { RolesGuard } from "../auth/roles.guard"
import { CreateExtinguisherDto } from "./dto/create-extinguisher.dto"
import { QueryExtinguishersDto } from "./dto/query-extinguishers.dto"
import { UpdateExtinguisherDto } from "./dto/update-extinguisher.dto"
import { ExtinguishersService } from "./extinguishers.service"

@ApiTags("extinguishers")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller("extinguishers")
export class ExtinguishersController {
  constructor(private readonly extinguishersService: ExtinguishersService) {}

  @Get()
  @ApiOperation({ summary: "List extinguishers (paginated, searchable, filter by type/status)" })
  @ApiOkResponse({ description: "Paginated extinguishers with metadata." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  findAll(@Query() query: QueryExtinguishersDto) {
    return this.extinguishersService.findAll(query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an extinguisher by id" })
  @ApiParam({ name: "id", description: "Extinguisher id" })
  @ApiNotFoundResponse({ description: "Extinguisher not found." })
  findOne(@Param("id") id: string) {
    return this.extinguishersService.findOne(id)
  }

  @Post()
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Register a new extinguisher (ADMIN)" })
  @ApiOkResponse({ description: "Returns the created extinguisher." })
  @ApiForbiddenResponse({ description: "Only ADMIN users can register extinguishers." })
  create(@Body() dto: CreateExtinguisherDto) {
    return this.extinguishersService.create(dto)
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Update an extinguisher (ADMIN)" })
  @ApiParam({ name: "id", description: "Extinguisher id" })
  @ApiForbiddenResponse({ description: "Only ADMIN users can update extinguishers." })
  @ApiNotFoundResponse({ description: "Extinguisher not found." })
  update(@Param("id") id: string, @Body() dto: UpdateExtinguisherDto) {
    return this.extinguishersService.update(id, dto)
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: "Remove an extinguisher record (ADMIN)" })
  @ApiParam({ name: "id", description: "Extinguisher id" })
  @ApiForbiddenResponse({ description: "Only ADMIN users can delete extinguishers." })
  @ApiNotFoundResponse({ description: "Extinguisher not found." })
  remove(@Param("id") id: string) {
    return this.extinguishersService.remove(id)
  }
}
