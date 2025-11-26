import { Tag } from '@/core//entities/Tag'

/**
 * Tag Repository Interface
 *
 * Defines the contract for tag data access operations
 */
export interface TagRepository {
  /**
   * Find a tag by ID
   * @param id - Tag unique identifier
   * @returns Tag if found, null otherwise
   */
  findById(id: string): Promise<Tag | null>

  /**
   * Find a tag by name
   * @param name - Tag name (normalized)
   * @returns Tag if found, null otherwise
   */
  findByName(name: string): Promise<Tag | null>

  /**
   * Find all tags
   * @param options - Filtering and ordering options
   * @returns Array of tags
   */
  findAll(options?: {
    orderBy?: 'name' | 'createdAt'
    order?: 'asc' | 'desc'
  }): Promise<Tag[]>

  /**
   * Find tags by IDs
   * @param ids - Array of tag IDs
   * @returns Array of tags
   */
  findByIds(ids: string[]): Promise<Tag[]>

  /**
   * Search tags by name pattern
   * @param pattern - Search pattern
   * @param limit - Maximum number of results
   * @returns Array of matching tags
   */
  searchByName(pattern: string, limit?: number): Promise<Tag[]>

  /**
   * Create a new tag
   * @param tag - Tag entity to create
   * @returns Created tag
   */
  create(tag: Tag): Promise<Tag>

  /**
   * Update an existing tag
   * @param tag - Tag entity with updated data
   * @returns Updated tag
   */
  update(tag: Tag): Promise<Tag>

  /**
   * Delete a tag by ID
   * @param id - Tag unique identifier
   * @returns True if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>

  /**
   * Check if tag name already exists
   * @param name - Tag name to check
   * @param excludeTagId - Optional tag ID to exclude from check
   * @returns True if name exists, false otherwise
   */
  nameExists(name: string, excludeTagId?: string): Promise<boolean>

  /**
   * Count total tags
   * @returns Total number of tags
   */
  count(): Promise<number>

  /**
   * Count learning items by tag
   * @param tagId - Tag unique identifier
   * @returns Number of learning items with this tag
   */
  countItems(tagId: string): Promise<number>

  /**
   * Find most used tags
   * @param limit - Maximum number of tags to return
   * @returns Array of tags with usage count
   */
  findMostUsed(limit?: number): Promise<Array<{ tag: Tag; count: number }>>
}
