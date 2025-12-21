import { prisma } from '@/lib/prisma'
import { GetDashboardTopItemsToComplete } from '@/core/use-cases/GetDashboardTopItemsToComplete'
import { PrismaReportQueryRepository } from '@/infra/repositories/PrismaReportQueryRepository'

export function makeGetDashboardTopItemsToComplete() {
  const dashboardQueryRepository = new PrismaReportQueryRepository(prisma)
  return new GetDashboardTopItemsToComplete(dashboardQueryRepository)
}
