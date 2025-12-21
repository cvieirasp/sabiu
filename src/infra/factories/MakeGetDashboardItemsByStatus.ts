import { prisma } from '@/lib/prisma'
import { GetDashboardItemsByStatus } from '@/core/use-cases/GetDashboardItemsByStatus'
import { PrismaReportQueryRepository } from '@/infra/repositories/PrismaReportQueryRepository'

export function makeGetDashboardItemsByStatus() {
  const dashboardQueryRepository = new PrismaReportQueryRepository(prisma)
  return new GetDashboardItemsByStatus(dashboardQueryRepository)
}
