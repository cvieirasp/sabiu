import { LearningItemRepository, ModuleRepository } from '../interfaces'

/**
 * Input DTO for CalculateProgress use case
 */
export interface CalculateProgressInput {
  learningItemId: string
  userId: string
}

/**
 * Output DTO for CalculateProgress use case
 */
export interface CalculateProgressOutput {
  progress: number
  completedModules: number
  totalModules: number
}

/**
 * CalculateProgress Use Case
 *
 * Recalculates and updates progress for a learning item
 *
 * Business Rules:
 * - Learning item must exist
 * - User must own the learning item
 * - Progress is calculated from completed modules
 * - Progress is persisted to the repository
 */
export class CalculateProgress {
  constructor(
    private learningItemRepository: LearningItemRepository,
    private moduleRepository: ModuleRepository
  ) {}

  async execute(
    input: CalculateProgressInput
  ): Promise<CalculateProgressOutput> {
    // Find learning item
    const learningItem = await this.learningItemRepository.findById(
      input.learningItemId
    )

    if (!learningItem) {
      throw new Error(`Learning item with ID ${input.learningItemId} not found`)
    }

    // Verify ownership
    if (learningItem.userId !== input.userId) {
      throw new Error('User does not own this learning item')
    }

    // Count total and completed modules
    const totalModules = await this.moduleRepository.count(input.learningItemId)
    const completedModules = await this.moduleRepository.countCompleted(
      input.learningItemId
    )

    // Calculate progress
    const progress =
      totalModules === 0 ? 0 : (completedModules / totalModules) * 100

    // Update progress in repository
    await this.learningItemRepository.updateProgress(
      input.learningItemId,
      progress
    )

    return {
      progress,
      completedModules,
      totalModules,
    }
  }
}
