import { prisma } from '@/lib/prisma'
import { GetDashboardRecentlyViewedItems } from '@/core/use-cases/GetDashboardRecentlyViewedItems'
import { PrismaReportQueryRepository } from '@/infra/repositories/PrismaReportQueryRepository'

export function makeGetDashboardRecentlyViewedItems() {
  const dashboardQueryRepository = new PrismaReportQueryRepository(prisma)
  return new GetDashboardRecentlyViewedItems(dashboardQueryRepository)
}
