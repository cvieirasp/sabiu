import { LearningItem } from '../entities'
import { LearningItemRepository } from '../interfaces'

/**
 * Input DTO for GetDashboardMetrics use case
 */
export interface GetDashboardMetricsInput {
  userId: string
}

/**
 * Output DTO for GetDashboardMetrics use case
 */
export interface GetDashboardMetricsOutput {
  totalItems: number
  statusCounts: {
    backlog: number
    emAndamento: number
    pausado: number
    concluido: number
  }
  categoryCounts: Array<{
    categoryId: string | null
    count: number
  }>
  averageProgress: number
  overdueLearningItems: LearningItem[]
  dueSoonLearningItems: LearningItem[]
  nearCompletionLearningItems: LearningItem[]
  recentlyUpdatedLearningItems: LearningItem[]
}

/**
 * GetDashboardMetrics Use Case
 *
 * Retrieves comprehensive dashboard metrics for the user
 *
 * Business Rules:
 * - Aggregates learning item statistics by status and category
 * - Identifies overdue and due soon items
 * - Highlights items close to completion
 * - Shows recently updated items
 */
export class GetDashboardMetrics {
  constructor(private learningItemRepository: LearningItemRepository) {}

  async execute(
    input: GetDashboardMetricsInput
  ): Promise<GetDashboardMetricsOutput> {
    // Execute all queries in parallel for better performance
    const [
      totalItems,
      statusCounts,
      categoryCounts,
      averageProgress,
      overdueLearningItems,
      dueSoonLearningItems,
      nearCompletionLearningItems,
      recentlyUpdatedLearningItems,
    ] = await Promise.all([
      this.learningItemRepository.count(input.userId),
      this.learningItemRepository.countByStatus(input.userId),
      this.learningItemRepository.countByCategory(input.userId),
      this.learningItemRepository.calculateAverageProgress(input.userId),
      this.learningItemRepository.findOverdue(input.userId),
      this.learningItemRepository.findDueSoon(input.userId, 7), // 7 days threshold
      this.learningItemRepository.findNearCompletion(input.userId, 80, 5), // 80% progress, max 5 items
      this.learningItemRepository.findRecentlyUpdated(input.userId, 5), // max 5 items
    ])

    return {
      totalItems,
      statusCounts,
      categoryCounts,
      averageProgress,
      overdueLearningItems,
      dueSoonLearningItems,
      nearCompletionLearningItems,
      recentlyUpdatedLearningItems,
    }
  }
}
