import { Injectable } from "@nestjs/common"
import { ExtinguisherStatus, InspectionStatus } from "@workspace/db"

import { PrismaService } from "../prisma.service"

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const now = new Date()
    const dayStart = startOfDay(now)
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    const [
      totalExtinguishers,
      dailyStock,
      monthlyStock,
      yearlyStock,
      extinguisherStatuses,
      inspectionStatuses,
      expiredExtinguishers,
      maintenanceHistory,
    ] = await Promise.all([
      this.prisma.fireExtinguisher.count(),
      this.prisma.fireExtinguisher.count({ where: { createdAt: { gte: dayStart } } }),
      this.prisma.fireExtinguisher.count({ where: { createdAt: { gte: monthStart } } }),
      this.prisma.fireExtinguisher.count({ where: { createdAt: { gte: yearStart } } }),
      this.prisma.fireExtinguisher.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      this.prisma.inspection.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      this.prisma.fireExtinguisher.findMany({
        where: {
          OR: [{ status: ExtinguisherStatus.EXPIRED }, { expiryDate: { lt: now } }],
        },
        orderBy: { expiryDate: "asc" },
        take: 50,
        select: {
          id: true,
          serialNumber: true,
          location: true,
          type: true,
          size: true,
          expiryDate: true,
          status: true,
        },
      }),
      this.prisma.maintenanceActivity.findMany({
        orderBy: { actionDate: "desc" },
        take: 100,
        select: {
          id: true,
          actionsTaken: true,
          actionDate: true,
          conditionsNoted: true,
          createdAt: true,
          inspector: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          inspection: {
            select: {
              id: true,
              scheduledDate: true,
              scheduledTime: true,
              extinguisher: {
                select: { id: true, serialNumber: true, location: true, type: true },
              },
            },
          },
        },
      }),
    ])

    return {
      generatedAt: now,
      stock: {
        total: totalExtinguishers,
        daily: dailyStock,
        monthly: monthlyStock,
        yearly: yearlyStock,
      },
      extinguisherStatus: normalizeCounts(
        extinguisherStatuses.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        Object.values(ExtinguisherStatus)
      ),
      inspectionStatus: normalizeCounts(
        inspectionStatuses.map((item) => ({
          status: item.status,
          count: item._count.status,
        })),
        Object.values(InspectionStatus)
      ),
      expiredExtinguishers,
      maintenanceHistory,
    }
  }
}

function startOfDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate())
}

function normalizeCounts<T extends string>(
  values: { status: T; count: number }[],
  statuses: T[]
) {
  return statuses.map((status) => ({
    status,
    count: values.find((item) => item.status === status)?.count ?? 0,
  }))
}
