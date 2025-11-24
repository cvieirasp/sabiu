import {
  PrismaClient,
  ModuleStatus as PrismaModuleStatus,
} from '@prisma/client'
import { Module } from '@/core/entities/Module'
import { ModuleStatusVO } from '@/core/value-objects'
import { ModuleRepository } from '@/core/interfaces/ModuleRepository'
import { ModuleMapper } from '@/infra/mappers/ModuleMapper'

/**
 * Prisma implementation of ModuleRepository
 */
export class PrismaModuleRepository implements ModuleRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Module | null> {
    const prismaModule = await this.prisma.module.findUnique({
      where: { id },
    })

    if (!prismaModule) {
      return null
    }

    return ModuleMapper.toDomain(prismaModule)
  }

  async findByLearningItemId(
    learningItemId: string,
    options?: {
      orderBy?: 'order' | 'createdAt' | 'title'
      order?: 'asc' | 'desc'
    }
  ): Promise<Module[]> {
    const orderBy = options?.orderBy || 'order'
    const order = options?.order || 'asc'

    const modules = await this.prisma.module.findMany({
      where: { learningItemId },
      orderBy: { [orderBy]: order },
    })

    return ModuleMapper.toDomainMany(modules)
  }

  async findByStatus(
    learningItemId: string,
    status: ModuleStatusVO
  ): Promise<Module[]> {
    const modules = await this.prisma.module.findMany({
      where: {
        learningItemId,
        status: this.statusToPrisma(status),
      },
      orderBy: { order: 'asc' },
    })

    return ModuleMapper.toDomainMany(modules)
  }

  async create(module: Module): Promise<Module> {
    const data = ModuleMapper.toPrisma(module)

    const created = await this.prisma.module.create({
      data,
    })

    return ModuleMapper.toDomain(created)
  }

  async createMany(modules: Module[]): Promise<Module[]> {
    const data = ModuleMapper.toPrismaMany(modules)

    await this.prisma.module.createMany({
      data,
    })

    // Fetch the created modules to return them with timestamps
    const created = await this.prisma.module.findMany({
      where: {
        id: {
          in: modules.map(m => m.id),
        },
      },
      orderBy: { order: 'asc' },
    })

    return ModuleMapper.toDomainMany(created)
  }

  async update(module: Module): Promise<Module> {
    const data = ModuleMapper.toPrisma(module)

    const updated = await this.prisma.module.update({
      where: { id: module.id },
      data: {
        title: data.title,
        status: data.status,
        order: data.order,
      },
    })

    return ModuleMapper.toDomain(updated)
  }

  async updateMany(modules: Module[]): Promise<Module[]> {
    // Use transaction for atomic updates
    const updated = await this.prisma.$transaction(
      modules.map(module => {
        const data = ModuleMapper.toPrisma(module)
        return this.prisma.module.update({
          where: { id: module.id },
          data: {
            title: data.title,
            status: data.status,
            order: data.order,
          },
        })
      })
    )

    return ModuleMapper.toDomainMany(updated)
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.module.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async deleteByLearningItemId(learningItemId: string): Promise<number> {
    const result = await this.prisma.module.deleteMany({
      where: { learningItemId },
    })

    return result.count
  }

  async count(learningItemId: string): Promise<number> {
    return this.prisma.module.count({
      where: { learningItemId },
    })
  }

  async countCompleted(learningItemId: string): Promise<number> {
    return this.prisma.module.count({
      where: {
        learningItemId,
        status: PrismaModuleStatus.Concluido,
      },
    })
  }

  async reorder(
    learningItemId: string,
    moduleOrders: Array<{ id: string; order: number }>
  ): Promise<boolean> {
    try {
      await this.prisma.$transaction(
        moduleOrders.map(({ id, order }) =>
          this.prisma.module.update({
            where: { id, learningItemId },
            data: { order },
          })
        )
      )
      return true
    } catch {
      return false
    }
  }

  /**
   * Helper to convert ModuleStatusVO to Prisma enum
   */
  private statusToPrisma(status: ModuleStatusVO): PrismaModuleStatus {
    const statusMap = {
      Pendente: PrismaModuleStatus.Pendente,
      Em_Andamento: PrismaModuleStatus.Em_Andamento,
      Concluido: PrismaModuleStatus.Concluido,
    }

    return statusMap[status.value]
  }
}
