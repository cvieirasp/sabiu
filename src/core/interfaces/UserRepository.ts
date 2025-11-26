import { User } from '@/core/entities/User'
import { Email } from '@/core/value-objects/Email'

/**
 * User Repository Interface
 *
 * Defines the contract for user data access operations
 * Following Repository Pattern and Dependency Inversion Principle
 */
export interface UserRepository {
  /**
   * Find a user by ID
   * @param id - User unique identifier
   * @returns User if found, null otherwise
   */
  findById(id: string): Promise<User | null>

  /**
   * Find a user by email
   * @param email - User email
   * @returns User if found, null otherwise
   */
  findByEmail(email: Email): Promise<User | null>

  /**
   * Find all users with optional pagination
   * @param options - Pagination and filtering options
   * @returns Array of users
   */
  findAll(options?: {
    skip?: number
    take?: number
    orderBy?: 'name' | 'email' | 'createdAt'
    order?: 'asc' | 'desc'
  }): Promise<User[]>

  /**
   * Create a new user
   * @param user - User entity to create
   * @returns Created user
   */
  create(user: User): Promise<User>

  /**
   * Update an existing user
   * @param user - User entity with updated data
   * @returns Updated user
   */
  update(user: User): Promise<User>

  /**
   * Delete a user by ID
   * @param id - User unique identifier
   * @returns True if deleted, false otherwise
   */
  delete(id: string): Promise<boolean>

  /**
   * Check if email already exists
   * @param email - Email to check
   * @param excludeUserId - Optional user ID to exclude from check (for updates)
   * @returns True if email exists, false otherwise
   */
  emailExists(email: Email, excludeUserId?: string): Promise<boolean>

  /**
   * Count total users
   * @returns Total number of users
   */
  count(): Promise<number>
}
