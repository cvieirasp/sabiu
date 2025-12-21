import { Status as PrismaStatus, type PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { PrismaReportQueryRepository } from '@/infra/repositories/PrismaReportQueryRepository'
import type {
  ItemsByCategoryDTO,
  ItemsByStatusDTO,
  TopItemToCompleteDTO,
  RecentlyViewedItemDTO,
  ProgressByCategoryPerMonthDTO,
} from "@/core/interfaces/ReportQueryRepository"

function makePrismaMock() {
  return {
    learningItem: {
      groupBy: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
  } as unknown as PrismaClient
}

describe("PrismaReportQueryRepository", () => {
  let prisma: PrismaClient
  let repository: PrismaReportQueryRepository

  const prismaCategoryELearning = {
    id: 'cat-1',
    name: 'E-Learning',
    color: '#3B82F6',
  }

  const prismaCategoryCertification = {
    id: 'cat-2',
    name: 'Certification',
    color: '#10B981',
  }

  beforeEach(() => {
    prisma = makePrismaMock()
    repository = new PrismaReportQueryRepository(prisma)
    vi.restoreAllMocks()
  })

  describe("getItemsByCategory", () => {
    it("should return empty array when no items found", async () => {
      prisma.learningItem.groupBy = vi.fn().mockResolvedValue([])
      prisma.category.findMany = vi.fn().mockResolvedValue([])

      const result = await repository.getItemsByCategory("user-1")

      expect(prisma.learningItem.groupBy).toHaveBeenCalledWith({
        by: ['categoryId'],
        where: {
          userId: "user-1",
        },
        _count: {
          id: true,
        },
      })
      expect(result).toEqual([])
    })

    it("should return items grouped by category with category details", async () => {
      const groupedItems = [
        {
          categoryId: 'cat-1',
          _count: { id: 5 },
        },
        {
          categoryId: 'cat-2',
          _count: { id: 3 },
        },
      ]

      prisma.learningItem.groupBy = vi.fn().mockResolvedValue(groupedItems)
      prisma.category.findMany = vi.fn().mockResolvedValue([
        prismaCategoryELearning,
        prismaCategoryCertification,
      ])

      const result = await repository.getItemsByCategory("user-1")

      expect(prisma.learningItem.groupBy).toHaveBeenCalledWith({
        by: ['categoryId'],
        where: {
          userId: "user-1",
        },
        _count: {
          id: true,
        },
      })
      expect(prisma.category.findMany).toHaveBeenCalledWith({
        where: {
          id: { in: ['cat-1', 'cat-2'] },
        },
        select: {
          id: true,
          name: true,
          color: true,
        },
      })

      const expected: ItemsByCategoryDTO[] = [
        {
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          categoryColor: '#3B82F6',
          count: 5,
        },
        {
          categoryId: 'cat-2',
          categoryName: 'Certification',
          categoryColor: '#10B981',
          count: 3,
        },
      ]
      expect(result).toEqual(expected)
    })

    it("should return Unknown category when category is not found", async () => {
      const groupedItems = [
        {
          categoryId: 'cat-unknown',
          _count: { id: 2 },
        },
      ]

      prisma.learningItem.groupBy = vi.fn().mockResolvedValue(groupedItems)
      prisma.category.findMany = vi.fn().mockResolvedValue([])

      const result = await repository.getItemsByCategory("user-1")

      const expected: ItemsByCategoryDTO[] = [
        {
          categoryId: 'cat-unknown',
          categoryName: 'Unknown',
          categoryColor: '#888888',
          count: 2,
        },
      ]
      expect(result).toEqual(expected)
    })

    it("should filter items by userId", async () => {
      prisma.learningItem.groupBy = vi.fn().mockResolvedValue([])
      prisma.category.findMany = vi.fn().mockResolvedValue([])

      await repository.getItemsByCategory("user-2")

      expect(prisma.learningItem.groupBy).toHaveBeenCalledWith({
        by: ['categoryId'],
        where: {
          userId: "user-2",
        },
        _count: {
          id: true,
        },
      })
    })
  })

  describe("getItemsByStatus", () => {
    it("should return empty array when no items found", async () => {
      prisma.learningItem.groupBy = vi.fn().mockResolvedValue([])

      const result = await repository.getItemsByStatus("user-1")

      expect(prisma.learningItem.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          userId: "user-1",
        },
        _count: {
          id: true,
        },
      })
      expect(result).toEqual([])
    })

    it("should return items grouped by status", async () => {
      const groupedItems = [
        {
          status: PrismaStatus.Backlog,
          _count: { id: 10 },
        },
        {
          status: PrismaStatus.Em_Andamento,
          _count: { id: 5 },
        },
        {
          status: PrismaStatus.Pausado,
          _count: { id: 2 },
        },
        {
          status: PrismaStatus.Concluido,
          _count: { id: 8 },
        },
      ]

      prisma.learningItem.groupBy = vi.fn().mockResolvedValue(groupedItems)

      const result = await repository.getItemsByStatus("user-1")

      const expected: ItemsByStatusDTO[] = [
        { status: PrismaStatus.Backlog, count: 10 },
        { status: PrismaStatus.Em_Andamento, count: 5 },
        { status: PrismaStatus.Pausado, count: 2 },
        { status: PrismaStatus.Concluido, count: 8 },
      ]
      expect(result).toEqual(expected)
    })

    it("should filter items by userId", async () => {
      prisma.learningItem.groupBy = vi.fn().mockResolvedValue([])

      await repository.getItemsByStatus("user-3")

      expect(prisma.learningItem.groupBy).toHaveBeenCalledWith({
        by: ['status'],
        where: {
          userId: "user-3",
        },
        _count: {
          id: true,
        },
      })
    })
  })

  describe("getTopItemsToComplete", () => {
    it("should return empty array when no items found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      const result = await repository.getTopItemsToComplete("user-1", 5)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: {
            not: PrismaStatus.Concluido,
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
        take: 5,
      })
      expect(result).toEqual([])
    })

    it("should return top N items ordered by progress descending", async () => {
      const items = [
        {
          id: 'li-1',
          title: 'React Advanced',
          progressCached: 85,
          category: { name: 'E-Learning' },
        },
        {
          id: 'li-2',
          title: 'TypeScript Mastery',
          progressCached: 75,
          category: { name: 'E-Learning' },
        },
        {
          id: 'li-3',
          title: 'AWS Certification',
          progressCached: 60,
          category: { name: 'Certification' },
        },
      ]

      prisma.learningItem.findMany = vi.fn().mockResolvedValue(items)

      const result = await repository.getTopItemsToComplete("user-1", 3)

      const expected: TopItemToCompleteDTO[] = [
        {
          id: 'li-1',
          title: 'React Advanced',
          categoryName: 'E-Learning',
          progress: 85,
        },
        {
          id: 'li-2',
          title: 'TypeScript Mastery',
          categoryName: 'E-Learning',
          progress: 75,
        },
        {
          id: 'li-3',
          title: 'AWS Certification',
          categoryName: 'Certification',
          progress: 60,
        },
      ]
      expect(result).toEqual(expected)
    })

    it("should exclude completed items", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      await repository.getTopItemsToComplete("user-1", 10)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: {
            not: PrismaStatus.Concluido,
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
        take: 10,
      })
    })

    it("should respect the limit parameter", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      await repository.getTopItemsToComplete("user-1", 2)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
        })
      )
    })

    it("should filter items by userId", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      await repository.getTopItemsToComplete("user-4", 5)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: "user-4",
          }),
        })
      )
    })
  })

  describe("getRecentlyViewedItems", () => {
    it("should return empty array when no items found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      const result = await repository.getRecentlyViewedItems("user-1", 5)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
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
        take: 5,
      })
      expect(result).toEqual([])
    })

    it("should return recently viewed items ordered by updatedAt descending", async () => {
      const now = new Date()
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)

      const items = [
        {
          id: 'li-1',
          title: 'React Course',
          progressCached: 50,
          updatedAt: now,
          category: { name: 'E-Learning' },
        },
        {
          id: 'li-2',
          title: 'Node.js Mastery',
          progressCached: 30,
          updatedAt: yesterday,
          category: { name: 'E-Learning' },
        },
        {
          id: 'li-3',
          title: 'AWS Guide',
          progressCached: 100,
          updatedAt: twoDaysAgo,
          category: { name: 'Certification' },
        },
      ]

      prisma.learningItem.findMany = vi.fn().mockResolvedValue(items)

      const result = await repository.getRecentlyViewedItems("user-1", 3)

      const expected: RecentlyViewedItemDTO[] = [
        {
          id: 'li-1',
          title: 'React Course',
          categoryName: 'E-Learning',
          categoryType: 'E-Learning',
          progress: 50,
          viewedAt: now,
        },
        {
          id: 'li-2',
          title: 'Node.js Mastery',
          categoryName: 'E-Learning',
          categoryType: 'E-Learning',
          progress: 30,
          viewedAt: yesterday,
        },
        {
          id: 'li-3',
          title: 'AWS Guide',
          categoryName: 'Certification',
          categoryType: 'Certification',
          progress: 100,
          viewedAt: twoDaysAgo,
        },
      ]
      expect(result).toEqual(expected)
    })

    it("should respect the limit parameter", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      await repository.getRecentlyViewedItems("user-1", 10)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
        })
      )
    })

    it("should filter items by userId", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])

      await repository.getRecentlyViewedItems("user-5", 5)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            userId: "user-5",
          },
        })
      )
    })

    it("should map updatedAt to viewedAt", async () => {
      const testDate = new Date('2025-01-15T10:30:00Z')
      const items = [
        {
          id: 'li-1',
          title: 'Test Item',
          progressCached: 25,
          updatedAt: testDate,
          category: { name: 'Test Category' },
        },
      ]

      prisma.learningItem.findMany = vi.fn().mockResolvedValue(items)

      const result = await repository.getRecentlyViewedItems("user-1", 1)

      expect(result[0].viewedAt).toEqual(testDate)
    })

    it("should use category name as categoryType", async () => {
      const items = [
        {
          id: 'li-1',
          title: 'Test Item',
          progressCached: 25,
          updatedAt: new Date(),
          category: { name: 'Certification' },
        },
      ]

      prisma.learningItem.findMany = vi.fn().mockResolvedValue(items)

      const result = await repository.getRecentlyViewedItems("user-1", 1)

      expect(result[0].categoryName).toBe('Certification')
      expect(result[0].categoryType).toBe('Certification')
    })
  })

  describe("getProgressByCategoryPerMonth", () => {
    it("should return empty array when no data found", async () => {
      prisma.$queryRaw = vi.fn().mockResolvedValue([])

      const result = await repository.getProgressByCategoryPerMonth("user-1", 6)

      expect(prisma.$queryRaw).toHaveBeenCalled()
      expect(result).toEqual([])
    })

    it("should return progress grouped by month and category", async () => {
      const rawData = [
        {
          month: '2025-01',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: 45.5,
        },
        {
          month: '2025-01',
          categoryId: 'cat-2',
          categoryName: 'Certification',
          averageProgress: 30.25,
        },
        {
          month: '2025-02',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: 55.75,
        },
      ]

      prisma.$queryRaw = vi.fn().mockResolvedValue(rawData)

      const result = await repository.getProgressByCategoryPerMonth("user-1", 6)

      const expected: ProgressByCategoryPerMonthDTO[] = [
        {
          month: '2025-01',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: 45.5,
        },
        {
          month: '2025-01',
          categoryId: 'cat-2',
          categoryName: 'Certification',
          averageProgress: 30.25,
        },
        {
          month: '2025-02',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: 55.75,
        },
      ]
      expect(result).toEqual(expected)
    })

    it("should call $queryRaw with correct parameters", async () => {
      const mockQueryRaw = vi.fn().mockResolvedValue([])
      prisma.$queryRaw = mockQueryRaw

      await repository.getProgressByCategoryPerMonth("user-6", 3)

      expect(mockQueryRaw).toHaveBeenCalled()
      const callArgs = mockQueryRaw.mock.calls[0]
      // Verify that userId is passed as a parameter
      expect(callArgs).toContain("user-6")
    })

    it("should calculate start date based on months parameter", async () => {
      prisma.$queryRaw = vi.fn().mockResolvedValue([])

      await repository.getProgressByCategoryPerMonth("user-1", 12)

      expect(prisma.$queryRaw).toHaveBeenCalled()
    })

    it("should convert averageProgress to number", async () => {
      const rawData = [
        {
          month: '2025-01',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: '67.89', // String from DB
        },
      ]

      prisma.$queryRaw = vi.fn().mockResolvedValue(rawData)

      const result = await repository.getProgressByCategoryPerMonth("user-1", 6)

      expect(typeof result[0].averageProgress).toBe('number')
      expect(result[0].averageProgress).toBe(67.89)
    })

    it("should return results ordered by month and category name", async () => {
      const rawData = [
        {
          month: '2024-12',
          categoryId: 'cat-2',
          categoryName: 'Book',
          averageProgress: 20,
        },
        {
          month: '2024-12',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: 40,
        },
        {
          month: '2025-01',
          categoryId: 'cat-1',
          categoryName: 'E-Learning',
          averageProgress: 50,
        },
      ]

      prisma.$queryRaw = vi.fn().mockResolvedValue(rawData)

      const result = await repository.getProgressByCategoryPerMonth("user-1", 3)

      // The ordering is done in SQL (ORDER BY month ASC, c.name ASC)
      // We just verify the data is mapped correctly
      expect(result).toHaveLength(3)
      expect(result[0].month).toBe('2024-12')
      expect(result[2].month).toBe('2025-01')
    })
  })
})
