import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common"
import { InspectionStatus, Prisma, UserRole } from "@workspace/db"

import type { JwtUser } from "../auth/jwt-auth.guard"
import { PrismaService } from "../prisma.service"
import { AssignInspectorDto } from "./dto/assign-inspector.dto"
import { CompleteInspectionDto } from "./dto/complete-inspection.dto"
import { CreateInspectionDto } from "./dto/create-inspection.dto"
import { QueryInspectionsDto } from "./dto/query-inspections.dto"

@Injectable()
export class InspectionsService {
  private readonly logger = new Logger(InspectionsService.name)

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateInspectionDto) {
    const extinguisher = await this.prisma.fireExtinguisher.findUnique({
      where: { id: dto.extinguisherId },
      select: { id: true },
    })

    if (!extinguisher) {
      throw new NotFoundException("Extinguisher not found")
    }

    const inspection = await this.prisma.inspection.create({
      data: {
        extinguisherId: dto.extinguisherId,
        scheduledDate: new Date(dto.scheduledDate),
        scheduledTime: dto.scheduledTime,
        notes: dto.notes,
        createdById: userId,
        status: InspectionStatus.SCHEDULED,
      },
      include: inspectionInclude,
    })

    this.logger.log(`Inspection scheduled by ${userId} for extinguisher ${dto.extinguisherId}`)
    return inspection
  }

  async findAll(user: JwtUser, query: QueryInspectionsDto) {
    const { page, limit, status } = query
    const skip = (page - 1) * limit

    const where: Prisma.InspectionWhereInput = {
      ...(status ? { status } : {}),
      ...this.scopeFor(user),
    }

    const [data, total] = await Promise.all([
      this.prisma.inspection.findMany({
        where,
        orderBy: { scheduledDate: "desc" },
        skip,
        take: limit,
        include: inspectionInclude,
      }),
      this.prisma.inspection.count({ where }),
    ])

    return {
      data,
      meta: { total, page, limit, totalPages: Math.max(1, Math.ceil(total / limit)) },
    }
  }

  async findOne(user: JwtUser, id: string) {
    const inspection = await this.prisma.inspection.findUnique({
      where: { id },
      include: inspectionInclude,
    })

    if (!inspection) {
      throw new NotFoundException("Inspection not found")
    }

    this.assertCanSee(user, inspection)
    return inspection
  }

  async cancel(user: JwtUser, id: string) {
    const inspection = await this.requireInspection(id)

    // Only the creator or an admin can cancel.
    if (user.role !== UserRole.ADMIN && inspection.createdById !== user.sub) {
      throw new ForbiddenException("You can only cancel your own inspections")
    }

    if (inspection.status !== InspectionStatus.SCHEDULED && inspection.status !== InspectionStatus.OVERDUE) {
      throw new BadRequestException(`Cannot cancel a ${inspection.status.toLowerCase()} inspection`)
    }

    return this.prisma.inspection.update({
      where: { id },
      data: { status: InspectionStatus.CANCELLED },
      include: inspectionInclude,
    })
  }

  async assignInspector(id: string, dto: AssignInspectorDto) {
    await this.requireInspection(id)

    const inspector = await this.prisma.user.findUnique({
      where: { id: dto.assignedInspectorId },
      select: { id: true, role: true },
    })

    if (!inspector || inspector.role !== UserRole.INSPECTOR) {
      throw new BadRequestException("Assigned user must be an inspector")
    }

    return this.prisma.inspection.update({
      where: { id },
      data: { assignedInspectorId: dto.assignedInspectorId },
      include: inspectionInclude,
    })
  }

  async complete(user: JwtUser, id: string, dto: CompleteInspectionDto) {
    const inspection = await this.requireInspection(id)

    if (user.role === UserRole.INSPECTOR && inspection.assignedInspectorId !== user.sub) {
      throw new ForbiddenException("You can only complete inspections assigned to you")
    }

    if (inspection.status === InspectionStatus.COMPLETED) {
      throw new BadRequestException("Inspection is already completed")
    }

    return this.prisma.inspection.update({
      where: { id },
      data: {
        status: InspectionStatus.COMPLETED,
        ...(dto.notes ? { notes: dto.notes } : {}),
      },
      include: inspectionInclude,
    })
  }

  private async requireInspection(id: string) {
    const inspection = await this.prisma.inspection.findUnique({ where: { id } })

    if (!inspection) {
      throw new NotFoundException("Inspection not found")
    }

    return inspection
  }

  // Restricts list/detail visibility by role.
  private scopeFor(user: JwtUser): Prisma.InspectionWhereInput {
    if (user.role === UserRole.ADMIN) {
      return {}
    }
    if (user.role === UserRole.INSPECTOR) {
      return { assignedInspectorId: user.sub }
    }
    return { createdById: user.sub }
  }

  private assertCanSee(user: JwtUser, inspection: { createdById: string; assignedInspectorId: string | null }) {
    if (user.role === UserRole.ADMIN) return
    if (user.role === UserRole.INSPECTOR && inspection.assignedInspectorId === user.sub) return
    if (inspection.createdById === user.sub) return
    throw new ForbiddenException("You do not have access to this inspection")
  }
}

const inspectionInclude = {
  extinguisher: {
    select: { id: true, serialNumber: true, location: true, type: true },
  },
  assignedInspector: {
    select: { id: true, firstName: true, lastName: true },
  },
  createdBy: {
    select: { id: true, firstName: true, lastName: true },
  },
} satisfies Prisma.InspectionInclude
