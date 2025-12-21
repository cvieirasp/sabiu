import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeGetDashboardRecentlyViewedItems } from '@/infra/factories/MakeGetDashboardRecentlyViewedItems'
import {
  handleApiError,
  createSuccessResponse,
  createUnauthorizedError,
  createBadRequestError,
} from '@/lib/api-errors'

/**
 * GET /api/reports/recently-viewed
 *
 * Get recently viewed/updated learning items
 *
 * Query params:
 * - limit: number (default: 5, min: 1, max: 50)
 *
 * Returns:
 * - Array of { id, title, categoryName, categoryType, progress, viewedAt }
 */
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Parse and validate query params
    const searchParams = request.nextUrl.searchParams
    const limitParam = searchParams.get('limit')

    let limit = 5 // Default
    if (limitParam) {
      limit = parseInt(limitParam, 10)
      if (isNaN(limit) || limit < 1 || limit > 50) {
        throw createBadRequestError('Limit must be a number between 1 and 50')
      }
    }

    // Initialize use case
    const getDashboardRecentlyViewedItems = makeGetDashboardRecentlyViewedItems()

    // Execute use case
    const result = await getDashboardRecentlyViewedItems.execute({
      userId: session.user.id,
      limit,
    })

    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
