import {
  DashboardQueryRepository,
  ProgressByCategoryPerMonthDTO,
} from '@/core/interfaces/ReportQueryRepository'

/**
 * Input DTO for GetDashboardProgressByCategory use case
 */
export interface GetDashboardProgressByCategoryInput {
  userId: string
  months: number
}

/**
 * GetDashboardProgressByCategory Use Case
 *
 * Retrieves average progress per category grouped by month
 *
 * Business Rules:
 * - Only returns data for items owned by the user
 * - Groups by category and month (YYYY-MM format)
 * - Calculates average progress per group
 * - Months parameter must be positive
 * - Maximum lookback period should be reasonable (e.g., 12 months)
 */
export class GetDashboardProgressByCategory {
  private static readonly MAX_MONTHS = 24

  constructor(private dashboardQueryRepository: DashboardQueryRepository) {}

  async execute(
    input: GetDashboardProgressByCategoryInput
  ): Promise<ProgressByCategoryPerMonthDTO[]> {
    // Validate months parameter
    if (input.months <= 0) {
      throw new Error('Months must be a positive number')
    }

    if (input.months > GetDashboardProgressByCategory.MAX_MONTHS) {
      throw new Error(
        `Months cannot exceed ${GetDashboardProgressByCategory.MAX_MONTHS}`
      )
    }

    const progressData =
      await this.dashboardQueryRepository.getProgressByCategoryPerMonth(
        input.userId,
        input.months
      )

    return progressData
  }
}
