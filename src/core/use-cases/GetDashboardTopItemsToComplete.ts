import {
  DashboardQueryRepository,
  TopItemToCompleteDTO,
} from '@/core/interfaces/ReportQueryRepository'

/**
 * Input DTO for GetDashboardTopItemsToComplete use case
 */
export interface GetDashboardTopItemsToCompleteInput {
  userId: string
  limit: number
}

/**
 * GetDashboardTopItemsToComplete Use Case
 *
 * Retrieves top N learning items closest to completion
 *
 * Business Rules:
 * - Only returns items owned by the user
 * - Excludes completed items (status != Concluido)
 * - Orders by progress descending
 * - Limit must be positive
 */
export class GetDashboardTopItemsToComplete {
  constructor(private dashboardQueryRepository: DashboardQueryRepository) {}

  async execute(
    input: GetDashboardTopItemsToCompleteInput
  ): Promise<TopItemToCompleteDTO[]> {
    // Validate limit
    if (input.limit <= 0) {
      throw new Error('Limit must be a positive number')
    }

    const items = await this.dashboardQueryRepository.getTopItemsToComplete(
      input.userId,
      input.limit
    )

    return items
  }
}
