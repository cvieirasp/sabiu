import type { PrismaClient } from "@prisma/client"
import { describe, it, expect, beforeEach, vi } from "vitest"
import { Category } from '@/core/entities/Category'
import { PrismaCategoryRepository } from '@/infra/repositories/PrismaCategoryRepository'

// Helper: cria um mock mínimo do PrismaClient só com o que usamos
function makePrismaMock() {
  return {
    category: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  } as unknown as PrismaClient
}

describe("PrismaCategoryRepository", () => {

})
