import {
  LearningItemRepository,
  DependencyRepository,
} from '../interfaces'

/**
 * Input DTO for DeleteLearningItem use case
 */
export interface DeleteLearningItemInput {
  id: string
  userId: string
}

/**
 * Output DTO for DeleteLearningItem use case
 */
export interface DeleteLearningItemOutput {
  success: boolean
}

/**
 * DeleteLearningItem Use Case
 *
 * Deletes a learning item and all related data
 *
 * Business Rules:
 * - Learning item must exist
 * - User must own the learning item
 * - Cascades to modules and dependencies
 */
export class DeleteLearningItem {
  constructor(
    private learningItemRepository: LearningItemRepository,
    private dependencyRepository: DependencyRepository
  ) {}

  async execute(
    input: DeleteLearningItemInput
  ): Promise<DeleteLearningItemOutput> {
    // Find existing learning item
    const existingItem = await this.learningItemRepository.findById(input.id)

    if (!existingItem) {
      throw new Error(`Learning item with ID ${input.id} not found`)
    }

    // Verify ownership
    if (existingItem.userId !== input.userId) {
      throw new Error('User does not own this learning item')
    }

    // Delete dependencies (both as source and target)
    await this.dependencyRepository.deleteByItemId(input.id)

    // Delete learning item (modules will be cascade deleted)
    const deleted = await this.learningItemRepository.delete(input.id)

    return {
      success: deleted,
    }
  }
}
