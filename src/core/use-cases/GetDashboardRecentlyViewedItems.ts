import {
  DashboardQueryRepository,
  RecentlyViewedItemDTO,
} from '@/core/interfaces/ReportQueryRepository'

/**
 * Input DTO for GetDashboardRecentlyViewedItems use case
 */
export interface GetDashboardRecentlyViewedItemsInput {
  userId: string
  limit: number
}

/**
 * GetDashboardRecentlyViewedItems Use Case
 *
 * Retrieves recently viewed/updated learning items
 *
 * Business Rules:
 * - Only returns items owned by the user
 * - Orders by last updated date descending
 * - Limit must be positive
 * - Uses updatedAt as proxy for viewedAt
 */
export class GetDashboardRecentlyViewedItems {
  constructor(private dashboardQueryRepository: DashboardQueryRepository) {}

  async execute(
    input: GetDashboardRecentlyViewedItemsInput
  ): Promise<RecentlyViewedItemDTO[]> {
    // Validate limit
    if (input.limit <= 0) {
      throw new Error('Limit must be a positive number')
    }

    const items = await this.dashboardQueryRepository.getRecentlyViewedItems(
      input.userId,
      input.limit
    )

    return items
  }
}
