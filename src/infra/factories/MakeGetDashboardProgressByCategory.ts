import { prisma } from '@/lib/prisma'
import { GetDashboardProgressByCategory } from '@/core/use-cases/GetDashboardProgressByCategory'
import { PrismaReportQueryRepository } from '@/infra/repositories/PrismaReportQueryRepository'

export function makeGetDashboardProgressByCategory() {
  const dashboardQueryRepository = new PrismaReportQueryRepository(prisma)
  return new GetDashboardProgressByCategory(dashboardQueryRepository)
}
