import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET, POST } from '../route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { Prisma, Status } from '@prisma/client'
import { NextRequest } from 'next/server'

// Mock dependencies
vi.mock('next-auth')
vi.mock('@/lib/prisma', () => ({
  prisma: {
    learningItem: {
      findUnique: vi.fn(),
    },
    dependency: {
      findMany: vi.fn(),
      create: vi.fn(),
      createMany: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}))

const MOCK_USER_ID = 'cmhgxcpyk000104js70687ssk'
const MOCK_ITEM_ID = 'cmhgxcpyk000204js7yp70ruu'
const MOCK_TARGET_ID_1 = 'cmhgxcpyk000304js7118et91'
const MOCK_TARGET_ID_2 = 'cmhgxcpyk000404js2ps8ghwm'

describe('GET /api/items/[id]/dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`
    )
    const response = await GET(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should return 404 if item not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`
    )
    const response = await GET(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should return 403 if user does not own item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue({
      id: MOCK_ITEM_ID,
      userId: 'different-user',
      title: 'Test Item',
      descriptionMD: '',
      dueDate: null,
      status: Status.Backlog,
      categoryId: null,
      progressCached: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`
    )
    const response = await GET(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.success).toBe(false)
  })

  it('should return all dependencies for item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockImplementation((args) => {
      const result = (args?.where?.id === MOCK_ITEM_ID)
        ? {
          id: MOCK_ITEM_ID,
          userId: MOCK_USER_ID,
          title: 'Test Item',
          descriptionMD: '',
          dueDate: null,
          status: Status.Backlog,
          categoryId: null,
          progressCached: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        : {
          id: args?.where?.id as string,
          userId: MOCK_USER_ID,
          title: 'Target Item',
          descriptionMD: '',
          dueDate: null,
          status: Status.Concluido,
          categoryId: null,
          progressCached: 100,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      return Promise.resolve(result) as unknown as Prisma.Prisma__LearningItemClient<typeof result>;
    })

    vi.mocked(prisma.dependency.findMany).mockResolvedValue([
      {
        id: 'dep-1',
        sourceItemId: MOCK_ITEM_ID,
        targetItemId: MOCK_TARGET_ID_1,
        createdAt: new Date(),
      },
    ])

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`
    )
    const response = await GET(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.prerequisites).toHaveLength(1)
    expect(data.data.counts.prerequisites).toBe(1)
  })

  it('should filter dependencies by type=prerequisites', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue({
      id: MOCK_ITEM_ID,
      userId: MOCK_USER_ID,
      title: 'Test Item',
      descriptionMD: '',
      dueDate: null,
      status: Status.Backlog,
      categoryId: null,
      progressCached: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.dependency.findMany).mockResolvedValue([])

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies?type=prerequisites`
    )
    const response = await GET(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data.prerequisites).toBeDefined()
    expect(data.data.dependents).toHaveLength(0)
  })
})

describe('POST /api/items/[id]/dependencies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify({ targetItemId: MOCK_TARGET_ID_1 }),
      }
    )
    const response = await POST(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(401)
    expect(data.success).toBe(false)
  })

  it('should return 404 if source item not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify({ targetItemId: MOCK_TARGET_ID_1 }),
      }
    )
    const response = await POST(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(404)
    expect(data.success).toBe(false)
  })

  it('should create single dependency', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue({
      id: MOCK_ITEM_ID,
      userId: MOCK_USER_ID,
      title: 'Test Item',
      descriptionMD: '',
      dueDate: null,
      status: Status.Backlog,
      categoryId: null,
      progressCached: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.dependency.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.dependency.findMany).mockResolvedValue([])

    vi.mocked(prisma.dependency.create).mockResolvedValue({
      id: 'dep-new',
      sourceItemId: MOCK_ITEM_ID,
      targetItemId: MOCK_TARGET_ID_1,
      createdAt: new Date(),
    })

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify({ targetItemId: MOCK_TARGET_ID_1 }),
      }
    )
    const response = await POST(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.dependency).toBeDefined()
  })

  it('should create multiple dependencies', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue({
      id: MOCK_ITEM_ID,
      userId: MOCK_USER_ID,
      title: 'Test Item',
      descriptionMD: '',
      dueDate: null,
      status: Status.Backlog,
      categoryId: null,
      progressCached: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.dependency.findFirst).mockResolvedValue(null)
    vi.mocked(prisma.dependency.findMany).mockResolvedValue([])

    vi.mocked(prisma.dependency.createMany).mockResolvedValue({ count: 2 })
    vi.mocked(prisma.dependency.findMany).mockResolvedValue([
      {
        id: 'dep-1',
        sourceItemId: MOCK_ITEM_ID,
        targetItemId: MOCK_TARGET_ID_1,
        createdAt: new Date(),
      },
      {
        id: 'dep-2',
        sourceItemId: MOCK_ITEM_ID,
        targetItemId: MOCK_TARGET_ID_2,
        createdAt: new Date(),
      },
    ])

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify({
          targetItemIds: [MOCK_TARGET_ID_1, MOCK_TARGET_ID_2],
        }),
      }
    )
    const response = await POST(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    console.log(data)

    expect(response.status).toBe(201)
    expect(data.success).toBe(true)
    expect(data.data.count).toBe(2)
  })

  it('should return 409 if dependency already exists', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: MOCK_USER_ID },
      expires: '',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue({
      id: MOCK_ITEM_ID,
      userId: MOCK_USER_ID,
      title: 'Test Item',
      descriptionMD: '',
      dueDate: null,
      status: Status.Backlog,
      categoryId: null,
      progressCached: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    vi.mocked(prisma.dependency.findFirst).mockResolvedValue({
      id: 'existing-dep',
      sourceItemId: MOCK_ITEM_ID,
      targetItemId: MOCK_TARGET_ID_1,
      createdAt: new Date(),
    })

    const request = new NextRequest(
      `http://localhost:3000/api/items/${MOCK_ITEM_ID}/dependencies`,
      {
        method: 'POST',
        body: JSON.stringify({ targetItemId: MOCK_TARGET_ID_1 }),
      }
    )
    const response = await POST(request, { params: { id: MOCK_ITEM_ID } })
    const data = await response.json()

    expect(response.status).toBe(409)
    expect(data.success).toBe(false)
  })
})
