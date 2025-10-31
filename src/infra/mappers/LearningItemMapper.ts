import type { LearningItem as PrismaLearningItem, Module as PrismaModule } from '@prisma/client'
import { LearningItem } from '@/core/entities'
import { StatusVO, Progress } from '@/core/value-objects'
import { ModuleMapper } from './ModuleMapper'

/**
 * LearningItem with optional modules relation
 */
export type LearningItemWithModules = PrismaLearningItem & {
  modules?: PrismaModule[]
}

/**
 * LearningItem Mapper
 *
 * Maps between Prisma models and domain entities
 */
export class LearningItemMapper {
  /**
   * Convert Prisma model to Domain Entity
   */
  static toDomain(prisma: LearningItemWithModules): LearningItem {
    // Map status from Prisma enum to StatusVO
    const statusMap = {
      Backlog: StatusVO.fromBacklog(),
      Em_Andamento: StatusVO.fromEmAndamento(),
      Pausado: StatusVO.fromPausado(),
      Concluido: StatusVO.fromConcluido(),
    }

    const learningItem = LearningItem.reconstitute({
      id: prisma.id,
      title: prisma.title,
      descriptionMD: prisma.descriptionMD,
      dueDate: prisma.dueDate,
      status: statusMap[prisma.status],
      progress: Progress.create(prisma.progressCached),
      userId: prisma.userId,
      categoryId: prisma.categoryId,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    })

    // If modules are included, convert and set them
    if (prisma.modules) {
      const modules = ModuleMapper.toDomainMany(prisma.modules)
      learningItem.setModules(modules)
    }

    return learningItem
  }

  /**
   * Convert Domain Entity to Prisma input (for create/update)
   */
  static toPrisma(entity: LearningItem): Omit<PrismaLearningItem, 'createdAt' | 'updatedAt'> {
    // Map StatusVO to Prisma enum
    const statusMap = {
      Backlog: 'Backlog' as const,
      Em_Andamento: 'Em_Andamento' as const,
      Pausado: 'Pausado' as const,
      Concluido: 'Concluido' as const,
    }

    return {
      id: entity.id,
      title: entity.title,
      descriptionMD: entity.descriptionMD,
      dueDate: entity.dueDate,
      status: statusMap[entity.status.value],
      progressCached: entity.progress.value,
      userId: entity.userId,
      categoryId: entity.categoryId,
    }
  }

  /**
   * Convert multiple Prisma models to Domain Entities
   */
  static toDomainMany(prismaModels: LearningItemWithModules[]): LearningItem[] {
    return prismaModels.map((model) => this.toDomain(model))
  }

  /**
   * Convert multiple Domain Entities to Prisma inputs
   */
  static toPrismaMany(entities: LearningItem[]): Omit<PrismaLearningItem, 'createdAt' | 'updatedAt'>[] {
    return entities.map((entity) => this.toPrisma(entity))
  }
}
