import type { Category as PrismaCategory } from '@prisma/client'
import { Category } from '@/core/entities'

/**
 * Category Mapper
 *
 * Maps between Prisma models and domain entities
 */
export class CategoryMapper {
  /**
   * Convert Prisma model to Domain Entity
   */
  static toDomain(prisma: PrismaCategory): Category {
    return Category.reconstitute({
      id: prisma.id,
      name: prisma.name,
      color: prisma.color,
    })
  }

  /**
   * Convert Domain Entity to Prisma input (for create/update)
   */
  static toPrisma(entity: Category): PrismaCategory {
    return {
      id: entity.id,
      name: entity.name,
      color: entity.color,
    }
  }

  /**
   * Convert multiple Prisma models to Domain Entities
   */
  static toDomainMany(prismaModels: PrismaCategory[]): Category[] {
    return prismaModels.map((model) => this.toDomain(model))
  }

  /**
   * Convert multiple Domain Entities to Prisma inputs
   */
  static toPrismaMany(entities: Category[]): PrismaCategory[] {
    return entities.map((entity) => this.toPrisma(entity))
  }
}
