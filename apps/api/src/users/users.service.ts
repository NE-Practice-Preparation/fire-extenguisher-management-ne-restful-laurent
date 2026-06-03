import { randomBytes } from "node:crypto"

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import { Prisma, UserRole } from "@workspace/db"

import { hashPassword } from "../auth/password"
import { MailService } from "../mail/mail.service"
import { PrismaService } from "../prisma.service"
import { CreateUserDto } from "./dto/create-user.dto"
import { QueryUsersDto } from "./dto/query-users.dto"
import { UpdateUserDto } from "./dto/update-user.dto"

const INVITE_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  async findAll(query: QueryUsersDto) {
    const { page, limit, search, role, isActive } = query
    const skip = (page - 1) * limit

    const where: Prisma.UserWhereInput = {
      ...(role ? { role } : {}),
      ...(typeof isActive === "boolean" ? { isActive } : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { email: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        select: userSelect,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: data.map(withStatus),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return withStatus(user)
  }

  async create(dto: CreateUserDto) {
    const email = dto.email.toLowerCase()
    const existing = await this.prisma.user.findUnique({ where: { email } })

    if (existing) {
      throw new ConflictException("Email is already registered")
    }

    // The admin does not choose a password. We store an unusable random hash
    // and hand the new account an invite token to set their own password.
    const randomPassword = randomBytes(24).toString("hex")
    const token = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + INVITE_TOKEN_TTL_MS)

    const user = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email,
        passwordHash: await hashPassword(randomPassword),
        role: dto.role,
        isActive: true,
        resetToken: token,
        resetTokenExpiry,
      },
      select: userSelect,
    })

    await this.sendInviteEmail(user.firstName, user.email, token, user.role)
    this.logger.log(`Admin created ${user.role} account: ${user.email}`)

    return withStatus(user)
  }

  async update(id: string, dto: UpdateUserDto) {
    const target = await this.requireMutableUser(id)

    if (dto.email && dto.email.toLowerCase() !== target.email) {
      const email = dto.email.toLowerCase()
      const clash = await this.prisma.user.findUnique({ where: { email } })

      if (clash) {
        throw new ConflictException("Email is already registered")
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        ...(dto.email ? { email: dto.email.toLowerCase() } : {}),
      },
      select: userSelect,
    })

    this.logger.log(`Admin updated user: ${updated.email}`)
    return withStatus(updated)
  }

  async setActive(id: string, isActive: boolean, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException("You cannot change your own active state")
    }

    await this.requireMutableUser(id)

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: userSelect,
    })

    this.logger.log(`Admin ${isActive ? "activated" : "deactivated"} user: ${updated.email}`)
    return withStatus(updated)
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException("You cannot delete your own account")
    }

    await this.requireMutableUser(id)

    const deleted = await this.prisma.user.delete({
      where: { id },
      select: userSelect,
    })

    this.logger.log(`Admin deleted user: ${deleted.email}`)
    return withStatus(deleted)
  }

  async resendInvite(id: string) {
    const user = await this.requireMutableUser(id)

    const token = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + INVITE_TOKEN_TTL_MS)

    await this.prisma.user.update({
      where: { id },
      data: { resetToken: token, resetTokenExpiry },
    })

    await this.sendInviteEmail(user.firstName, user.email, token, user.role)
    this.logger.log(`Admin resent invite to: ${user.email}`)

    return { success: true, message: `Invite re-sent to ${user.email}` }
  }

  // Guard: only USER/INSPECTOR accounts may be mutated through this admin module.
  private async requireMutableUser(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, firstName: true, role: true },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException("Admin accounts cannot be managed here")
    }

    return user
  }

  private async sendInviteEmail(
    firstName: string,
    email: string,
    token: string,
    role: UserRole
  ) {
    const setPasswordUrl = `${process.env.WEB_ORIGIN ?? "http://localhost:3000"}/auth/reset-password?token=${token}`
    const roleLabel = role === UserRole.INSPECTOR ? "Inspector" : "User"

    try {
      await this.mail.sendTemplateEmail({
        to: email,
        firstName,
        subject: `Your ${roleLabel} account is ready`,
        previewText: "Set your password to access the portal",
        message: `An account has been created for you on the Fire Extinguisher Management System as a ${roleLabel}. Click the button below to set your password and sign in. This link expires in 7 days.`,
        actionLabel: "Set your password",
        actionUrl: setPasswordUrl,
      })
    } catch (error) {
      this.logger.error(`Failed to send invite email to ${email}`, error as Error)
    }
  }
}

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  isActive: true,
  passwordSetAt: true,
  createdAt: true,
  updatedAt: true,
} as const

type SelectedUser = {
  isActive: boolean
}

export type UserStatus = "ACTIVE" | "DEACTIVATED"

function statusOf(user: SelectedUser): UserStatus {
  return user.isActive ? "ACTIVE" : "DEACTIVATED"
}

function withStatus<T extends SelectedUser>(user: T) {
  return { ...user, status: statusOf(user) }
}
