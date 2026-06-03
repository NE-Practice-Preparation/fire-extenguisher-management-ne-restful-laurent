import { ConflictException, Injectable, Logger, NotFoundException } from "@nestjs/common"
import { Prisma } from "@workspace/db"

import { PrismaService } from "../prisma.service"
import { CreateExtinguisherDto } from "./dto/create-extinguisher.dto"
import { QueryExtinguishersDto } from "./dto/query-extinguishers.dto"
import { UpdateExtinguisherDto } from "./dto/update-extinguisher.dto"

@Injectable()
export class ExtinguishersService {
  private readonly logger = new Logger(ExtinguishersService.name)

  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: QueryExtinguishersDto) {
    const { page, limit, search, type, status } = query
    const skip = (page - 1) * limit

    const where: Prisma.FireExtinguisherWhereInput = {
      ...(type ? { type } : {}),
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { serialNumber: { contains: search, mode: "insensitive" } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      this.prisma.fireExtinguisher.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      this.prisma.fireExtinguisher.count({ where }),
    ])

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    }
  }

  async findOne(id: string) {
    const extinguisher = await this.prisma.fireExtinguisher.findUnique({ where: { id } })

    if (!extinguisher) {
      throw new NotFoundException("Fire extinguisher not found")
    }

    return extinguisher
  }

  async create(dto: CreateExtinguisherDto) {
    const existing = await this.prisma.fireExtinguisher.findUnique({
      where: { serialNumber: dto.serialNumber },
    })

    if (existing) {
      throw new ConflictException("Serial number is already registered")
    }

    const extinguisher = await this.prisma.fireExtinguisher.create({
      data: {
        serialNumber: dto.serialNumber,
        location: dto.location,
        type: dto.type,
        size: dto.size,
        installationDate: new Date(dto.installationDate),
        expiryDate: new Date(dto.expiryDate),
        ...(dto.status ? { status: dto.status } : {}),
      },
    })

    this.logger.log(`Extinguisher registered: ${extinguisher.serialNumber}`)
    return extinguisher
  }

  async update(id: string, dto: UpdateExtinguisherDto) {
    await this.findOne(id)

    if (dto.serialNumber) {
      const clash = await this.prisma.fireExtinguisher.findUnique({
        where: { serialNumber: dto.serialNumber },
      })

      if (clash && clash.id !== id) {
        throw new ConflictException("Serial number is already registered")
      }
    }

    const extinguisher = await this.prisma.fireExtinguisher.update({
      where: { id },
      data: {
        ...(dto.serialNumber ? { serialNumber: dto.serialNumber } : {}),
        ...(dto.location ? { location: dto.location } : {}),
        ...(dto.type ? { type: dto.type } : {}),
        ...(dto.size ? { size: dto.size } : {}),
        ...(dto.installationDate ? { installationDate: new Date(dto.installationDate) } : {}),
        ...(dto.expiryDate ? { expiryDate: new Date(dto.expiryDate) } : {}),
        ...(dto.status ? { status: dto.status } : {}),
      },
    })

    this.logger.log(`Extinguisher updated: ${extinguisher.serialNumber}`)
    return extinguisher
  }

  async remove(id: string) {
    await this.findOne(id)

    const extinguisher = await this.prisma.fireExtinguisher.delete({ where: { id } })
    this.logger.log(`Extinguisher removed: ${extinguisher.serialNumber}`)
    return extinguisher
  }
}
