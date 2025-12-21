import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { DashboardQueryRepository } from '@/core/interfaces/ReportQueryRepository'
import {
  GetDashboardItemsByStatus,
  GetDashboardItemsByStatusInput,
} from '@/core/use-cases/GetDashboardItemsByStatus'
import type { ItemsByStatusDTO } from '@/core/interfaces/ReportQueryRepository'

describe('GetDashboardItemsByStatus', () => {
  let useCase: GetDashboardItemsByStatus
  let mockDashboardQueryRepo: DashboardQueryRepository
  let mockData: ItemsByStatusDTO[]

  beforeEach(() => {
    mockData = [
      { status: 'Backlog', count: 10 },
      { status: 'Em_Andamento', count: 5 },
      { status: 'Pausado', count: 2 },
      { status: 'Concluido', count: 8 },
    ]

    mockDashboardQueryRepo = {
      getItemsByStatus: vi.fn().mockResolvedValue(mockData),
    } as Partial<DashboardQueryRepository> as DashboardQueryRepository

    useCase = new GetDashboardItemsByStatus(mockDashboardQueryRepo)
  })

  describe('execute', () => {
    it('should return items grouped by status', async () => {
      const input: GetDashboardItemsByStatusInput = {
        userId: 'user-1',
      }

      const result = await useCase.execute(input)

      expect(result).toEqual(mockData)
      expect(result).toHaveLength(4)
    })

    it('should call repository with correct userId', async () => {
      const input: GetDashboardItemsByStatusInput = {
        userId: 'user-123',
      }

      await useCase.execute(input)

      expect(mockDashboardQueryRepo.getItemsByStatus).toHaveBeenCalledWith(
        'user-123'
      )
    })

    it('should return empty array when no items found', async () => {
      mockDashboardQueryRepo.getItemsByStatus = vi.fn().mockResolvedValue([])

      const input: GetDashboardItemsByStatusInput = {
        userId: 'user-1',
      }

      const result = await useCase.execute(input)

      expect(result).toEqual([])
      expect(result).toHaveLength(0)
    })

    it('should return correct data structure', async () => {
      const input: GetDashboardItemsByStatusInput = {
        userId: 'user-1',
      }

      const result = await useCase.execute(input)

      result.forEach(item => {
        expect(item).toHaveProperty('status')
        expect(item).toHaveProperty('count')
        expect(typeof item.status).toBe('string')
        expect(typeof item.count).toBe('number')
      })
    })
  })
})
