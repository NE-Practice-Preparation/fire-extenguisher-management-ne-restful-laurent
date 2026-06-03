import { Controller, Delete, Get, Param, Post, UseGuards } from "@nestjs/common"
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
import { UsersService } from "./users.service"

@ApiTags("users")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ROLE1)
@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: "List all users for the ROLE1 admin portal" })
  @ApiOkResponse({ description: "Returns all users without password hashes." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  @ApiForbiddenResponse({ description: "Only ROLE1 users can list users." })
  findAll() {
    return this.usersService.findAll()
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a user from the ROLE1 admin portal" })
  @ApiParam({ name: "id", description: "User id to delete" })
  @ApiOkResponse({ description: "Returns the deleted user without password hash." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  @ApiForbiddenResponse({
    description: "Only ROLE1 users can delete users. Users cannot delete themselves.",
  })
  @ApiNotFoundResponse({ description: "User not found." })
  remove(@Param("id") id: string, @CurrentUser() user: JwtUser) {
    return this.usersService.remove(id, user.sub)
  }

  @Post(":id/email")
  @ApiOperation({ summary: "Send a generic template email to a user" })
  @ApiParam({ name: "id", description: "User id to email" })
  @ApiOkResponse({ description: "Sends a generic HTML email through configured SMTP." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  @ApiForbiddenResponse({ description: "Only ROLE1 users can send user emails." })
  @ApiNotFoundResponse({ description: "User not found." })
  sendEmail(@Param("id") id: string) {
    return this.usersService.sendRandomEmail(id)
  }
}
