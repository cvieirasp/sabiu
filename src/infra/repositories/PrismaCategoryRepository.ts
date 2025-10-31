import { PrismaClient } from '@prisma/client'
import { Category } from '@/core/entities'
import { CategoryRepository } from '@/core/interfaces'
import { CategoryMapper } from '../mappers'

/**
 * Prisma implementation of CategoryRepository
 */
export class PrismaCategoryRepository implements CategoryRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    if (!category) {
      return null
    }

    return CategoryMapper.toDomain(category)
  }

  async findByName(name: string): Promise<Category | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    })

    if (!category) {
      return null
    }

    return CategoryMapper.toDomain(category)
  }

  async findAll(options?: {
    orderBy?: 'name' | 'createdAt'
    order?: 'asc' | 'desc'
  }): Promise<Category[]> {
    const orderBy = options?.orderBy || 'name'
    const order = options?.order || 'asc'

    const categories = await this.prisma.category.findMany({
      orderBy: { [orderBy]: order },
    })

    return CategoryMapper.toDomainMany(categories)
  }

  async create(category: Category): Promise<Category> {
    const data = CategoryMapper.toPrisma(category)

    const created = await this.prisma.category.create({
      data,
    })

    return CategoryMapper.toDomain(created)
  }

  async update(category: Category): Promise<Category> {
    const data = CategoryMapper.toPrisma(category)

    const updated = await this.prisma.category.update({
      where: { id: category.id },
      data: {
        name: data.name,
        color: data.color,
      },
    })

    return CategoryMapper.toDomain(updated)
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.category.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async nameExists(name: string, excludeCategoryId?: string): Promise<boolean> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    })

    if (!category) {
      return false
    }

    if (excludeCategoryId && category.id === excludeCategoryId) {
      return false
    }

    return true
  }

  async count(): Promise<number> {
    return this.prisma.category.count()
  }

  async countItems(categoryId: string): Promise<number> {
    return this.prisma.learningItem.count({
      where: { categoryId },
    })
  }
}
