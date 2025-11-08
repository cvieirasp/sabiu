import { LearningItem } from '../entities'
import { StatusVO } from '../value-objects'

/**
 * Learning Item Repository Interface
 *
 * Defines the contract for learning item data access operations
 * This is the main aggregate root repository
 */
export interface LearningItemRepository {
  /**
   * Find a learning item by ID
   * @param id - Learning item unique identifier
   * @param includeModules - Whether to include modules in the result
   * @returns Learning item if found, null otherwise
   */
  findById(id: string, includeModules?: boolean): Promise<LearningItem | null>

  /**
   * Find learning items by user ID
   * @param userId - User unique identifier
   * @param options - Filtering, pagination and ordering options
   * @returns Array of learning items
   */
  findByUserId(
    userId: string,
    options?: {
      skip?: number
      take?: number
      status?: StatusVO
      categoryId?: string
      tagIds?: string[]
      search?: string
      orderBy?:
        | 'title'
        | 'createdAt'
        | 'updatedAt'
        | 'dueDate'
        | 'progress'
        | 'status'
      order?: 'asc' | 'desc'
      includeModules?: boolean
    }
  ): Promise<LearningItem[]>

  /**
   * Find learning items by status
   * @param userId - User unique identifier
   * @param status - Learning item status
   * @param options - Additional filtering options
   * @returns Array of learning items
   */
  findByStatus(
    userId: string,
    status: StatusVO,
    options?: {
      categoryId?: string
      includeModules?: boolean
    }
  ): Promise<LearningItem[]>

  /**
   * Find learning items by category
   * @param userId - User unique identifier
   * @param categoryId - Category unique identifier
   * @param options - Additional filtering options
   * @returns Array of learning items
   */
  findByCategory(
    userId: string,
    categoryId: string,
    options?: {
      status?: StatusVO
      includeModules?: boolean
    }
  ): Promise<LearningItem[]>

  /**
   * Find learning items by tags
   * @param userId - User unique identifier
   * @param tagIds - Array of tag IDs
   * @param matchAll - If true, item must have all tags. If false, any tag matches
   * @returns Array of learning items
   */
  findByTags(
    userId: string,
    tagIds: string[],
    matchAll?: boolean
  ): Promise<LearningItem[]>

  /**
   * Find overdue learning items
   * @param userId - User unique identifier
   * @returns Array of overdue learning items
   */
  findOverdue(userId: string): Promise<LearningItem[]>

  /**
   * Find learning items due soon
   * @param userId - User unique identifier
   * @param daysThreshold - Number of days to consider as "soon"
   * @returns Array of learning items due within threshold
   */
  findDueSoon(userId: string, daysThreshold?: number): Promise<LearningItem[]>

  /**
   * Find learning items close to completion
   * @param userId - User unique identifier
   * @param progressThreshold - Minimum progress percentage (default 80)
   * @param limit - Maximum number of items to return
   * @returns Array of learning items sorted by progress descending
   */
  findNearCompletion(
    userId: string,
    progressThreshold?: number,
    limit?: number
  ): Promise<LearningItem[]>

  /**
   * Search learning items by text
   * @param userId - User unique identifier
   * @param query - Search query (searches title and description)
   * @param options - Additional filtering options
   * @returns Array of matching learning items
   */
  search(
    userId: string,
    query: string,
    options?: {
      status?: StatusVO
      categoryId?: string
      limit?: number
    }
  ): Promise<LearningItem[]>

  /**
   * Create a new learning item
   * @param item - Learning item entity to create
   * @returns Created learning item
   */
  create(item: LearningItem): Promise<LearningItem>

  /**
   * Update an existing learning item
   * @param item - Learning item entity with updated data
   * @returns Updated learning item
   */
  update(item: LearningItem): Promise<LearningItem>

  /**
   * Update progress for a learning item
   * This is a specific operation to update just the progress cache
   * @param id - Learning item unique identifier
   * @param progress - New progress value
   * @returns True if updated successfully
   */
  updateProgress(id: string, progress: number): Promise<boolean>

  /**
   * Delete a learning item by ID
   * This will cascade delete modules and dependencies
   * @param id - Learning item unique identifier
   * @returns True if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>

  /**
   * Count learning items by user
   * @param userId - User unique identifier
   * @param filters - Optional status or category filters
   * @returns Total number of learning items
   */
  count(
    userId: string,
    filters?: {
      status?: StatusVO
      categoryId?: string
    }
  ): Promise<number>

  /**
   * Count learning items grouped by status
   * @param userId - User unique identifier
   * @returns Object with count for each status
   */
  countByStatus(userId: string): Promise<{
    backlog: number
    emAndamento: number
    pausado: number
    concluido: number
  }>

  /**
   * Count learning items grouped by category
   * @param userId - User unique identifier
   * @returns Array of category counts
   */
  countByCategory(
    userId: string
  ): Promise<Array<{ categoryId: string | null; count: number }>>

  /**
   * Calculate average progress for user's learning items
   * @param userId - User unique identifier
   * @param filters - Optional filters
   * @returns Average progress percentage
   */
  calculateAverageProgress(
    userId: string,
    filters?: {
      status?: StatusVO
      categoryId?: string
    }
  ): Promise<number>

  /**
   * Get recently updated learning items
   * @param userId - User unique identifier
   * @param limit - Maximum number of items to return
   * @returns Array of recently updated learning items
   */
  findRecentlyUpdated(userId: string, limit?: number): Promise<LearningItem[]>
}
