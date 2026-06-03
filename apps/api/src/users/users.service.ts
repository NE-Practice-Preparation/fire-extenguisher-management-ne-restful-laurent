import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common"

import { MailService } from "../mail/mail.service"
import { PrismaService } from "../prisma.service"

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService
  ) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: userSelect,
    })
  }

  async remove(id: string, currentUserId: string) {
    if (id === currentUserId) {
      throw new ForbiddenException("You cannot delete your own account")
    }

    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    return this.prisma.user.delete({
      where: { id },
      select: userSelect,
    })
  }

  async sendRandomEmail(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: userSelect,
    })

    if (!user) {
      throw new NotFoundException("User not found")
    }

    const reference = createReference()

    await this.mail.sendTemplateEmail({
      to: user.email,
      firstName: user.firstName,
      subject: "A quick update from Fire Extinguisher Management",
      previewText: `Template message ${reference}`,
      message: `This is a generic template email sent from the admin portal. Reference: ${reference}. You can replace this copy with your own workflow notification, invitation, reminder, or account update.`,
      actionLabel: "Open portal",
      actionUrl: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    })

    return {
      sent: true,
      reference,
      user,
    }
  }
}

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

function createReference() {
  return `MSG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`
}
