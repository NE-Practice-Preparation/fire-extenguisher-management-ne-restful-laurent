import { randomBytes } from "node:crypto"

import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from "@nestjs/common"
import { JwtService } from "@nestjs/jwt"
import { UserRole } from "@workspace/db"

import { MailService } from "../mail/mail.service"
import { PrismaService } from "../prisma.service"
import { ChangePasswordDto } from "./dto/change-password.dto"
import { ForgotPasswordDto } from "./dto/forgot-password.dto"
import { LoginDto } from "./dto/login.dto"
import { ResetPasswordDto } from "./dto/reset-password.dto"
import { SignupDto } from "./dto/signup.dto"
import { UpdateProfileDto } from "./dto/update-profile.dto"
import { hashPassword, verifyPassword } from "./password"

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mail: MailService
  ) {}

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase()
    const existingUser = await this.prisma.user.findUnique({ where: { email } })

    if (existingUser) {
      throw new ConflictException("Email is already registered")
    }

    // Public signup always creates a standard USER. ADMIN is seeded and
    // INSPECTOR accounts are provisioned by an admin.
    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        passwordHash: await hashPassword(dto.password),
        role: UserRole.USER,
        passwordSetAt: new Date(),
      },
      select: userSelect,
    })

    this.logger.log(`New user registered: ${user.email}`)
    return this.createAuthResponse(user)
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    })

    if (!user || !(await verifyPassword(dto.password, user.passwordHash))) {
      this.logger.warn(`Failed login attempt for ${dto.email}`)
      throw new UnauthorizedException("Invalid email or password")
    }

    if (!user.isActive) {
      this.logger.warn(`Login blocked for deactivated account ${user.email}`)
      throw new UnauthorizedException("Your account has been deactivated. Contact an administrator.")
    }

    this.logger.log(`User logged in: ${user.email}`)
    return this.createAuthResponse(toAuthUser(user))
  }

  // JWTs are stateless, so logout is acknowledged here and the client discards
  // the token. The endpoint exists for a clean, documented contract.
  logout() {
    return { success: true, message: "Logged out successfully" }
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const email = dto.email.toLowerCase()
    const user = await this.prisma.user.findUnique({ where: { email } })

    // Always return the same response to avoid leaking which emails exist.
    const genericResponse = {
      success: true,
      message: "If an account exists for that email, a reset link has been sent.",
    }

    if (!user || !user.isActive) {
      return genericResponse
    }

    const token = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + RESET_TOKEN_TTL_MS)

    await this.prisma.user.update({
      where: { id: user.id },
      data: { resetToken: token, resetTokenExpiry },
    })

    const resetUrl = `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/auth/reset-password?token=${token}`

    try {
      await this.mail.sendTemplateEmail({
        to: user.email,
        firstName: user.firstName,
        subject: "Reset your password",
        previewText: "Password reset request",
        message:
          "We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour. If you did not request this, you can ignore this email.",
        actionLabel: "Reset password",
        actionUrl: resetUrl,
      })
    } catch (error) {
      // Don't fail the request if SMTP is unavailable; log for diagnostics.
      this.logger.error(`Failed to send reset email to ${user.email}`, error as Error)
    }

    this.logger.log(`Password reset requested for ${user.email}`)
    return genericResponse
  }

  async resetPassword(dto: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { resetToken: dto.token },
    })

    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry.getTime() < Date.now()) {
      throw new BadRequestException("Invalid or expired reset token")
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: await hashPassword(dto.newPassword),
        resetToken: null,
        resetTokenExpiry: null,
        // Marks the account as having completed setup: invited users become
        // "active" (no longer pending) once they set their own password.
        passwordSetAt: new Date(),
      },
    })

    this.logger.log(`Password reset completed for ${user.email}`)
    return { success: true, message: "Password has been reset. You can now log in." }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    if (!(await verifyPassword(dto.currentPassword, user.passwordHash))) {
      throw new BadRequestException("Current password is incorrect")
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: await hashPassword(dto.newPassword) },
    })

    this.logger.log(`Password changed for ${user.email}`)
    return { success: true, message: "Password updated successfully" }
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })

    if (!user) {
      throw new UnauthorizedException("User not found")
    }

    if (dto.email && dto.email.toLowerCase() !== user.email) {
      const email = dto.email.toLowerCase()
      const clash = await this.prisma.user.findUnique({ where: { email } })

      if (clash) {
        throw new ConflictException("Email is already registered")
      }
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        ...(dto.email ? { email: dto.email.toLowerCase() } : {}),
      },
      select: userSelect,
    })

    this.logger.log(`Profile updated for ${updated.email}`)
    // Return a fresh token because the JWT carries name/email.
    return this.createAuthResponse(toAuthUser(updated))
  }

  private async createAuthResponse(user: AuthUser) {
    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
    })

    return { accessToken, user }
  }
}

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const

type AuthUser = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

function toAuthUser(user: {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}): AuthUser {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
