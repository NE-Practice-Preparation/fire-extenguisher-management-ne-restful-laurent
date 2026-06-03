import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from "@nestjs/common"
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger"

import { CurrentUser } from "./current-user.decorator"
import { AuthService } from "./auth.service"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { ForgotPasswordDto } from "./dto/forgot-password.dto"
import { LoginDto } from "./dto/login.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { SignupDto } from "./dto/signup.dto"
import { JwtAuthGuard } from "./jwt-auth.guard"
import type { JwtUser } from "./jwt-auth.guard"

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  @ApiOperation({ summary: "Register a new account (always created with the USER role)" })
  @ApiOkResponse({ description: "Returns an access token and the new user." })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto)
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Authenticate with email and password" })
  @ApiOkResponse({ description: "Returns an access token, user info, and role." })
  @ApiUnauthorizedResponse({ description: "Invalid credentials or deactivated account." })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Log out the current session" })
  @ApiOkResponse({ description: "Acknowledges logout; the client discards the token." })
  logout() {
    return this.authService.logout()
  }

  @Get("me")
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get the currently authenticated user from the token" })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  me(@CurrentUser() user: JwtUser) {
    return user
  }

  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request a password reset link by email" })
  @ApiOkResponse({ description: "Always returns a generic success message." })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto)
  }

  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset a password using a valid reset token" })
  @ApiOkResponse({ description: "Password reset; user can log in with the new password." })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto)
  }

  @Post("change-password")
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Change the current user's password" })
  @ApiOkResponse({ description: "Password updated successfully." })
  @ApiUnauthorizedResponse({ description: "Bearer token is missing, invalid, or expired." })
  changePassword(@CurrentUser() user: JwtUser, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(user.sub, dto)
  }
}
