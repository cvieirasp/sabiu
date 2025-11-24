import { Category } from '@/core/entities/Category'

/**
 * Category Repository Interface
 *
 * Defines the contract for category data access operations
 */
export interface CategoryRepository {
  /**
   * Find a category by ID
   * @param id - Category unique identifier
   * @returns Category if found, null otherwise
   */
  findById(id: string): Promise<Category | null>

  /**
   * Find a category by name
   * @param name - Category name
   * @returns Category if found, null otherwise
   */
  findByName(name: string): Promise<Category | null>

  /**
   * Find all categories
   * @param options - Filtering and ordering options
   * @returns Array of categories
   */
  findAll(options?: {
    orderBy?: 'name' | 'createdAt'
    order?: 'asc' | 'desc'
  }): Promise<Category[]>

  /**
   * Create a new category
   * @param category - Category entity to create
   * @returns Created category
   */
  create(category: Category): Promise<Category>

  /**
   * Update an existing category
   * @param category - Category entity with updated data
   * @returns Updated category
   */
  update(category: Category): Promise<Category>

  /**
   * Delete a category by ID
   * @param id - Category unique identifier
   * @returns True if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>
}
