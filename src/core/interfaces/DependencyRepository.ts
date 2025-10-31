import { Dependency } from '../entities'

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
   * Find a specific dependency relationship
   * @param sourceItemId - Source learning item ID
   * @param targetItemId - Target learning item ID
   * @returns Dependency if found, null otherwise
   */
  findBySourceAndTarget(
    sourceItemId: string,
    targetItemId: string
  ): Promise<Dependency | null>

  /**
   * Get all prerequisites for a learning item
   * (all items that this item depends on)
   * @param itemId - Learning item ID
   * @returns Array of dependencies
   */
  getPrerequisites(itemId: string): Promise<Dependency[]>

  /**
   * Get all dependents of a learning item
   * (all items that depend on this item)
   * @param itemId - Learning item ID
   * @returns Array of dependencies
   */
  getDependents(itemId: string): Promise<Dependency[]>

  /**
   * Create a new dependency
   * @param dependency - Dependency entity to create
   * @returns Created dependency
   */
  create(dependency: Dependency): Promise<Dependency>

  /**
   * Create multiple dependencies
   * @param dependencies - Array of dependency entities
   * @returns Array of created dependencies
   */
  createMany(dependencies: Dependency[]): Promise<Dependency[]>

  /**
   * Delete a dependency by ID
   * @param id - Dependency unique identifier
   * @returns True if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all dependencies for a learning item (both as source and target)
   * @param itemId - Learning item ID
   * @returns Number of deleted dependencies
   */
  deleteByItemId(itemId: string): Promise<number>

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
  wouldCreateCycle(
    sourceItemId: string,
    targetItemId: string
  ): Promise<boolean>

  /**
   * Get the full dependency graph for a set of items
   * @param itemIds - Array of learning item IDs
   * @returns Array of all dependencies between these items
   */
  getDependencyGraph(itemIds: string[]): Promise<Dependency[]>

  /**
   * Count dependencies for a learning item
   * @param itemId - Learning item ID
   * @param type - Count 'prerequisites' (as source) or 'dependents' (as target)
   * @returns Number of dependencies
   */
  count(itemId: string, type: 'prerequisites' | 'dependents'): Promise<number>
}
