import { Dependency } from '@/core/entities/Dependency'

/**
 * Dependency Repository Interface
 *
 * Defines the contract for dependency data access operations
 * Manages prerequisite relationships between learning items
 */
export interface DependencyRepository {
  /**
   * Find a dependency by ID
   * @param id - Dependency unique identifier
   * @returns Dependency if found, null otherwise
   */
  findById(id: string): Promise<Dependency | null>

  /**
   * Find all dependencies where the item is the source (depends on others)
   * @param sourceItemId - Learning item ID
   * @returns Array of dependencies
   */
  findBySourceItemId(sourceItemId: string): Promise<Dependency[]>

  /**
   * Find all dependencies where the item is the target (required by others)
   * @param targetItemId - Learning item ID
   * @returns Array of dependencies
   */
  findByTargetItemId(targetItemId: string): Promise<Dependency[]>

  /**
   * Create a new dependency
   * @param dependency - Dependency entity to create
   * @returns Created dependency
   */
  create(dependency: Dependency): Promise<Dependency>

  /**
   * Delete a dependency by ID
   * @param id - Dependency unique identifier
   */
  delete(id: string): Promise<void>

  /**
   * Check if a dependency already exists
   * @param sourceItemId - Source learning item ID
   * @param targetItemId - Target learning item ID
   * @returns True if dependency exists, false otherwise
   */
  exists(sourceItemId: string, targetItemId: string): Promise<boolean>

  /**
   * Check if creating a dependency would create a circular reference
   * This checks the entire dependency chain to prevent cycles
   * @param sourceItemId - Source learning item ID
   * @param targetItemId - Target learning item ID
   * @returns True if it would create a cycle, false otherwise
   */
  wouldCreateCycle(sourceItemId: string, targetItemId: string): Promise<boolean>
}
