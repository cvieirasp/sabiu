import { Status as PrismaStatus, type PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { PrismaLearningItemQueryRepository } from '@/infra/repositories/PrismaLearningItemQueryRepository'
import { LearningItemMapper } from "@/infra/mappers/LearningItemMapper"
import { StatusVO } from "@/core/value-objects"
import type { LearningItemDTO, ListLearningItemParams } from "@/core/interfaces/LearningItemQueryRepository"

function makePrismaMock() {
  return {
    learningItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
  } as unknown as PrismaClient
}

describe("PrismaLearningItemQueryRepository", () => {
  let prisma: PrismaClient
  let repository: PrismaLearningItemQueryRepository

  const prismaCategory = {
    id: 'cat-1',
    name: 'E-Learning',
    color: '#3B82F6',
  }

  const prismaLearningItemReact = {
    id: 'li-1',
    title: 'React Course',
    descriptionMD: 'Learn React fundamentals',
    dueDate: new Date('2025-12-31T00:00:00Z'),
    status: PrismaStatus.Em_Andamento,
    progressCached: 50,
    userId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T00:00:00Z'),
    category: prismaCategory,
  }

  const prismaLearningItemNode = {
    id: 'li-2',
    title: 'Node.js Mastery',
    descriptionMD: 'Advanced Node.js concepts',
    dueDate: new Date('2025-11-30T00:00:00Z'),
    status: PrismaStatus.Backlog,
    progressCached: 0,
    userId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
    category: prismaCategory,
  }

  const prismaLearningItemTypeScript = {
    id: 'li-3',
    title: 'TypeScript Deep Dive',
    descriptionMD: 'Master TypeScript',
    dueDate: null,
    status: PrismaStatus.Concluido,
    progressCached: 100,
    userId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-20T00:00:00Z'),
    category: prismaCategory,
  }

  const dtoLearningItemReact: LearningItemDTO = {
    id: 'li-1',
    title: 'React Course',
    descriptionMD: 'Learn React fundamentals',
    dueDate: new Date('2025-12-31T00:00:00Z'),
    status: 'Em_Andamento',
    progress: 50,
    userId: 'user-1',
    category: {
      id: 'cat-1',
      name: 'E-Learning',
      color: '#3B82F6',
    },
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T00:00:00Z'),
  }

  const dtoLearningItemNode: LearningItemDTO = {
    id: 'li-2',
    title: 'Node.js Mastery',
    descriptionMD: 'Advanced Node.js concepts',
    dueDate: new Date('2025-11-30T00:00:00Z'),
    status: 'Backlog',
    progress: 0,
    userId: 'user-1',
    category: {
      id: 'cat-1',
      name: 'E-Learning',
      color: '#3B82F6',
    },
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  }

  const dtoLearningItemTypeScript: LearningItemDTO = {
    id: 'li-3',
    title: 'TypeScript Deep Dive',
    descriptionMD: 'Master TypeScript',
    dueDate: null,
    status: 'Concluido',
    progress: 100,
    userId: 'user-1',
    category: {
      id: 'cat-1',
      name: 'E-Learning',
      color: '#3B82F6',
    },
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-20T00:00:00Z'),
  }

  beforeEach(() => {
    prisma = makePrismaMock()
    repository = new PrismaLearningItemQueryRepository(prisma)
    vi.restoreAllMocks()
  })

  describe("findById", () => {
    it("should return null if Learning Item is not found", async () => {
      prisma.learningItem.findUnique = vi.fn().mockResolvedValue(null)

      const result = await repository.findById("non-existent-id")

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "non-existent-id" },
        include: {
          modules: false,
          category: true,
        },
      })
      expect(result).toBeNull()
    })

    it("should return mapped DTO if Learning Item is found", async () => {
      prisma.learningItem.findUnique = vi
        .fn()
        .mockResolvedValue(prismaLearningItemReact)
      const toDTOSpy = vi
        .spyOn(LearningItemMapper, "toDTO")
        .mockReturnValue(dtoLearningItemReact)

      const result = await repository.findById("li-1")

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: false,
          category: true,
        },
      })
      expect(toDTOSpy).toHaveBeenCalledWith(prismaLearningItemReact)
      expect(result).toEqual(dtoLearningItemReact)
    })

    it("should include Modules when includeModules is true", async () => {
      const prismaWithModules = {
        ...prismaLearningItemReact,
        modules: [
          {
            id: 'mod-1',
            learningItemId: 'li-1',
            title: 'Introduction',
            status: 'Pendente',
            order: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }
      prisma.learningItem.findUnique = vi
        .fn()
        .mockResolvedValue(prismaWithModules)
      const toDTOSpy = vi
        .spyOn(LearningItemMapper, "toDTO")
        .mockReturnValue(dtoLearningItemReact)

      const result = await repository.findById("li-1", true)

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: true,
          category: true,
        },
      })
      expect(toDTOSpy).toHaveBeenCalledWith(prismaWithModules)
      expect(result).toEqual(dtoLearningItemReact)
    })

    it("should not include Modules when includeModules is false", async () => {
      prisma.learningItem.findUnique = vi
        .fn()
        .mockResolvedValue(prismaLearningItemReact)
      vi.spyOn(LearningItemMapper, "toDTO").mockReturnValue(
        dtoLearningItemReact
      )

      await repository.findById("li-1", false)

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: false,
          category: true,
        },
      })
    })

    it("should not include Modules by default", async () => {
      prisma.learningItem.findUnique = vi
        .fn()
        .mockResolvedValue(prismaLearningItemReact)
      vi.spyOn(LearningItemMapper, "toDTO").mockReturnValue(
        dtoLearningItemReact
      )

      await repository.findById("li-1")

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: false,
          category: true,
        },
      })
    })
  })

  describe("listLearningItems", () => {
    it("should return empty list when no items found", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(0)
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDTOManySpy = vi
        .spyOn(LearningItemMapper, "toDTOMany")
        .mockReturnValue([])

      const result = await repository.listLearningItems("user-1", {})

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: { userId: "user-1" },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
      expect(toDTOManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual({ learningItems: [], total: 0 })
    })

    it("should use default pagination (page=1, pageSize=10)", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(2)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact, prismaLearningItemNode])
      const toDTOManySpy = vi
        .spyOn(LearningItemMapper, "toDTOMany")
        .mockReturnValue([dtoLearningItemReact, dtoLearningItemNode])

      const result = await repository.listLearningItems("user-1", {})

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
      expect(toDTOManySpy).toHaveBeenCalledWith([
        prismaLearningItemReact,
        prismaLearningItemNode,
      ])
      expect(result).toEqual({
        learningItems: [dtoLearningItemReact, dtoLearningItemNode],
        total: 2,
      })
    })

    it("should apply custom pagination", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(25)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemTypeScript])
      const toDTOManySpy = vi
        .spyOn(LearningItemMapper, "toDTOMany")
        .mockReturnValue([dtoLearningItemTypeScript])

      const params: ListLearningItemParams = {
        page: 2,
        pageSize: 5,
      }

      const result = await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
        skip: 5, // (page 2 - 1) * 5
        take: 5,
      })
      expect(toDTOManySpy).toHaveBeenCalledWith([prismaLearningItemTypeScript])
      expect(result).toEqual({
        learningItems: [dtoLearningItemTypeScript],
        total: 25,
      })
    })

    it("should filter by status", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(1)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDTOManySpy = vi
        .spyOn(LearningItemMapper, "toDTOMany")
        .mockReturnValue([dtoLearningItemReact])

      const params: ListLearningItemParams = {
        filters: {
          status: StatusVO.fromEmAndamento(),
        },
      }

      const result = await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
        },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
      expect(toDTOManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual({
        learningItems: [dtoLearningItemReact],
        total: 1,
      })
    })

    it("should filter by categoryId", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(2)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact, prismaLearningItemNode])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
        dtoLearningItemNode,
      ])

      const params: ListLearningItemParams = {
        filters: {
          categoryId: "cat-1",
        },
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          categoryId: "cat-1",
        },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: {
          userId: "user-1",
          categoryId: "cat-1",
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
    })

    it("should filter by tagIds", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(1)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
      ])

      const params: ListLearningItemParams = {
        filters: {
          tagIds: ["tag-1", "tag-2"],
        },
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          tags: {
            some: {
              tagId: { in: ["tag-1", "tag-2"] },
            },
          },
        },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: {
          userId: "user-1",
          tags: {
            some: {
              tagId: { in: ["tag-1", "tag-2"] },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
    })

    it("should not filter by tagIds if array is empty", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(3)
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([
        prismaLearningItemReact,
        prismaLearningItemNode,
        prismaLearningItemTypeScript,
      ])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
        dtoLearningItemNode,
        dtoLearningItemTypeScript,
      ])

      const params: ListLearningItemParams = {
        filters: {
          tagIds: [],
        },
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
        },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: {
          userId: "user-1",
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
    })

    it("should filter by search term in title and description", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(1)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
      ])

      const params: ListLearningItemParams = {
        filters: {
          search: "React",
        },
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            {
              title: {
                contains: "React",
                mode: "insensitive",
              },
            },
            {
              descriptionMD: {
                contains: "React",
                mode: "insensitive",
              },
            },
          ],
        },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: {
          userId: "user-1",
          OR: [
            {
              title: {
                contains: "React",
                mode: "insensitive",
              },
            },
            {
              descriptionMD: {
                contains: "React",
                mode: "insensitive",
              },
            },
          ],
        },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
    })

    it("should apply multiple filters simultaneously", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(1)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
      ])

      const params: ListLearningItemParams = {
        filters: {
          status: StatusVO.fromEmAndamento(),
          categoryId: "cat-1",
          tagIds: ["tag-1"],
          search: "React",
        },
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
          categoryId: "cat-1",
          tags: {
            some: {
              tagId: { in: ["tag-1"] },
            },
          },
          OR: [
            {
              title: {
                contains: "React",
                mode: "insensitive",
              },
            },
            {
              descriptionMD: {
                contains: "React",
                mode: "insensitive",
              },
            },
          ],
        },
      })
    })

    it("should use default orderBy createdAt desc when not specified", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(1)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
      ])

      await repository.listLearningItems("user-1", {})

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-1" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
    })

    it("should apply custom orderBy and order", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(2)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemNode, prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemNode,
        dtoLearningItemReact,
      ])

      const params: ListLearningItemParams = {
        orderBy: "title",
        order: "asc",
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-1" },
        orderBy: { title: "asc" },
        skip: 0,
        take: 10,
      })
    })

    it("should use desc as default order when orderBy is specified without order", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(1)
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([
        dtoLearningItemReact,
      ])

      const params: ListLearningItemParams = {
        orderBy: "progressCached",
      }

      await repository.listLearningItems("user-1", params)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-1" },
        orderBy: { progressCached: "desc" },
        skip: 0,
        take: 10,
      })
    })

    it("should filter by userId and ignore other users' items", async () => {
      prisma.learningItem.count = vi.fn().mockResolvedValue(0)
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      vi.spyOn(LearningItemMapper, "toDTOMany").mockReturnValue([])

      await repository.listLearningItems("user-2", {})

      expect(prisma.learningItem.count).toHaveBeenCalledWith({
        where: { userId: "user-2" },
      })
      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        include: { category: true },
        where: { userId: "user-2" },
        orderBy: { createdAt: "desc" },
        skip: 0,
        take: 10,
      })
    })
  })
})
