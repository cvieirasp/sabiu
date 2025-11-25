import { Module } from '@/core/entities/Module'

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
   * Delete a module by ID
   * @param id - Module unique identifier
   */
  delete(id: string): Promise<void>

  /**
   * Reorder modules for a learning item
   * @param learningItemId - Learning item unique identifier
   * @param moduleOrders - Array of module IDs with their new orders
   */
  reorder(
    learningItemId: string,
    moduleOrders: Array<{ id: string; order: number }>
  ): Promise<void>
}
