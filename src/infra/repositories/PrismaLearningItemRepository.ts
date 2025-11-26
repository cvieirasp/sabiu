import { Prisma, PrismaClient, Status as PrismaStatus } from '@prisma/client'
import { LearningItem } from '@/core/entities/LearningItem'
import { StatusVO } from '@/core/value-objects/Status'
import { LearningItemRepository } from '@/core/interfaces/LearningItemRepository'
import { LearningItemMapper } from '@/infra/mappers/LearningItemMapper'

/**
 * Prisma implementation of LearningItemRepository
 *
 * Handles all data persistence operations for learning items using Prisma ORM
 */
export class PrismaLearningItemRepository implements LearningItemRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(
    id: string,
    includeModules: boolean = false
  ): Promise<LearningItem | null> {
    const learningItem = await this.prisma.learningItem.findUnique({
      where: { id },
      include: {
        modules: includeModules ? { orderBy: { order: 'asc' } } : false,
      },
    })

    if (!learningItem) {
      return null
    }

    return LearningItemMapper.toDomain(learningItem)
  }

  async findByUserId(
    userId: string,
    options?: {
      skip?: number
      take?: number
      status?: StatusVO
      categoryId?: string
      tagIds?: string[]
      search?: string
      orderBy?:
        | 'title'
        | 'createdAt'
        | 'updatedAt'
        | 'dueDate'
        | 'progress'
        | 'status'
      order?: 'asc' | 'desc'
      includeModules?: boolean
    }
  ): Promise<LearningItem[]> {
    const where: Prisma.LearningItemWhereInput = { userId }

    // Apply filters
    if (options?.status) {
      where.status = this.statusToPrisma(options.status)
    }

    if (options?.categoryId) {
      where.categoryId = options.categoryId
    }

    if (options?.tagIds && options.tagIds.length > 0) {
      where.tags = {
        some: {
          tagId: {
            in: options.tagIds,
          },
        },
      }
    }

    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { descriptionMD: { contains: options.search, mode: 'insensitive' } },
      ]
    }

    // Build orderBy
    let orderBy: Prisma.LearningItemOrderByWithRelationInput = { createdAt: 'desc' }
    if (options?.orderBy) {
      const orderByField =
        options.orderBy === 'progress' ? 'progressCached' : options.orderBy
      orderBy = { [orderByField]: options.order || 'desc' }
    }

    const learningItems = await this.prisma.learningItem.findMany({
      where,
      skip: options?.skip,
      take: options?.take,
      orderBy,
      include: {
        modules: options?.includeModules
          ? { orderBy: { order: 'asc' } }
          : false,
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async findByStatus(
    userId: string,
    status: StatusVO,
    options?: {
      categoryId?: string
      includeModules?: boolean
    }
  ): Promise<LearningItem[]> {
    const where: Prisma.LearningItemWhereInput = {
      userId,
      status: this.statusToPrisma(status),
    }

    if (options?.categoryId) {
      where.categoryId = options.categoryId
    }

    const learningItems = await this.prisma.learningItem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        modules: options?.includeModules
          ? { orderBy: { order: 'asc' } }
          : false,
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async findByCategory(
    userId: string,
    categoryId: string,
    options?: {
      status?: StatusVO
      includeModules?: boolean
    }
  ): Promise<LearningItem[]> {
    const where: Prisma.LearningItemWhereInput = {
      userId,
      categoryId,
    }

    if (options?.status) {
      where.status = this.statusToPrisma(options.status)
    }

    const learningItems = await this.prisma.learningItem.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      include: {
        modules: options?.includeModules
          ? { orderBy: { order: 'asc' } }
          : false,
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async findByTags(
    userId: string,
    tagIds: string[],
    matchAll: boolean = false
  ): Promise<LearningItem[]> {
    if (matchAll) {
      // Find items that have all the specified tags
      const learningItems = await this.prisma.learningItem.findMany({
        where: {
          userId,
          AND: tagIds.map(tagId => ({
            tags: {
              some: {
                tagId,
              },
            },
          })),
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          modules: { orderBy: { order: 'asc' } },
        },
      })

      return LearningItemMapper.toDomainMany(learningItems)
    } else {
      // Find items that have any of the specified tags
      const learningItems = await this.prisma.learningItem.findMany({
        where: {
          userId,
          tags: {
            some: {
              tagId: {
                in: tagIds,
              },
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
        include: {
          modules: { orderBy: { order: 'asc' } },
        },
      })

      return LearningItemMapper.toDomainMany(learningItems)
    }
  }

  async findOverdue(userId: string): Promise<LearningItem[]> {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const learningItems = await this.prisma.learningItem.findMany({
      where: {
        userId,
        dueDate: {
          lt: now,
        },
        status: {
          not: PrismaStatus.Concluido,
        },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async findDueSoon(
    userId: string,
    daysThreshold: number = 7
  ): Promise<LearningItem[]> {
    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const threshold = new Date(now)
    threshold.setDate(threshold.getDate() + daysThreshold)

    const learningItems = await this.prisma.learningItem.findMany({
      where: {
        userId,
        dueDate: {
          gte: now,
          lte: threshold,
        },
        status: {
          not: PrismaStatus.Concluido,
        },
      },
      orderBy: { dueDate: 'asc' },
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async findNearCompletion(
    userId: string,
    progressThreshold: number = 80,
    limit: number = 10
  ): Promise<LearningItem[]> {
    const learningItems = await this.prisma.learningItem.findMany({
      where: {
        userId,
        progressCached: {
          gte: progressThreshold,
        },
        status: {
          not: PrismaStatus.Concluido,
        },
      },
      orderBy: { progressCached: 'desc' },
      take: limit,
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async search(
    userId: string,
    query: string,
    options?: {
      status?: StatusVO
      categoryId?: string
      limit?: number
    }
  ): Promise<LearningItem[]> {
    const where: Prisma.LearningItemWhereInput = {
      userId,
      OR: [
        { title: { contains: query, mode: 'insensitive' } },
        { descriptionMD: { contains: query, mode: 'insensitive' } },
      ],
    }

    if (options?.status) {
      where.status = this.statusToPrisma(options.status)
    }

    if (options?.categoryId) {
      where.categoryId = options.categoryId
    }

    const learningItems = await this.prisma.learningItem.findMany({
      where,
      take: options?.limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
  }

  async create(item: LearningItem): Promise<LearningItem> {
    const data = LearningItemMapper.toPrisma(item)

    const created = await this.prisma.learningItem.create({
      data,
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomain(created)
  }

  async update(item: LearningItem): Promise<LearningItem> {
    const data = LearningItemMapper.toPrisma(item)

    const updated = await this.prisma.learningItem.update({
      where: { id: item.id },
      data: {
        title: data.title,
        descriptionMD: data.descriptionMD,
        dueDate: data.dueDate,
        status: data.status,
        progressCached: data.progressCached,
        categoryId: data.categoryId,
      },
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomain(updated)
  }

  async updateProgress(id: string, progress: number): Promise<number> {
    await this.prisma.learningItem.update({
      where: { id },
      data: { progressCached: progress },
    })
    return progress
  }

  async delete(id: string): Promise<void> {
    await this.prisma.learningItem.delete({
      where: { id },
    })
  }

  /**
   * Helper to convert StatusVO to Prisma enum
   */
  private statusToPrisma(status: StatusVO): PrismaStatus {
    const statusMap = {
      Backlog: PrismaStatus.Backlog,
      Em_Andamento: PrismaStatus.Em_Andamento,
      Pausado: PrismaStatus.Pausado,
      Concluido: PrismaStatus.Concluido,
    }

    return statusMap[status.value]
  }
}
