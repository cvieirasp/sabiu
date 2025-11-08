import type { Tag as PrismaTag } from '@prisma/client'
import { Tag } from '@/core/entities'

/**
 * Tag Mapper
 *
 * Maps between Prisma models and domain entities
 */
export class TagMapper {
  /**
   * Convert Prisma model to Domain Entity
   */
  static toDomain(prisma: PrismaTag): Tag {
    return Tag.reconstitute({
      id: prisma.id,
      name: prisma.name,
    })
  }

  /**
   * Convert Domain Entity to Prisma input (for create/update)
   */
  static toPrisma(entity: Tag): PrismaTag {
    return {
      id: entity.id,
      name: entity.name,
    }
  }

  /**
   * Convert multiple Prisma models to Domain Entities
   */
  static toDomainMany(prismaModels: PrismaTag[]): Tag[] {
    return prismaModels.map(model => this.toDomain(model))
  }

  /**
   * Convert multiple Domain Entities to Prisma inputs
   */
  static toPrismaMany(entities: Tag[]): PrismaTag[] {
    return entities.map(entity => this.toPrisma(entity))
  }
}
