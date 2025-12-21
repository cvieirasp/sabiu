/**
 * Report Query Repository Interface
 *
 * Focused on aggregated and optimized queries for report data.
 * Returns only essential data to ensure performance.
 */

export interface ItemsByCategoryDTO {
  categoryId: string
  categoryName: string
  categoryColor: string
  count: number
}

export interface ItemsByStatusDTO {
  status: string
  count: number
}

export interface TopItemToCompleteDTO {
  id: string
  title: string
  categoryName: string
  progress: number
}

export interface RecentlyViewedItemDTO {
  id: string
  title: string
  categoryName: string
  categoryType: string
  progress: number
  viewedAt: Date
}

export interface ProgressByCategoryPerMonthDTO {
  month: string // Format: 'YYYY-MM'
  categoryId: string
  categoryName: string
  averageProgress: number
}

export interface DashboardQueryRepository {
  /**
   * Get count of learning items grouped by category
   * Optimized: Only returns counts, not full objects
   */
  getItemsByCategory(userId: string): Promise<ItemsByCategoryDTO[]>

  /**
   * Get count of learning items grouped by status
   * Optimized: Only returns counts, not full objects
   */
  getItemsByStatus(userId: string): Promise<ItemsByStatusDTO[]>

  /**
   * Get top N items closest to completion (highest progress, not completed)
   * Optimized: Only returns essential fields
   */
  getTopItemsToComplete(
    userId: string,
    limit: number
  ): Promise<TopItemToCompleteDTO[]>

  /**
   * Get recently viewed items
   * Optimized: Only returns essential fields
   * Note: Requires viewedAt tracking to be implemented
   */
  getRecentlyViewedItems(
    userId: string,
    limit: number
  ): Promise<RecentlyViewedItemDTO[]>

  /**
   * Get average progress per category by month for the last N months
   * Optimized: Aggregated data grouped by category and month
   */
  getProgressByCategoryPerMonth(
    userId: string,
    months: number
  ): Promise<ProgressByCategoryPerMonthDTO[]>
}
