import { Dependency } from '../entities'
import {
  DependencyRepository,
  LearningItemRepository,
} from '../interfaces'

/**
 * Input DTO for LinkDependency use case
 */
export interface LinkDependencyInput {
  sourceItemId: string
  targetItemId: string
  userId: string
}

/**
 * Output DTO for LinkDependency use case
 */
export interface LinkDependencyOutput {
  dependency: Dependency
}

/**
 * LinkDependency Use Case
 *
 * Creates a dependency link between two learning items
 *
 * Business Rules:
 * - Both learning items must exist
 * - User must own both learning items
 * - Cannot create self-dependencies
 * - Cannot create circular dependencies
 * - Cannot create duplicate dependencies
 */
export class LinkDependency {
  constructor(
    private dependencyRepository: DependencyRepository,
    private learningItemRepository: LearningItemRepository
  ) {}

  async execute(
    input: LinkDependencyInput
  ): Promise<LinkDependencyOutput> {
    // Validate that items are different
    if (input.sourceItemId === input.targetItemId) {
      throw new Error('Cannot create dependency to self')
    }

    // Find source learning item
    const sourceItem = await this.learningItemRepository.findById(
      input.sourceItemId
    )

    if (!sourceItem) {
      throw new Error(`Source learning item with ID ${input.sourceItemId} not found`)
    }

    // Verify ownership of source
    if (sourceItem.userId !== input.userId) {
      throw new Error('User does not own the source learning item')
    }

    // Find target learning item
    const targetItem = await this.learningItemRepository.findById(
      input.targetItemId
    )

    if (!targetItem) {
      throw new Error(`Target learning item with ID ${input.targetItemId} not found`)
    }

    // Verify ownership of target
    if (targetItem.userId !== input.userId) {
      throw new Error('User does not own the target learning item')
    }

    // Check if dependency already exists
    const existingDependency = await this.dependencyRepository.findBySourceAndTarget(
      input.sourceItemId,
      input.targetItemId
    )

    if (existingDependency) {
      throw new Error('Dependency already exists between these learning items')
    }

    // Check for circular dependencies
    const wouldCreateCycle = await this.dependencyRepository.wouldCreateCycle(
      input.sourceItemId,
      input.targetItemId
    )

    if (wouldCreateCycle) {
      throw new Error('Cannot create dependency: would create circular dependency')
    }

    // Create dependency entity
    const dependency = Dependency.create({
      id: this.generateId(),
      sourceItemId: input.sourceItemId,
      targetItemId: input.targetItemId,
    })

    // Save dependency
    const createdDependency = await this.dependencyRepository.create(dependency)

    return {
      dependency: createdDependency,
    }
  }

  private generateId(): string {
    // This will be replaced with actual ID generation (e.g., cuid)
    return `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`
  }
}
