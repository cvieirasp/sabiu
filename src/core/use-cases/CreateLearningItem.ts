import { LearningItem, Module } from '../entities'
import { StatusVO, Progress } from '../value-objects'
import {
  LearningItemRepository,
  ModuleRepository,
  CategoryRepository,
} from '../interfaces'

/**
 * Input DTO for CreateLearningItem use case
 */
export interface CreateLearningItemInput {
  title: string
  descriptionMD: string
  dueDate?: Date | null
  status?: StatusVO
  userId: string
  categoryId?: string | null
  modules?: Array<{
    title: string
    order: number
  }>
}

/**
 * Output DTO for CreateLearningItem use case
 */
export interface CreateLearningItemOutput {
  learningItem: LearningItem
  modules: Module[]
}

/**
 * CreateLearningItem Use Case
 *
 * Creates a new learning item with optional modules
 *
 * Business Rules:
 * - Title is required and must be valid
 * - User ID is required
 * - Category must exist if provided
 * - Modules are optional but validated if provided
 * - Initial progress is 0%
 * - Default status is Backlog
 */
export class CreateLearningItem {
  constructor(
    private learningItemRepository: LearningItemRepository,
    private moduleRepository: ModuleRepository,
    private categoryRepository: CategoryRepository
  ) {}

  async execute(
    input: CreateLearningItemInput
  ): Promise<CreateLearningItemOutput> {
    // Validate category exists if provided
    if (input.categoryId) {
      const categoryExists = await this.categoryRepository.findById(
        input.categoryId
      )
      if (!categoryExists) {
        throw new Error(`Category with ID ${input.categoryId} not found`)
      }
    }

    // Create learning item entity
    const learningItem = LearningItem.create({
      id: this.generateId(),
      title: input.title,
      descriptionMD: input.descriptionMD,
      dueDate: input.dueDate || null,
      status: input.status || StatusVO.fromBacklog(),
      progress: Progress.fromZero(),
      userId: input.userId,
      categoryId: input.categoryId || null,
    })

    // Save learning item
    const createdItem = await this.learningItemRepository.create(learningItem)

    // Create modules if provided
    const createdModules: Module[] = []
    if (input.modules && input.modules.length > 0) {
      const modules = input.modules.map((moduleData) =>
        Module.create({
          id: this.generateId(),
          learningItemId: createdItem.id,
          title: moduleData.title,
          order: moduleData.order,
        })
      )

      const savedModules = await this.moduleRepository.createMany(modules)
      createdModules.push(...savedModules)

      // Set modules on the learning item to recalculate progress
      createdItem.setModules(savedModules)

      // Update progress if needed
      if (createdItem.progress.value > 0) {
        await this.learningItemRepository.updateProgress(
          createdItem.id,
          createdItem.progress.value
        )
      }
    }

    return {
      learningItem: createdItem,
      modules: createdModules,
    }
  }

  private generateId(): string {
    // This will be replaced with actual ID generation (e.g., cuid)
    return `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}
