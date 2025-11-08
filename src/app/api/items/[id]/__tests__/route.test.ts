import { describe, it, expect, beforeEach, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { GET, PUT, DELETE } from '../route'
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
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    module: {
      findMany: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
    dependency: {
      deleteMany: vi.fn(),
    },
  },
}))

// Valid CUID for testing
const VALID_ITEM_ID = 'clxyz1234567890abc'

describe('GET /api/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${VALID_ITEM_ID}`
    )
    const response = await GET(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should return 404 if item not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${VALID_ITEM_ID}`
    )
    const response = await GET(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('should return learning item without modules', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItem = {
      id: VALID_ITEM_ID,
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

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(mockItem)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${VALID_ITEM_ID}`
    )
    const response = await GET(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.id).toBe(VALID_ITEM_ID)
    expect(data.data.title).toBe('Learn TypeScript')
    expect(data.data.modules).toBeUndefined()
  })

  it('should return learning item with modules', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItem = {
      id: VALID_ITEM_ID,
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'user-123',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [
        {
          id: 'module-1',
          learningItemId: VALID_ITEM_ID,
          title: 'Introduction',
          status: 'Pendente' as any,
          order: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    }

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(mockItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}?includeModules=true'
    )
    const response = await GET(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.modules).toBeDefined()
    expect(data.data.modules).toHaveLength(1)
  })

  it('should return 400 if user does not own the item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItem = {
      id: VALID_ITEM_ID,
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'other-user',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(mockItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}'
    )
    const response = await GET(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})

describe('PUT /api/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
      }
    )

    const response = await PUT(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should update learning item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockExistingItem = {
      id: VALID_ITEM_ID,
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'user-123',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    }

    const mockUpdatedItem = {
      ...mockExistingItem,
      title: 'Updated Title',
      updatedAt: new Date(),
    }

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(
      mockExistingItem
    )
    vi.mocked(prisma.module.findMany).mockResolvedValue([])
    vi.mocked(prisma.learningItem.update).mockResolvedValue(mockUpdatedItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
      }
    )

    const response = await PUT(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.title).toBe('Updated Title')
  })

  it('should update status', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockExistingItem = {
      id: VALID_ITEM_ID,
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'user-123',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    }

    const mockUpdatedItem = {
      ...mockExistingItem,
      status: Status.Em_Andamento,
      updatedAt: new Date(),
    }

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(
      mockExistingItem
    )
    vi.mocked(prisma.module.findMany).mockResolvedValue([])
    vi.mocked(prisma.learningItem.update).mockResolvedValue(mockUpdatedItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'PUT',
        body: JSON.stringify({ status: 'Em_Andamento' }),
      }
    )

    const response = await PUT(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(200)
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data.status).toBe('Em_Andamento')
  })

  it('should return 400 if user does not own the item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItem = {
      id: VALID_ITEM_ID,
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'other-user',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      modules: [],
    }

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(mockItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
      }
    )

    const response = await PUT(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})

describe('DELETE /api/items/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 401 if not authenticated', async () => {
    vi.mocked(getServerSession).mockResolvedValue(null)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'DELETE',
      }
    )

    const response = await DELETE(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(401)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error.code).toBe('UNAUTHORIZED')
  })

  it('should delete learning item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItem = {
      id: VALID_ITEM_ID,
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

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(mockItem)
    vi.mocked(prisma.dependency.deleteMany).mockResolvedValue({ count: 0 })
    vi.mocked(prisma.learningItem.delete).mockResolvedValue(mockItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'DELETE',
      }
    )

    const response = await DELETE(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(204)
    expect(prisma.learningItem.delete).toHaveBeenCalledWith({
      where: { id: VALID_ITEM_ID },
    })
  })

  it('should return 404 if item not found', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(null)

    const request = new NextRequest(
      `http://localhost:3000/api/items/${VALID_ITEM_ID}`,
      {
        method: 'DELETE',
      }
    )

    const response = await DELETE(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(404)
    const data = await response.json()
    expect(data.success).toBe(false)
  })

  it('should return 400 if user does not own the item', async () => {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      expires: '2025-12-31',
    })

    const mockItem = {
      id: VALID_ITEM_ID,
      title: 'Learn TypeScript',
      descriptionMD: 'Complete TS course',
      dueDate: null,
      status: Status.Backlog,
      progressCached: 0,
      userId: 'other-user',
      categoryId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    vi.mocked(prisma.learningItem.findUnique).mockResolvedValue(mockItem)

    const request = new NextRequest(
      'http://localhost:3000/api/items/${VALID_ITEM_ID}',
      {
        method: 'DELETE',
      }
    )

    const response = await DELETE(request, { params: { id: VALID_ITEM_ID } })

    expect(response.status).toBe(400)
    const data = await response.json()
    expect(data.success).toBe(false)
  })
})
