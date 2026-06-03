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

import { CurrentUser } from "../auth/current-user.decorator"
import { JwtAuthGuard, type JwtUser } from "../auth/jwt-auth.guard"
import { Roles } from "../auth/roles"
import { RolesGuard } from "../auth/roles.guard"
import { CreateUserDto } from "./dto/create-user.dto"
import { QueryUsersDto } from "./dto/query-users.dto"
import { UpdateUserDto } from "./dto/update-user.dto"
import { UsersService } from "./users.service"

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List users (paginated, searchable, filter by role/status)" })
  @ApiOkResponse({ description: "Paginated users with metadata." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  @ApiForbiddenResponse({ description: "Only ADMIN users can list users." })
  findAll(@Query() query: QueryUsersDto) {
    return this.usersService.findAll(query)
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a single user by id" })
  @ApiParam({ name: "id", description: "User id" })
  @ApiNotFoundResponse({ description: "User not found." })
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @ApiOperation({ summary: "Create a USER or INSPECTOR account and email a set-password invite" })
  @ApiOkResponse({ description: "Returns the created user; an invite email is sent." })
  @ApiForbiddenResponse({ description: "Only ADMIN users can create accounts." })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a user's information" })
  @ApiParam({ name: "id", description: "User id" })
  @ApiNotFoundResponse({ description: "User not found." })
  update(@Param("id") id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Patch(":id/activate")
  @ApiOperation({ summary: "Activate a user account" })
  @ApiParam({ name: "id", description: "User id" })
  activate(@Param("id") id: string, @CurrentUser() user: JwtUser) {
    return this.usersService.setActive(id, true, user.sub)
  }

  @Patch(":id/deactivate")
  @ApiOperation({ summary: "Deactivate (disable) a user account" })
  @ApiParam({ name: "id", description: "User id" })
  deactivate(@Param("id") id: string, @CurrentUser() user: JwtUser) {
    return this.usersService.setActive(id, false, user.sub)
  }

  @Post(":id/resend-invite")
  @ApiOperation({ summary: "Re-send the set-password invite email" })
  @ApiParam({ name: "id", description: "User id" })
  resendInvite(@Param("id") id: string) {
    return this.usersService.resendInvite(id)
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user" })
  @ApiParam({ name: "id", description: "User id" })
  @ApiForbiddenResponse({ description: "Cannot delete your own account or an admin." })
  @ApiNotFoundResponse({ description: "User not found." })
  remove(@Param("id") id: string, @CurrentUser() user: JwtUser) {
    return this.usersService.remove(id, user.sub)
  }
}
