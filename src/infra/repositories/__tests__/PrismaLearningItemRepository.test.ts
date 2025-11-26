import { Prisma, Status as PrismaStatus, type PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { LearningItem } from '@/core/entities/LearningItem'
import { PrismaLearningItemRepository } from '@/infra/repositories/PrismaLearningItemRepository'
import { LearningItemMapper } from "@/infra/mappers/LearningItemMapper"
import { Progress } from "@/core/value-objects/Progress"
import { StatusVO } from "@/core/value-objects/Status"

function makePrismaMock() {
  return {
    learningItem: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaClient
}

describe("PrismaLearningItemRepository", () => {
  let prisma: PrismaClient
  let repository: PrismaLearningItemRepository

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
    modules: [],
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
    modules: [],
  }

  const prismaLearningItemTypeScript = {
    id: 'li-3',
    title: 'TypeScript Deep Dive',
    descriptionMD: 'Master TypeScript',
    dueDate: null,
    status: PrismaStatus.Concluido,
    progressCached: 100,
    userId: 'user-1',
    categoryId: 'cat-2',
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-20T00:00:00Z'),
    modules: [],
  }

  const entityLearningItemReact = LearningItem.reconstitute({
    id: 'li-1',
    title: 'React Course',
    descriptionMD: 'Learn React fundamentals',
    dueDate: new Date('2025-12-31T00:00:00Z'),
    status: StatusVO.fromEmAndamento(),
    progress: Progress.create(50),
    userId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-15T00:00:00Z'),
  })

  const entityLearningItemNode = LearningItem.reconstitute({
    id: 'li-2',
    title: 'Node.js Mastery',
    descriptionMD: 'Advanced Node.js concepts',
    dueDate: new Date('2025-11-30T00:00:00Z'),
    status: StatusVO.fromBacklog(),
    progress: Progress.create(0),
    userId: 'user-1',
    categoryId: 'cat-1',
    createdAt: new Date('2025-01-02T00:00:00Z'),
    updatedAt: new Date('2025-01-02T00:00:00Z'),
  })

  const entityLearningItemTypeScript = LearningItem.reconstitute({
    id: 'li-3',
    title: 'TypeScript Deep Dive',
    descriptionMD: 'Master TypeScript',
    dueDate: null,
    status: StatusVO.fromConcluido(),
    progress: Progress.create(100),
    userId: 'user-1',
    categoryId: 'cat-2',
    createdAt: new Date('2025-01-03T00:00:00Z'),
    updatedAt: new Date('2025-01-20T00:00:00Z'),
  })

  beforeEach(() => {
    prisma = makePrismaMock()
    repository = new PrismaLearningItemRepository(prisma)
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
        },
      })
      expect(result).toBeNull()
    })

    it("should return mapped Learning Item if found", async () => {
      prisma.learningItem.findUnique = vi
        .fn()
        .mockResolvedValue(prismaLearningItemReact)
      const toDomainSpy = vi
        .spyOn(LearningItemMapper, "toDomain")
        .mockReturnValue(entityLearningItemReact)

      const result = await repository.findById("li-1")

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: false,
        },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaLearningItemReact)
      expect(result).toEqual(entityLearningItemReact)
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
      const toDomainSpy = vi
        .spyOn(LearningItemMapper, "toDomain")
        .mockReturnValue(entityLearningItemReact)

      const result = await repository.findById("li-1", true)

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaWithModules)
      expect(result).toEqual(entityLearningItemReact)
    })

    it("should not include Modules by default", async () => {
      prisma.learningItem.findUnique = vi
        .fn()
        .mockResolvedValue(prismaLearningItemReact)
      vi.spyOn(LearningItemMapper, "toDomain").mockReturnValue(
        entityLearningItemReact
      )

      await repository.findById("li-1")

      expect(prisma.learningItem.findUnique).toHaveBeenCalledWith({
        where: { id: "li-1" },
        include: {
          modules: false,
        },
      })
    })
  })

  describe("findByUserId", () => {
    it("should return empty array if no Learning Items found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.findByUserId("user-unknown")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: { userId: "user-unknown" },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return Learning Items for a user", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact, prismaLearningItemNode])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact, entityLearningItemNode])

      const result = await repository.findByUserId("user-1")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([
        prismaLearningItemReact,
        prismaLearningItemNode,
      ])
      expect(result).toEqual([entityLearningItemReact, entityLearningItemNode])
    })

    it("should apply pagination options", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByUserId("user-1", {
        skip: 10,
        take: 5,
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: 10,
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should filter by status", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByUserId("user-1", {
        status: StatusVO.fromEmAndamento(),
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
        },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should filter by categoryId", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact, prismaLearningItemNode])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
        entityLearningItemNode,
      ])

      await repository.findByUserId("user-1", {
        categoryId: "cat-1",
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          categoryId: "cat-1",
        },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should filter by tagIds", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByUserId("user-1", {
        tagIds: ["tag-1", "tag-2"],
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          tags: {
            some: {
              tagId: {
                in: ["tag-1", "tag-2"],
              },
            },
          },
        },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should not filter by tagIds if array is empty", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact, prismaLearningItemNode])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
        entityLearningItemNode,
      ])

      await repository.findByUserId("user-1", {
        tagIds: [],
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
        },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should filter by search term", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByUserId("user-1", {
        search: "React",
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            { title: { contains: "React", mode: "insensitive" } },
            { descriptionMD: { contains: "React", mode: "insensitive" } },
          ],
        },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should apply custom orderBy", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemNode, prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemNode,
        entityLearningItemReact,
      ])

      await repository.findByUserId("user-1", {
        orderBy: "title",
        order: "asc",
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: undefined,
        take: undefined,
        orderBy: { title: "asc" },
        include: {
          modules: false,
        },
      })
    })

    it("should map progress orderBy to progressCached", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemTypeScript])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemTypeScript,
      ])

      await repository.findByUserId("user-1", {
        orderBy: "progress",
        order: "desc",
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: undefined,
        take: undefined,
        orderBy: { progressCached: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should include Modules when includeModules is true", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByUserId("user-1", {
        includeModules: true,
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: { userId: "user-1" },
        skip: undefined,
        take: undefined,
        orderBy: { createdAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })
  })

  describe("findByStatus", () => {
    it("should return empty array if no Learning Items found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.findByStatus(
        "user-1",
        StatusVO.fromBacklog()
      )

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Backlog,
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: false,
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return Learning Items with specific status", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.findByStatus(
        "user-1",
        StatusVO.fromEmAndamento()
      )

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: false,
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })

    it("should filter by categoryId when provided", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByStatus("user-1", StatusVO.fromEmAndamento(), {
        categoryId: "cat-1",
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
          categoryId: "cat-1",
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should include Modules when includeModules is true", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByStatus("user-1", StatusVO.fromEmAndamento(), {
        includeModules: true,
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          status: PrismaStatus.Em_Andamento,
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })
  })

  describe("findByCategory", () => {
    it("should return empty array if no Learning Items found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.findByCategory("user-1", "cat-unknown")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          categoryId: "cat-unknown",
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: false,
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return Learning Items for a category", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact, prismaLearningItemNode])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact, entityLearningItemNode])

      const result = await repository.findByCategory("user-1", "cat-1")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          categoryId: "cat-1",
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: false,
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([
        prismaLearningItemReact,
        prismaLearningItemNode,
      ])
      expect(result).toEqual([entityLearningItemReact, entityLearningItemNode])
    })

    it("should filter by status when provided", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByCategory("user-1", "cat-1", {
        status: StatusVO.fromEmAndamento(),
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          categoryId: "cat-1",
          status: PrismaStatus.Em_Andamento,
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: false,
        },
      })
    })

    it("should include Modules when includeModules is true", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByCategory("user-1", "cat-1", {
        includeModules: true,
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          categoryId: "cat-1",
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })
  })

  describe("findByTags", () => {
    it("should return Learning Items with any of the specified tags", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.findByTags("user-1", ["tag-1", "tag-2"])

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          tags: {
            some: {
              tagId: {
                in: ["tag-1", "tag-2"],
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })

    it("should return Learning Items with all of the specified tags when matchAll is true", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.findByTags(
        "user-1",
        ["tag-1", "tag-2"],
        true
      )

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          AND: [
            {
              tags: {
                some: {
                  tagId: "tag-1",
                },
              },
            },
            {
              tags: {
                some: {
                  tagId: "tag-2",
                },
              },
            },
          ],
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })

    it("should use matchAll=false by default", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findByTags("user-1", ["tag-1"])

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          tags: {
            some: {
              tagId: {
                in: ["tag-1"],
              },
            },
          },
        },
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })
  })

  describe("findOverdue", () => {
    it("should return empty array if no overdue Learning Items found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.findOverdue("user-1")

      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return overdue Learning Items (not Concluido)", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.findOverdue("user-1")

      const findManySpy = vi.spyOn(prisma.learningItem, 'findMany')
      const callArgs = findManySpy.mock.calls[0][0]
      expect(callArgs).toBeDefined()
      if (!callArgs) return
      expect(callArgs.where?.userId).toBe("user-1")
      expect(callArgs.where?.dueDate).toBeDefined()
      const duedate = callArgs.where?.dueDate as Prisma.DateTimeNullableFilter
      expect(duedate.lt).toBeInstanceOf(Date)
      expect(callArgs.where?.status).toEqual({ not: PrismaStatus.Concluido })
      expect(callArgs.orderBy).toEqual({ dueDate: "asc" })
      expect(callArgs.include).toEqual({
        modules: { orderBy: { order: "asc" } },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })
  })

  describe("findDueSoon", () => {
    it("should return empty array if no items due soon", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.findDueSoon("user-1")

      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return Learning Items due within threshold days", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.findDueSoon("user-1", 7)

      const findManySpy = vi.spyOn(prisma.learningItem, 'findMany')
      const callArgs = findManySpy.mock.calls[0][0]
      expect(callArgs).toBeDefined()
      if (!callArgs) return
      expect(callArgs.where?.userId).toBe("user-1")
      expect(callArgs.where?.dueDate).toBeDefined()
      const duedate = callArgs.where?.dueDate as Prisma.DateTimeNullableFilter
      expect(duedate.gte).toBeInstanceOf(Date)
      expect(duedate.lte).toBeInstanceOf(Date)
      expect(callArgs.where?.status).toEqual({ not: PrismaStatus.Concluido })
      expect(callArgs.orderBy).toEqual({ dueDate: "asc" })
      expect(callArgs.include).toEqual({
        modules: { orderBy: { order: "asc" } },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })

    it("should use 7 days as default threshold", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findDueSoon("user-1")

      const findManySpy = vi.spyOn(prisma.learningItem, 'findMany')
      const callArgs = findManySpy.mock.calls[0][0]
      expect(callArgs).toBeDefined()
      if (!callArgs) return
      const dueDateFilter = callArgs.where?.dueDate as Prisma.DateTimeNullableFilter
      const gte = dueDateFilter.gte as Date
      const lte = dueDateFilter.lte as Date

      const daysDiff = Math.ceil((lte.getTime() - gte.getTime()) / (1000 * 60 * 60 * 24))
      expect(daysDiff).toBe(7)
    })
  })

  describe("findNearCompletion", () => {
    it("should return empty array if no items near completion", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.findNearCompletion("user-1")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          progressCached: {
            gte: 80,
          },
          status: {
            not: PrismaStatus.Concluido,
          },
        },
        orderBy: { progressCached: "desc" },
        take: 10,
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should return Learning Items with progress >= threshold", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.findNearCompletion("user-1", 80, 10)

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          progressCached: {
            gte: 80,
          },
          status: {
            not: PrismaStatus.Concluido,
          },
        },
        orderBy: { progressCached: "desc" },
        take: 10,
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })

    it("should use default values for threshold (80) and limit (10)", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.findNearCompletion("user-1")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          progressCached: {
            gte: 80,
          },
          status: {
            not: PrismaStatus.Concluido,
          },
        },
        orderBy: { progressCached: "desc" },
        take: 10,
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })
  })

  describe("search", () => {
    it("should return empty array if no matches found", async () => {
      prisma.learningItem.findMany = vi.fn().mockResolvedValue([])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([])

      const result = await repository.search("user-1", "NonExistent")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            { title: { contains: "NonExistent", mode: "insensitive" } },
            { descriptionMD: { contains: "NonExistent", mode: "insensitive" } },
          ],
        },
        take: undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([])
      expect(result).toEqual([])
    })

    it("should search in title and description", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      const toDomainManySpy = vi
        .spyOn(LearningItemMapper, "toDomainMany")
        .mockReturnValue([entityLearningItemReact])

      const result = await repository.search("user-1", "React")

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            { title: { contains: "React", mode: "insensitive" } },
            { descriptionMD: { contains: "React", mode: "insensitive" } },
          ],
        },
        take: undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainManySpy).toHaveBeenCalledWith([prismaLearningItemReact])
      expect(result).toEqual([entityLearningItemReact])
    })

    it("should filter by status when provided", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.search("user-1", "React", {
        status: StatusVO.fromEmAndamento(),
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            { title: { contains: "React", mode: "insensitive" } },
            { descriptionMD: { contains: "React", mode: "insensitive" } },
          ],
          status: PrismaStatus.Em_Andamento,
        },
        take: undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })

    it("should filter by categoryId when provided", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.search("user-1", "React", {
        categoryId: "cat-1",
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            { title: { contains: "React", mode: "insensitive" } },
            { descriptionMD: { contains: "React", mode: "insensitive" } },
          ],
          categoryId: "cat-1",
        },
        take: undefined,
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })

    it("should apply limit when provided", async () => {
      prisma.learningItem.findMany = vi
        .fn()
        .mockResolvedValue([prismaLearningItemReact])
      vi.spyOn(LearningItemMapper, "toDomainMany").mockReturnValue([
        entityLearningItemReact,
      ])

      await repository.search("user-1", "React", {
        limit: 5,
      })

      expect(prisma.learningItem.findMany).toHaveBeenCalledWith({
        where: {
          userId: "user-1",
          OR: [
            { title: { contains: "React", mode: "insensitive" } },
            { descriptionMD: { contains: "React", mode: "insensitive" } },
          ],
        },
        take: 5,
        orderBy: { updatedAt: "desc" },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
    })
  })

  describe("create", () => {
    it("should create and return the new Learning Item", async () => {
      prisma.learningItem.create = vi
        .fn()
        .mockResolvedValue(prismaLearningItemReact)
      const toPrismaSpy = vi
        .spyOn(LearningItemMapper, "toPrisma")
        .mockReturnValue({
          id: prismaLearningItemReact.id,
          title: prismaLearningItemReact.title,
          descriptionMD: prismaLearningItemReact.descriptionMD,
          dueDate: prismaLearningItemReact.dueDate,
          status: prismaLearningItemReact.status,
          progressCached: prismaLearningItemReact.progressCached,
          userId: prismaLearningItemReact.userId,
          categoryId: prismaLearningItemReact.categoryId,
        })
      const toDomainSpy = vi
        .spyOn(LearningItemMapper, "toDomain")
        .mockReturnValue(entityLearningItemReact)

      const result = await repository.create(entityLearningItemReact)

      expect(toPrismaSpy).toHaveBeenCalledWith(entityLearningItemReact)
      expect(prisma.learningItem.create).toHaveBeenCalledWith({
        data: toPrismaSpy.mock.results[0].value,
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(prismaLearningItemReact)
      expect(result).toEqual(entityLearningItemReact)
    })
  })

  describe("update", () => {
    it("should update and return the Learning Item", async () => {
      const updatedPrismaLearningItem = {
        ...prismaLearningItemReact,
        title: "React Advanced Course",
        status: PrismaStatus.Concluido,
        progressCached: 100,
      }
      const updatedEntityLearningItem = LearningItem.reconstitute({
        ...entityLearningItemReact.toObject(),
        title: "React Advanced Course",
        status: StatusVO.fromConcluido(),
        progress: Progress.create(100),
      })

      prisma.learningItem.update = vi
        .fn()
        .mockResolvedValue(updatedPrismaLearningItem)
      const toPrismaSpy = vi
        .spyOn(LearningItemMapper, "toPrisma")
        .mockReturnValue({
          id: updatedPrismaLearningItem.id,
          title: updatedPrismaLearningItem.title,
          descriptionMD: updatedPrismaLearningItem.descriptionMD,
          dueDate: updatedPrismaLearningItem.dueDate,
          status: updatedPrismaLearningItem.status,
          progressCached: updatedPrismaLearningItem.progressCached,
          userId: updatedPrismaLearningItem.userId,
          categoryId: updatedPrismaLearningItem.categoryId,
        })
      const toDomainSpy = vi
        .spyOn(LearningItemMapper, "toDomain")
        .mockReturnValue(updatedEntityLearningItem)

      const result = await repository.update(updatedEntityLearningItem)

      expect(toPrismaSpy).toHaveBeenCalledWith(updatedEntityLearningItem)
      expect(prisma.learningItem.update).toHaveBeenCalledWith({
        where: { id: updatedEntityLearningItem.id },
        data: {
          title: updatedPrismaLearningItem.title,
          descriptionMD: updatedPrismaLearningItem.descriptionMD,
          dueDate: updatedPrismaLearningItem.dueDate,
          status: updatedPrismaLearningItem.status,
          progressCached: updatedPrismaLearningItem.progressCached,
          categoryId: updatedPrismaLearningItem.categoryId,
        },
        include: {
          modules: { orderBy: { order: "asc" } },
        },
      })
      expect(toDomainSpy).toHaveBeenCalledWith(updatedPrismaLearningItem)
      expect(result).toEqual(updatedEntityLearningItem)
    })
  })

  describe("updateProgress", () => {
    it("should update progress and return the new value", async () => {
      prisma.learningItem.update = vi.fn().mockResolvedValue({
        ...prismaLearningItemReact,
        progressCached: 75,
      })

      const result = await repository.updateProgress("li-1", 75)

      expect(prisma.learningItem.update).toHaveBeenCalledWith({
        where: { id: "li-1" },
        data: { progressCached: 75 },
      })
      expect(result).toBe(75)
    })
  })

  describe("delete", () => {
    it("should delete the Learning Item by ID", async () => {
      prisma.learningItem.delete = vi.fn().mockResolvedValue({})

      await repository.delete("li-1")

      expect(prisma.learningItem.delete).toHaveBeenCalledWith({
        where: { id: "li-1" },
      })
    })
  })
})
