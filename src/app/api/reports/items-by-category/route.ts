import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeGetDashboardItemsByCategory } from '@/infra/factories/MakeGetDashboardItemsByCategory'
import {
  handleApiError,
  createSuccessResponse,
  createUnauthorizedError,
} from '@/lib/api-errors'

/**
 * GET /api/reports/items-by-category
 *
 * Get count of learning items grouped by category
 *
 * Returns:
 * - Array of { categoryId, categoryName, categoryColor, count }
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Initialize use case
    const getDashboardItemsByCategory = makeGetDashboardItemsByCategory()

    // Execute use case
    const result = await getDashboardItemsByCategory.execute({
      userId: session.user.id,
    })

    return createSuccessResponse(result)
  } catch (error) {
    return handleApiError(error)
  }
}
