import { PrismaClient, Status } from '@prisma/client'
import {
  DashboardQueryRepository,
  ItemsByCategoryDTO,
  ItemsByStatusDTO,
  TopItemToCompleteDTO,
  RecentlyViewedItemDTO,
  ProgressByCategoryPerMonthDTO,
} from '@/core/interfaces/ReportQueryRepository'

export class PrismaReportQueryRepository implements DashboardQueryRepository {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get count of learning items grouped by category
   * Uses Prisma groupBy for optimal performance
   */
  async getItemsByCategory(userId: string): Promise<ItemsByCategoryDTO[]> {
    const groupedItems = await this.prisma.learningItem.groupBy({
      by: ['categoryId'],
      where: {
        userId,
      },
      _count: {
        id: true,
      },
    })

    // Fetch category details in a single query
    const categoryIds = groupedItems.map(item => item.categoryId)
    const categories = await this.prisma.category.findMany({
      where: {
        id: { in: categoryIds },
      },
      select: {
        id: true,
        name: true,
        color: true,
      },
    })

    // Create a map for O(1) lookups
    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

    // Combine results
    return groupedItems.map(item => {
      const category = categoryMap.get(item.categoryId)
      return {
        categoryId: item.categoryId,
        categoryName: category?.name || 'Unknown',
        categoryColor: category?.color || '#888888',
        count: item._count.id,
      }
    })
  }

  /**
   * Get count of learning items grouped by status
   * Uses Prisma groupBy for optimal performance
   */
  async getItemsByStatus(userId: string): Promise<ItemsByStatusDTO[]> {
    const groupedItems = await this.prisma.learningItem.groupBy({
      by: ['status'],
      where: {
        userId,
      },
      _count: {
        id: true,
      },
    })

    return groupedItems.map(item => ({
      status: item.status,
      count: item._count.id,
    }))
  }

  /**
   * Get top N items closest to completion
   * Filters out completed items and orders by progress descending
   * Only selects essential fields for performance
   */
  async getTopItemsToComplete(
    userId: string,
    limit: number
  ): Promise<TopItemToCompleteDTO[]> {
    const items = await this.prisma.learningItem.findMany({
      where: {
        userId,
        status: {
          not: Status.Concluido,
        },
      },
      select: {
        id: true,
        title: true,
        progressCached: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        progressCached: 'desc',
      },
      take: limit,
    })

    return items.map(item => ({
      id: item.id,
      title: item.title,
      categoryName: item.category.name,
      progress: item.progressCached,
    }))
  }

  /**
   * Get recently viewed items
   * Note: Since there's no viewedAt field, we use updatedAt as a proxy
   * This assumes that viewing/editing an item updates the timestamp
   * Only selects essential fields for performance
   */
  async getRecentlyViewedItems(
    userId: string,
    limit: number
  ): Promise<RecentlyViewedItemDTO[]> {
    const items = await this.prisma.learningItem.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        title: true,
        progressCached: true,
        updatedAt: true,
        category: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
    })

    return items.map(item => ({
      id: item.id,
      title: item.title,
      categoryName: item.category.name,
      categoryType: item.category.name, // Using name as type for now
      progress: item.progressCached,
      viewedAt: item.updatedAt,
    }))
  }

  /**
   * Get average progress per category by month for the last N months
   * Uses raw SQL for complex aggregation with optimal performance
   * Groups by month and category, calculates average progress
   */
  async getProgressByCategoryPerMonth(
    userId: string,
    months: number
  ): Promise<ProgressByCategoryPerMonthDTO[]> {
    // Calculate the start date (N months ago)
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)
    startDate.setDate(1) // First day of the month
    startDate.setHours(0, 0, 0, 0)

    // Use Prisma's raw query for efficient aggregation
    const result = await this.prisma.$queryRaw<
      Array<{
        month: string
        categoryId: string
        categoryName: string
        averageProgress: number
      }>
    >`
      SELECT
        TO_CHAR(li.created_at, 'YYYY-MM') as month,
        c.id as "categoryId",
        c.name as "categoryName",
        ROUND(AVG(li.progress_cached)::numeric, 2) as "averageProgress"
      FROM learning_items li
      INNER JOIN categories c ON li.category_id = c.id
      WHERE
        li.user_id = ${userId}
        AND li.created_at >= ${startDate}
      GROUP BY
        TO_CHAR(li.created_at, 'YYYY-MM'),
        c.id,
        c.name
      ORDER BY
        month ASC,
        c.name ASC
    `

    return result.map(row => ({
      month: row.month,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      averageProgress: Number(row.averageProgress),
    }))
  }
}
