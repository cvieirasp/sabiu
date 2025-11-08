import { LearningItem } from '../entities'
import { StatusVO } from '../value-objects'
import {
  LearningItemRepository,
  ModuleRepository,
  CategoryRepository,
} from '../interfaces'

/**
 * Input DTO for UpdateLearningItem use case
 */
export interface UpdateLearningItemInput {
  id: string
  userId: string
  title?: string
  descriptionMD?: string
  dueDate?: Date | null
  status?: StatusVO
  categoryId: string
}

/**
 * Output DTO for UpdateLearningItem use case
 */
export interface UpdateLearningItemOutput {
  learningItem: LearningItem
}

/**
 * UpdateLearningItem Use Case
 *
 * Updates an existing learning item
 *
 * Business Rules:
 * - Learning item must exist
 * - User must own the learning item
 * - Category must exist if provided
 * - Status transitions must be valid
 * - Progress is recalculated if modules change
 */
export class UpdateLearningItem {
  constructor(
    private learningItemRepository: LearningItemRepository,
    private moduleRepository: ModuleRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async execute(
    input: UpdateLearningItemInput
  ): Promise<UpdateLearningItemOutput> {
    // Find existing learning item
    const existingItem = await this.learningItemRepository.findById(
      input.id,
      true // include modules
    )

    if (!existingItem) {
      throw new Error(`Learning item with ID ${input.id} not found`)
    }

    // Verify ownership
    if (existingItem.userId !== input.userId) {
      throw new Error('User does not own this learning item')
    }

    // Validate category if provided
    if (input.categoryId !== undefined && input.categoryId !== null) {
      const categoryExists = await this.categoryRepository.findById(
        input.categoryId
      )
      if (!categoryExists) {
        throw new Error(`Category with ID ${input.categoryId} not found`)
      }
    }

    // Load modules for progress calculation
    const modules = await this.moduleRepository.findByLearningItemId(input.id)
    existingItem.setModules(modules)

    // Update fields
    if (input.title !== undefined) {
      existingItem.updateTitle(input.title)
    }

    if (input.descriptionMD !== undefined) {
      existingItem.updateDescription(input.descriptionMD)
    }

    if (input.dueDate !== undefined) {
      existingItem.updateDueDate(input.dueDate)
    }

    if (input.status !== undefined) {
      existingItem.updateStatus(input.status)
    }

    if (input.categoryId !== undefined) {
      existingItem.updateCategory(input.categoryId)
    }

    // Save updated item
    const updatedItem = await this.learningItemRepository.update(existingItem)

    return {
      learningItem: updatedItem,
    }
  }
}
