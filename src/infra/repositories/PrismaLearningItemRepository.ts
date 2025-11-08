import { PrismaClient, Status as PrismaStatus } from '@prisma/client'
import { LearningItem } from '@/core/entities'
import { StatusVO } from '@/core/value-objects'
import { LearningItemRepository } from '@/core/interfaces'
import { LearningItemMapper } from '../mappers'

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
    const where: any = { userId }

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
    let orderBy: any = { createdAt: 'desc' }
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
    const where: any = {
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
    const where: any = {
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
    const where: any = {
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

  async updateProgress(id: string, progress: number): Promise<boolean> {
    try {
      await this.prisma.learningItem.update({
        where: { id },
        data: { progressCached: progress },
      })
      return true
    } catch {
      return false
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.learningItem.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async count(
    userId: string,
    filters?: {
      status?: StatusVO
      categoryId?: string
    }
  ): Promise<number> {
    const where: any = { userId }

    if (filters?.status) {
      where.status = this.statusToPrisma(filters.status)
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }

    return this.prisma.learningItem.count({ where })
  }

  async countByStatus(userId: string): Promise<{
    backlog: number
    emAndamento: number
    pausado: number
    concluido: number
  }> {
    const [backlog, emAndamento, pausado, concluido] = await Promise.all([
      this.prisma.learningItem.count({
        where: { userId, status: PrismaStatus.Backlog },
      }),
      this.prisma.learningItem.count({
        where: { userId, status: PrismaStatus.Em_Andamento },
      }),
      this.prisma.learningItem.count({
        where: { userId, status: PrismaStatus.Pausado },
      }),
      this.prisma.learningItem.count({
        where: { userId, status: PrismaStatus.Concluido },
      }),
    ])

    return { backlog, emAndamento, pausado, concluido }
  }

  async countByCategory(
    userId: string
  ): Promise<Array<{ categoryId: string | null; count: number }>> {
    const result = await this.prisma.learningItem.groupBy({
      by: ['categoryId'],
      where: { userId },
      _count: true,
    })

    return result.map(r => ({
      categoryId: r.categoryId,
      count: r._count,
    }))
  }

  async calculateAverageProgress(
    userId: string,
    filters?: {
      status?: StatusVO
      categoryId?: string
    }
  ): Promise<number> {
    const where: any = { userId }

    if (filters?.status) {
      where.status = this.statusToPrisma(filters.status)
    }

    if (filters?.categoryId) {
      where.categoryId = filters.categoryId
    }

    const result = await this.prisma.learningItem.aggregate({
      where,
      _avg: {
        progressCached: true,
      },
    })

    return result._avg.progressCached || 0
  }

  async findRecentlyUpdated(
    userId: string,
    limit: number = 10
  ): Promise<LearningItem[]> {
    const learningItems = await this.prisma.learningItem.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      include: {
        modules: { orderBy: { order: 'asc' } },
      },
    })

    return LearningItemMapper.toDomainMany(learningItems)
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
