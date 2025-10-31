import { Module } from '../entities'
import { ModuleStatusVO } from '../value-objects'

/**
 * Module Repository Interface
 *
 * Defines the contract for module data access operations
 */
export interface ModuleRepository {
  /**
   * Find a module by ID
   * @param id - Module unique identifier
   * @returns Module if found, null otherwise
   */
  findById(id: string): Promise<Module | null>

  /**
   * Find all modules for a learning item
   * @param learningItemId - Learning item unique identifier
   * @param options - Ordering options
   * @returns Array of modules ordered by order field
   */
  findByLearningItemId(
    learningItemId: string,
    options?: {
      orderBy?: 'order' | 'createdAt' | 'title'
      order?: 'asc' | 'desc'
    }
  ): Promise<Module[]>

  /**
   * Find modules by status for a learning item
   * @param learningItemId - Learning item unique identifier
   * @param status - Module status
   * @returns Array of modules with specified status
   */
  findByStatus(
    learningItemId: string,
    status: ModuleStatusVO
  ): Promise<Module[]>

  /**
   * Create a new module
   * @param module - Module entity to create
   * @returns Created module
   */
  create(module: Module): Promise<Module>

  /**
   * Create multiple modules
   * @param modules - Array of module entities to create
   * @returns Array of created modules
   */
  createMany(modules: Module[]): Promise<Module[]>

  /**
   * Update an existing module
   * @param module - Module entity with updated data
   * @returns Updated module
   */
  update(module: Module): Promise<Module>

  /**
   * Update multiple modules
   * @param modules - Array of module entities to update
   * @returns Array of updated modules
   */
  updateMany(modules: Module[]): Promise<Module[]>

  /**
   * Delete a module by ID
   * @param id - Module unique identifier
   * @returns True if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>

  /**
   * Delete all modules for a learning item
   * @param learningItemId - Learning item unique identifier
   * @returns Number of deleted modules
   */
  deleteByLearningItemId(learningItemId: string): Promise<number>

  /**
   * Count modules for a learning item
   * @param learningItemId - Learning item unique identifier
   * @returns Total number of modules
   */
  count(learningItemId: string): Promise<number>

  /**
   * Count completed modules for a learning item
   * @param learningItemId - Learning item unique identifier
   * @returns Number of completed modules
   */
  countCompleted(learningItemId: string): Promise<number>

  /**
   * Reorder modules for a learning item
   * @param learningItemId - Learning item unique identifier
   * @param moduleOrders - Array of module IDs with their new orders
   * @returns True if reordered successfully
   */
  reorder(
    learningItemId: string,
    moduleOrders: Array<{ id: string; order: number }>
  ): Promise<boolean>
}
