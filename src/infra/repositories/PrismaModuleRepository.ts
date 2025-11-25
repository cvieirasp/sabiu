import {
  PrismaClient,
} from '@prisma/client'
import { Module } from '@/core/entities/Module'
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

  async delete(id: string): Promise<void> {
    await this.prisma.module.delete({
        where: { id },
    })
  }

  async reorder(
    learningItemId: string,
    moduleOrders: Array<{ id: string; order: number }>
  ): Promise<void> {
    await this.prisma.$transaction(
      moduleOrders.map(({ id, order }) =>
        this.prisma.module.update({
          where: { id, learningItemId },
          data: { order },
        })
      )
    )
  }
}
