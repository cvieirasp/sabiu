import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { makeListCategories } from '@/infra/factories/MakeListCategories'

import {
  handleApiError,
  createSuccessResponse,
  createUnauthorizedError,
} from '@/lib/api-errors'

/**
 * GET /api/categories
 *
 * List all categories
 *
 */
export async function GET(_request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    const categories = await makeListCategories().execute()
    return createSuccessResponse(categories)
  } catch (error) {
    return handleApiError(error)
  }
}