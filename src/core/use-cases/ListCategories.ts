import { CategoryRepository } from '@/core/interfaces/CategoryRepository'

/**
 * Output DTO for ListCategories use case
 */
export interface CategoryOutput {
  id: string
  name: string
  color: string
}

/**
 * ListCategories Use Case
 *
 * Retrieves list of all categories
 *
 * Business Rules:
  * - Categories are ordered by name ascending by default
 */
export class ListCategories {
  constructor(private categoryRepository: CategoryRepository) {}

  async execute(): Promise<CategoryOutput[]> {
    const categories = await this.categoryRepository.findAll()
    const categoryDTOs = categories.map((category) => ({
      id: category.id,
      name: category.name,
      color: category.color,
    }))
    return categoryDTOs
  }
}
