import { LearningItem } from '../entities'
import { LearningItemRepository } from '../interfaces'

/**
 * Input DTO for GetLearningItem use case
 */
export interface GetLearningItemInput {
  id: string
  userId: string
  includeModules?: boolean
}

/**
 * Output DTO for GetLearningItem use case
 */
export interface GetLearningItemOutput {
  learningItem: LearningItem
}

/**
 * GetLearningItem Use Case
 *
 * Retrieves a single learning item with optional modules
 *
 * Business Rules:
 * - Learning item must exist
 * - User must own the learning item
 * - Modules can be optionally included
 */
export class GetLearningItem {
  constructor(private learningItemRepository: LearningItemRepository) {}

  async execute(
    input: GetLearningItemInput
  ): Promise<GetLearningItemOutput> {
    // Find learning item by ID
    const learningItem = await this.learningItemRepository.findById(
      input.id,
      input.includeModules ?? false
    )

    if (!learningItem) {
      throw new Error(`Learning item with ID ${input.id} not found`)
    }

    // Verify ownership
    if (learningItem.userId !== input.userId) {
      throw new Error('User does not own this learning item')
    }

    return {
      learningItem,
    }
  }
}
