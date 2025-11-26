import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PrismaDependencyRepository } from '@/infra/repositories/PrismaDependencyRepository'
import { PrismaLearningItemRepository } from '@/infra/repositories/PrismaLearningItemRepository'
import {
  ApiError,
  ApiErrorCode,
  handleApiError,
  createSuccessResponse,
} from '@/lib/api-errors'

/**
 * DELETE /api/items/[id]/dependencies/[dependencyId]
 * Delete a specific dependency
 *
 * Params:
 * - id: source item ID
 * - dependencyId: dependency ID to delete
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; dependencyId: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', ApiErrorCode.UNAUTHORIZED, 401)
    }

    const { id: itemId, dependencyId } = params

    // Verify item exists and belongs to user
    const itemRepository = new PrismaLearningItemRepository(prisma)
    const item = await itemRepository.findById(itemId)

    if (!item) {
      throw new ApiError('Learning item not found', ApiErrorCode.NOT_FOUND, 404)
    }

    if (item.userId !== session.user.id) {
      throw new ApiError(
        'You do not have permission to modify this item',
        ApiErrorCode.FORBIDDEN,
        403
      )
    }

    const dependencyRepository = new PrismaDependencyRepository(prisma)

    // Verify dependency exists
    const dependency = await dependencyRepository.findById(dependencyId)

    if (!dependency) {
      throw new ApiError('Dependency not found', ApiErrorCode.NOT_FOUND, 404)
    }

    // Verify dependency belongs to this item (either as source or target)
    if (
      dependency.sourceItemId !== itemId &&
      dependency.targetItemId !== itemId
    ) {
      throw new ApiError(
        'Dependency does not belong to this item',
        ApiErrorCode.FORBIDDEN,
        403
      )
    }

    try {
      await dependencyRepository.delete(dependencyId)
    } catch (error) {
      console.error('Error deleting dependency:', error)
      throw new ApiError(
        'Failed to delete dependency',
        ApiErrorCode.INTERNAL_ERROR,
        500
      )
    }

    return createSuccessResponse({
      message: 'Dependency deleted successfully',
      id: dependencyId,
    })
  } catch (error) {
    return handleApiError(error)
  }
}
