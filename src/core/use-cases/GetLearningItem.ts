import { LearningItemQueryRepository } from '@/core/interfaces/LearningItemQueryRepository'

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
  id: string
  title: string
  descriptionMD: string
  dueDate: Date | null
  status: string
  progress: number
  userId: string
  category: {
    id: string
    name: string
    color: string
  }
  createdAt: Date
  updatedAt: Date | null
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
  constructor(
    private learningItemQueryRepository: LearningItemQueryRepository,
  ) {}

  async execute(input: GetLearningItemInput): Promise<GetLearningItemOutput> {
    // Find learning item by ID
    const learningItem = await this.learningItemQueryRepository.findById(
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

    // Map to output DTO
    const learningItemOutput: GetLearningItemOutput = {
      id: learningItem.id,
      title: learningItem.title,
      descriptionMD: learningItem.descriptionMD,
      dueDate: learningItem.dueDate,
      status: learningItem.status,
      progress: learningItem.progress,
      userId: learningItem.userId,
      category: learningItem.category,
      createdAt: learningItem.createdAt,
      updatedAt: learningItem.updatedAt,
    }

    return learningItemOutput
  }
}
