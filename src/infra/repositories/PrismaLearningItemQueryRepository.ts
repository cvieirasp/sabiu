import { Prisma, PrismaClient, Status as PrismaStatus } from '@prisma/client'
import { StatusVO } from '@/core/value-objects/Status'
import {
  LearningItemQueryRepository,
  ListLearningItemParams,
  LearningItemDTO,
} from '@/core/interfaces/LearningItemQueryRepository'
import { LearningItemMapper } from '@/infra/mappers/LearningItemMapper'

export class PrismaLearningItemQueryRepository
  implements LearningItemQueryRepository
{
  constructor(private prisma: PrismaClient) {}

  async listLearningItems(
    userId: string,
    params: ListLearningItemParams
  ): Promise<{ learningItems: LearningItemDTO[]; total: number }> {
    const page = params.page ?? 1
    const pageSize = params.pageSize ?? 10

    // Build where clause based on filters
    const whereClause: Prisma.LearningItemWhereInput = {
      userId,
    }

    if (params.filters) {
      if (params.filters.status) {
        whereClause.status = this.statusToPrisma(params.filters.status)
      }
      if (params.filters.categoryId) {
        whereClause.categoryId = params.filters.categoryId
      }
      if (params.filters.tagIds && params.filters.tagIds.length > 0) {
        whereClause.tags = {
          some: {
            tagId: { in: params.filters.tagIds },
          },
        }
      }
      if (params.filters.search) {
        whereClause.OR = [
          {
            title: {
              contains: params.filters.search,
              mode: 'insensitive',
            },
          },
          {
            descriptionMD: {
              contains: params.filters.search,
              mode: 'insensitive',
            },
          },
        ]
      }
    }

    // Build orderBy clause
    const orderByClause: Prisma.LearningItemOrderByWithRelationInput = {}
    if (params.orderBy) {
      orderByClause[params.orderBy] = params.order ?? 'desc'
    } else {
      orderByClause['createdAt'] = 'desc'
    }

    // Fetch total count for pagination
    const total = await this.prisma.learningItem.count({
      where: whereClause,
    })

    // Fetch learning items with pagination and sorting
    const learningItems = await this.prisma.learningItem.findMany({
      include: { category: true },
      where: whereClause,
      orderBy: orderByClause,
      skip: (page - 1) * pageSize,
      take: pageSize,
    })

    return {
      learningItems: LearningItemMapper.toDTOMany(learningItems),
      total,
    }
  }

  async findById(id: string, includeModules = false): Promise<LearningItemDTO | null> {
    const learningItem = await this.prisma.learningItem.findUnique({
      where: { id },
      include: {
        modules: includeModules,
        category: true,
      },
    })

    if (!learningItem) {
      return null
    }

    return LearningItemMapper.toDTO(learningItem)
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
