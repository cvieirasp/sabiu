import { prisma } from '@/lib/prisma'
import { GetDashboardItemsByCategory } from '@/core/use-cases/GetDashboardItemsByCategory'
import { PrismaReportQueryRepository } from '@/infra/repositories/PrismaReportQueryRepository'

export function makeGetDashboardItemsByCategory() {
  const dashboardQueryRepository = new PrismaReportQueryRepository(prisma)
  return new GetDashboardItemsByCategory(dashboardQueryRepository)
}
