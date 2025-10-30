import { vi } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended'

export const prismaMock = mockDeep<PrismaClient>() as unknown as DeepMockProxy<PrismaClient>

vi.mock('@/lib/prisma', () => ({
  prisma: prismaMock,
}))

beforeEach(() => {
  mockReset(prismaMock)
})
