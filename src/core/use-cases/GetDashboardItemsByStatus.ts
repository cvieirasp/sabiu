import {
  DashboardQueryRepository,
  ItemsByStatusDTO,
} from '@/core/interfaces/ReportQueryRepository'

/**
 * Input DTO for GetDashboardItemsByStatus use case
 */
export interface GetDashboardItemsByStatusInput {
  userId: string
}

/**
 * GetDashboardItemsByStatus Use Case
 *
 * Retrieves learning items count grouped by status
 *
 * Business Rules:
 * - Only returns items owned by the user
 * - Groups by all statuses: Backlog, Em_Andamento, Pausado, Concluido
 */
export class GetDashboardItemsByStatus {
  constructor(private dashboardQueryRepository: DashboardQueryRepository) {}

  async execute(
    input: GetDashboardItemsByStatusInput
  ): Promise<ItemsByStatusDTO[]> {
    const items = await this.dashboardQueryRepository.getItemsByStatus(
      input.userId
    )

    return items
  }
}
