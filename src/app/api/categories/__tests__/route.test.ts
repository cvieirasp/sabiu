import { describe, it, expect, beforeEach, vi } from 'vitest'
import { getServerSession, Session } from 'next-auth'
import { NextRequest } from 'next/server'
import { GET } from '@/app/api/categories/route'
import { makeListCategories } from '@/infra/factories/MakeListCategories'
import { ListCategories } from '@/core/use-cases/ListCategories'

// Mock next-auth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}))

// Mock makeListCategories
vi.mock('@/infra/factories/MakeListCategories', () => ({
  makeListCategories: vi.fn(),
}))

// Mock the execute method of the use case
vi.mock('@/core/use-cases/ListCategories', () => ({
  ListCategories: vi.fn().mockImplementation(() => ({
    execute: vi.fn(),
  })),
}))

describe('/api/categories', () => {
  function mockSession() {
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: 'user-1' },
    } as unknown as Session)
  }

  describe('GET /api/categories', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('should return 401 if not authenticated', async () => {
      vi.mocked(getServerSession).mockResolvedValue(null)

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await GET(request)

      expect(response.status).toBe(401)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.code).toBe('UNAUTHORIZED')
    })

    it('should return categories if authenticated', async () => {
      mockSession()

      const mockCategories = [
        { id: 'cat-1', name: 'MBA', color: '#FF5733' },
        { id: 'cat-2', name: 'Curso', color: '#33FF57' },
        { id: 'cat-3', name: 'Livro', color: '#3357FF' },
      ]

      vi.mocked(makeListCategories).mockReturnValue({
        execute: vi.fn().mockResolvedValue(mockCategories),
      } as unknown as ListCategories)

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual(mockCategories)
    })

    it('should handle errors gracefully', async () => {
      mockSession()

      vi.mocked(makeListCategories).mockReturnValue({
        execute: vi.fn().mockRejectedValue(new Error('Database error')),
      } as unknown as ListCategories)

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await GET(request)

      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data.success).toBe(false)
      expect(data.error.message).toBe('Database error')
    })

    it('should return empty array if no categories exist', async () => {
      mockSession()

      vi.mocked(makeListCategories).mockReturnValue({
        execute: vi.fn().mockResolvedValue([]),
      } as unknown as ListCategories)

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await GET(request)

      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.success).toBe(true)
      expect(data.data).toEqual([])
    })

    it('should call the use case to fetch categories', async () => {
      const executeSpy = vi.fn().mockResolvedValue([])
      mockSession()

      vi.mocked(makeListCategories).mockReturnValue({
        execute: executeSpy,
      } as unknown as ListCategories)

      const request = new NextRequest('http://localhost:3000/api/categories')
      const response = await GET(request)
      expect(response.status).toBe(200)
      expect(executeSpy).toHaveBeenCalledTimes(1)
    })
  })
})
