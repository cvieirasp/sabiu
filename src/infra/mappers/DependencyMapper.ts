import type { Dependency as PrismaDependency } from '@prisma/client'
import { Dependency } from '@/core/entities'

/**
 * Dependency Mapper
 *
 * Maps between Prisma models and domain entities
 */
export class DependencyMapper {
  /**
   * Convert Prisma model to Domain Entity
   */
  static toDomain(prisma: PrismaDependency): Dependency {
    return Dependency.reconstitute({
      id: prisma.id,
      sourceItemId: prisma.sourceItemId,
      targetItemId: prisma.targetItemId,
      createdAt: prisma.createdAt,
    })
  }

  /**
   * Convert Domain Entity to Prisma input (for create/update)
   */
  static toPrisma(entity: Dependency): Omit<PrismaDependency, 'createdAt'> {
    return {
      id: entity.id,
      sourceItemId: entity.sourceItemId,
      targetItemId: entity.targetItemId,
    }
  }

  /**
   * Convert multiple Prisma models to Domain Entities
   */
  static toDomainMany(prismaModels: PrismaDependency[]): Dependency[] {
    return prismaModels.map((model) => this.toDomain(model))
  }

  /**
   * Convert multiple Domain Entities to Prisma inputs
   */
  static toPrismaMany(entities: Dependency[]): Omit<PrismaDependency, 'createdAt'>[] {
    return entities.map((entity) => this.toPrisma(entity))
  }
}
