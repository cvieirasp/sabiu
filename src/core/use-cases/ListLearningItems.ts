import { LearningItem } from '../entities'
import { StatusVO } from '../value-objects'
import { LearningItemRepository } from '../interfaces'

/**
 * Input DTO for ListLearningItems use case
 */
export interface ListLearningItemsInput {
  userId: string
  filters?: {
    status?: StatusVO
    categoryId?: string
    tagIds?: string[]
    search?: string
  }
  pagination?: {
    skip?: number
    take?: number
  }
  sorting?: {
    orderBy?:
      | 'title'
      | 'createdAt'
      | 'updatedAt'
      | 'dueDate'
      | 'progress'
      | 'status'
    order?: 'asc' | 'desc'
  }
  includeModules?: boolean
}

/**
 * Output DTO for ListLearningItems use case
 */
export interface ListLearningItemsOutput {
  learningItems: LearningItem[]
  total: number
}

/**
 * ListLearningItems Use Case
 *
 * Retrieves a paginated and filtered list of learning items
 *
 * Business Rules:
 * - Only returns learning items owned by the user
 * - Supports filtering by status, category, tags, and search query
 * - Supports pagination and sorting
 * - Optionally includes modules
 */
export class ListLearningItems {
  constructor(private learningItemRepository: LearningItemRepository) {}

  async execute(
    input: ListLearningItemsInput
  ): Promise<ListLearningItemsOutput> {
    // Build repository query options
    const options = {
      skip: input.pagination?.skip,
      take: input.pagination?.take,
      status: input.filters?.status,
      categoryId: input.filters?.categoryId,
      tagIds: input.filters?.tagIds,
      search: input.filters?.search,
      orderBy: input.sorting?.orderBy,
      order: input.sorting?.order,
      includeModules: input.includeModules ?? false,
    }

    // Fetch learning items
    const learningItems = await this.learningItemRepository.findByUserId(
      input.userId,
      options
    )

    // Get total count with same filters
    const total = await this.learningItemRepository.count(input.userId, {
      status: input.filters?.status,
      categoryId: input.filters?.categoryId,
    })

    return {
      learningItems,
      total,
    }
  }
}
