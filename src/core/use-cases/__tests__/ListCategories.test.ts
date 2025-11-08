import { describe, it, expect, beforeEach, vi } from 'vitest'
import { Category } from '@/core/entities'
import type { CategoryRepository } from '@/core/interfaces/CategoryRepository'
import { ListCategories, CategoryOutput } from '@/core/use-cases/ListCategories'

describe('ListCategories', () => {
  let listCategories: ListCategories
  let mockCategoryRepository: CategoryRepository
  let mockCategories: Category[]

  beforeEach(() => {
    // Create mock categories
    mockCategories = [
      Category.create({
        id: 'cat-1',
        name: 'MBA',
        color: '#FF5733',
      }),
      Category.create({
        id: 'cat-2',
        name: 'Curso',
        color: '#33FF57',
      }),
      Category.create({
        id: 'cat-3',
        name: 'Livro',
        color: '#3357FF',
      }),
    ]

    // Mock repository
    mockCategoryRepository = {
      findAll: async () => mockCategories,
    } as Partial<CategoryRepository> as CategoryRepository

    listCategories = new ListCategories(mockCategoryRepository)
  })

  describe('execute', () => {
    it('should return a list of categories', async () => {
      const result: CategoryOutput[] = await listCategories.execute()
      expect(result).toHaveLength(3)
      expect(result).toEqual([
        { id: 'cat-1', name: 'MBA', color: '#FF5733' },
        { id: 'cat-2', name: 'Curso', color: '#33FF57' },
        { id: 'cat-3', name: 'Livro', color: '#3357FF' },
      ])
    })

    it('should return an empty list when there are no categories', async () => {
      // Override mock to return empty array
      mockCategoryRepository.findAll = async () => []
      const result: CategoryOutput[] = await listCategories.execute()
      expect(result).toHaveLength(0)
      expect(result).toEqual([])
    })

    it('should map category entities to output DTOs correctly', async () => {
      const result: CategoryOutput[] = await listCategories.execute()
      result.forEach((categoryDTO, index) => {
        expect(categoryDTO.id).toBe(mockCategories[index].id)
        expect(categoryDTO.name).toBe(mockCategories[index].name)
        expect(categoryDTO.color).toBe(mockCategories[index].color)
      })
    })

    it('should call the repository to fetch categories', async () => {
      const findAllSpy = vi.spyOn(mockCategoryRepository, 'findAll')
      await listCategories.execute()
      expect(findAllSpy).toHaveBeenCalledTimes(1)
    })
  })
})
