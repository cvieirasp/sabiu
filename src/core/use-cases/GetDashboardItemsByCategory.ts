import {
  DashboardQueryRepository,
  ItemsByCategoryDTO,
} from '@/core/interfaces/ReportQueryRepository'

/**
 * Input DTO for GetDashboardItemsByCategory use case
 */
export interface GetDashboardItemsByCategoryInput {
  userId: string
}

/**
 * GetDashboardItemsByCategory Use Case
 *
 * Retrieves learning items count grouped by category
 *
 * Business Rules:
 * - Only returns items owned by the user
 * - Returns category details (name and color)
 * - Unknown categories are labeled as 'Unknown'
 */
export class GetDashboardItemsByCategory {
  constructor(private dashboardQueryRepository: DashboardQueryRepository) {}

  async execute(
    input: GetDashboardItemsByCategoryInput
  ): Promise<ItemsByCategoryDTO[]> {
    const items = await this.dashboardQueryRepository.getItemsByCategory(
      input.userId
    )

    return items
  }
}
