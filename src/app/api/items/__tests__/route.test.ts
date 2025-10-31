import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, POST } from '../route'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'
import { Status } from '@prisma/client'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    learningItem: {
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
    },
    module: {
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
  },
}))

describe('GET /api/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/items')
    const response = await GET(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should return paginated learning items', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItems = [
      {
        id: 'item-1',
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TS course',
        dueDate: null,
        status: Status.Backlog,
        progressCached: 0,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'item-2',
        title: 'Learn React',
        descriptionMD: 'Complete React course',
        dueDate: null,
        status: Status.Em_Andamento,
        progressCached: 50,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.learningItem.findMany).mockResolvedValue(mockItems)
    vi.mocked(prisma.learningItem.count).mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/items?page=1&limit=10')
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.meta?.total).toBe(2)
    expect(data.meta?.page).toBe(1)
    expect(data.meta?.limit).toBe(10)
  })

  it('should filter by status', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItems = [
      {
        id: 'item-1',
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TS course',
        dueDate: null,
        status: Status.Backlog,
        progressCached: 0,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.learningItem.findMany).mockResolvedValue(mockItems)
    vi.mocked(prisma.learningItem.count).mockResolvedValue(1)

    const request = new NextRequest(
      'http://localhost:3000/api/items?status=Backlog&page=1&limit=10'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(1)
    expect(data.data[0].status).toBe('Backlog')
  })

  it('should support search query', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItems = [
      {
        id: 'item-1',
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TS course',
        dueDate: null,
        status: Status.Backlog,
        progressCached: 0,
        userId: 'user-123',
        categoryId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.learningItem.findMany).mockResolvedValue(mockItems)
    vi.mocked(prisma.learningItem.count).mockResolvedValue(1)

    const request = new NextRequest(
      'http://localhost:3000/api/items?search=TypeScript&page=1&limit=10'
    )
    const response = await GET(request)

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(prisma.learningItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ title: expect.anything() }),
            expect.objectContaining({ descriptionMD: expect.anything() }),
          ]),
        }),
      })
    )
  })
})

describe('POST /api/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Learn TypeScript',
        descriptionMD: 'Complete course',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should create a learning item without modules', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockCreatedItem = {
      id: 'item-1',
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'user-123',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.learningItem.create).mockResolvedValue(mockCreatedItem)
    vi.mocked(prisma.module.findMany).mockResolvedValue([])

    const request = new NextRequest('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Learn TypeScript',
        descriptionMD: 'Complete TS course',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Learn TypeScript')
    expect(data.data.status).toBe('Backlog')
  })

  it('should create a learning item with modules', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockCreatedItem = {
      id: 'item-1',
      title: 'Learn React',
      descriptionMD: 'Complete React course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'user-123',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const mockModules = [
      {
        id: 'module-1',
        learningItemId: 'item-1',
        title: 'Introduction',
        status: 'Pendente' as any,
        order: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'module-2',
        learningItemId: 'item-1',
        title: 'Components',
        status: 'Pendente' as any,
        order: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(prisma.learningItem.create).mockResolvedValue(mockCreatedItem)
    vi.mocked(prisma.module.createMany).mockResolvedValue({ count: 2 })
    vi.mocked(prisma.module.findMany).mockResolvedValue(mockModules)

    const request = new NextRequest('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Learn React',
        descriptionMD: 'Complete React course',
        modules: [
          { title: 'Introduction', order: 0 },
          { title: 'Components', order: 1 },
        ],
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(201)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Learn React')
    expect(data.data.modules).toHaveLength(2)
  })

  it('should validate required fields', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const request = new NextRequest('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        descriptionMD: 'Missing title',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('VALIDATION_ERROR')
  })

  it('should validate category existence', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    vi.mocked(prisma.category.findUnique).mockResolvedValue(null)

    const request = new NextRequest('http://localhost:3000/api/items', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Learn TypeScript',
        descriptionMD: 'Complete course',
        categoryId: 'invalid-category',
      }),
    })

    const response = await POST(request)

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})
