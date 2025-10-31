import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PrismaDependencyRepository } from '@/infra/repositories/PrismaDependencyRepository'
import { PrismaLearningItemRepository } from '@/infra/repositories/PrismaLearningItemRepository'
import { checkCircularDependencySchema } from '@/lib/validations/dependency'
import {
  ApiError,
  ApiErrorCode,
  handleApiError,
  createSuccessResponse,
} from '@/lib/api-errors'

/**
 * POST /api/dependencies/check-circular
 * Check if creating a dependency would create a circular reference
 *
 * Body:
 * - sourceItemId: string (CUID)
 * - targetItemId: string (CUID)
 *
 * Returns:
 * - wouldCreateCycle: boolean
 * - message: string (explanation)
 */
export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', ApiErrorCode.UNAUTHORIZED, 401)
    }

    const body = await request.json()
    const validated = checkCircularDependencySchema.parse(body)

    // Verify both items exist and belong to user
    const itemRepository = new PrismaLearningItemRepository(prisma)
    const sourceItem = await itemRepository.findById(validated.sourceItemId)
    const targetItem = await itemRepository.findById(validated.targetItemId)

    if (!sourceItem || !targetItem) {
      throw new ApiError('One or both items not found', ApiErrorCode.NOT_FOUND, 404)
    }

    if (
      sourceItem.userId !== session.user.id ||
      targetItem.userId !== session.user.id
    ) {
      throw new ApiError(
        'You do not have permission to access these items',
        ApiErrorCode.FORBIDDEN,
        403
      )
    }

    // Check for self-dependency
    if (validated.sourceItemId === validated.targetItemId) {
      return createSuccessResponse({
        wouldCreateCycle: true,
        message: 'An item cannot depend on itself',
        type: 'self-dependency',
      })
    }

    // Check for circular dependency
    const dependencyRepository = new PrismaDependencyRepository(prisma)
    const wouldCycle = await dependencyRepository.wouldCreateCycle(
      validated.sourceItemId,
      validated.targetItemId
    )

    if (wouldCycle) {
      return createSuccessResponse({
        wouldCreateCycle: true,
        message:
          'Creating this dependency would create a circular reference in the dependency chain',
        type: 'circular-dependency',
      })
    }

    return createSuccessResponse({
      wouldCreateCycle: false,
      message: 'This dependency can be created safely',
    })
  } catch (error) {
    return handleApiError(error)
  }
}
