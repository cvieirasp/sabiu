import type { Module as PrismaModule } from '@prisma/client'
import { Module } from '@/core/entities/Module'
import { ModuleStatusVO } from '@/core/value-objects'

/**
 * Module Mapper
 *
 * Maps between Prisma models and domain entities
 */
export class ModuleMapper {
  /**
   * Convert Prisma model to Domain Entity
   */
  static toDomain(prisma: PrismaModule): Module {
    // Map status from Prisma enum to ModuleStatusVO
    const statusMap = {
      Pendente: ModuleStatusVO.fromPendente(),
      Em_Andamento: ModuleStatusVO.fromEmAndamento(),
      Concluido: ModuleStatusVO.fromConcluido(),
    }

    return Module.reconstitute({
      id: prisma.id,
      learningItemId: prisma.learningItemId,
      title: prisma.title,
      status: statusMap[prisma.status],
      order: prisma.order,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    })
  }

  /**
   * Convert Domain Entity to Prisma input (for create/update)
   */
  static toPrisma(
    entity: Module
  ): Omit<PrismaModule, 'createdAt' | 'updatedAt'> {
    // Map ModuleStatusVO to Prisma enum
    const statusMap = {
      Pendente: 'Pendente' as const,
      Em_Andamento: 'Em_Andamento' as const,
      Concluido: 'Concluido' as const,
    }

    return {
      id: entity.id,
      learningItemId: entity.learningItemId,
      title: entity.title,
      status: statusMap[entity.status.value],
      order: entity.order,
    }
  }

  /**
   * Convert multiple Prisma models to Domain Entities
   */
  static toDomainMany(prismaModels: PrismaModule[]): Module[] {
    return prismaModels.map(model => this.toDomain(model))
  }

  /**
   * Convert multiple Domain Entities to Prisma inputs
   */
  static toPrismaMany(
    entities: Module[]
  ): Omit<PrismaModule, 'createdAt' | 'updatedAt'>[] {
    return entities.map(entity => this.toPrisma(entity))
  }
}
