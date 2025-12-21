import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeGetDashboardProgressByCategory } from '@/infra/factories/MakeGetDashboardProgressByCategory'
import {
  handleApiError,
  createSuccessResponse,
  createUnauthorizedError,
  createBadRequestError,
} from '@/lib/api-errors'

/**
 * GET /api/reports/progress-by-category
 *
 * Get average progress per category grouped by month
 *
 * Query params:
 * - months: number (default: 6, min: 1, max: 24)
 *
 * Returns:
 * - Array of { month, categoryId, categoryName, averageProgress }
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
    const monthsParam = searchParams.get('months')

    let months = 6 // Default
    if (monthsParam) {
      months = parseInt(monthsParam, 10)
      if (isNaN(months) || months < 1 || months > 24) {
        throw createBadRequestError('Months must be a number between 1 and 24')
      }
    }

    // Initialize use case
    const getDashboardProgressByCategory = makeGetDashboardProgressByCategory()

    // Execute use case
    const result = await getDashboardProgressByCategory.execute({
      userId: session.user.id,
      months,
    })

    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
