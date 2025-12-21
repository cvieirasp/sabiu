import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeGetDashboardItemsByStatus } from '@/infra/factories/MakeGetDashboardItemsByStatus'
import {
  handleApiError,
  createSuccessResponse,
  createUnauthorizedError,
} from '@/lib/api-errors'

/**
 * GET /api/reports/items-by-status
 *
 * Get count of learning items grouped by status
 *
 * Returns:
 * - Array of { status, count }
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Initialize use case
    const getDashboardItemsByStatus = makeGetDashboardItemsByStatus()

    // Execute use case
    const result = await getDashboardItemsByStatus.execute({
      userId: session.user.id,
    })

    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
