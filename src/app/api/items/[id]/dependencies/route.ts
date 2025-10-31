import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { PrismaDependencyRepository } from '@/infra/repositories/PrismaDependencyRepository'
import { PrismaLearningItemRepository } from '@/infra/repositories/PrismaLearningItemRepository'
import { Dependency } from '@/core/entities'
import {
  createDependencySchema,
  createManyDependenciesSchema,
} from '@/lib/validations/dependency'
import {
  ApiError,
  ApiErrorCode,
  handleApiError,
  createSuccessResponse,
} from '@/lib/api-errors'

/**
 * GET /api/items/[id]/dependencies
 * List all dependencies for a learning item
 *
 * Query params:
 * - type: 'prerequisites' | 'dependents' | 'all' (default: 'all')
 *
 * Returns:
 * - prerequisites: items that this item depends on
 * - dependents: items that depend on this item
 * - all: both prerequisites and dependents
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', ApiErrorCode.UNAUTHORIZED, 401)
    }

    const itemId = params.id
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'all'

    if (!['prerequisites', 'dependents', 'all'].includes(type)) {
      throw new ApiError(
        'Invalid type parameter. Must be: prerequisites, dependents, or all',
        ApiErrorCode.VALIDATION_ERROR,
        400
      )
    }

    // Verify item exists and belongs to user
    const itemRepository = new PrismaLearningItemRepository(prisma)
    const item = await itemRepository.findById(itemId)

    if (!item) {
      throw new ApiError('Learning item not found', ApiErrorCode.NOT_FOUND, 404)
    }

    if (item.userId !== session.user.id) {
      throw new ApiError(
        'You do not have permission to access this item',
        ApiErrorCode.FORBIDDEN,
        403
      )
    }

    const dependencyRepository = new PrismaDependencyRepository(prisma)

    let prerequisites: Dependency[] = []
    let dependents: Dependency[] = []

    if (type === 'prerequisites' || type === 'all') {
      prerequisites = await dependencyRepository.getPrerequisites(itemId)
    }

    if (type === 'dependents' || type === 'all') {
      dependents = await dependencyRepository.getDependents(itemId)
    }

    // Get item details for each dependency
    const prerequisiteData = await Promise.all(
      prerequisites.map(async (dep) => {
        const targetItem = await itemRepository.findById(dep.targetItemId)
        return {
          id: dep.id,
          sourceItemId: dep.sourceItemId,
          targetItemId: dep.targetItemId,
          createdAt: dep.createdAt,
          targetItem: targetItem
            ? {
                id: targetItem.id,
                title: targetItem.title,
                status: targetItem.status.value,
              }
            : null,
        }
      })
    )

    const dependentData = await Promise.all(
      dependents.map(async (dep) => {
        const sourceItem = await itemRepository.findById(dep.sourceItemId)
        return {
          id: dep.id,
          sourceItemId: dep.sourceItemId,
          targetItemId: dep.targetItemId,
          createdAt: dep.createdAt,
          sourceItem: sourceItem
            ? {
                id: sourceItem.id,
                title: sourceItem.title,
                status: sourceItem.status.value,
              }
            : null,
        }
      })
    )

    return createSuccessResponse({
      prerequisites: prerequisiteData,
      dependents: dependentData,
      counts: {
        prerequisites: prerequisites.length,
        dependents: dependents.length,
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/items/[id]/dependencies
 * Create one or more dependencies for a learning item
 *
 * Body (single):
 * - targetItemId: string (CUID)
 *
 * Body (multiple):
 * - targetItemIds: string[] (array of CUIDs)
 *
 * Creates dependencies where [id] depends on target items
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw new ApiError('Unauthorized', ApiErrorCode.UNAUTHORIZED, 401)
    }

    const sourceItemId = params.id
    const body = await request.json()

    // Verify source item exists and belongs to user
    const itemRepository = new PrismaLearningItemRepository(prisma)
    const sourceItem = await itemRepository.findById(sourceItemId)

    if (!sourceItem) {
      throw new ApiError('Source learning item not found', ApiErrorCode.NOT_FOUND, 404)
    }

    if (sourceItem.userId !== session.user.id) {
      throw new ApiError(
        'You do not have permission to modify this item',
        ApiErrorCode.FORBIDDEN,
        403
      )
    }

    const dependencyRepository = new PrismaDependencyRepository(prisma)

    // Check if creating single or multiple dependencies
    if (Array.isArray(body.targetItemIds)) {
      // Multiple dependencies
      const validated = createManyDependenciesSchema.parse({
        sourceItemId,
        targetItemIds: body.targetItemIds,
      })

      // Verify all target items exist and belong to user
      const targetItems = await Promise.all(
        validated.targetItemIds.map((id) => itemRepository.findById(id))
      )

      for (let i = 0; i < targetItems.length; i++) {
        const targetItem = targetItems[i]
        const targetId = validated.targetItemIds[i]

        if (!targetItem) {
          throw new ApiError(
            `Target item ${targetId} not found`,
            ApiErrorCode.NOT_FOUND,
            404
          )
        }

        if (targetItem.userId !== session.user.id) {
          throw new ApiError(
            `You do not have permission to create dependency with item ${targetId}`,
            ApiErrorCode.FORBIDDEN,
            403
          )
        }
      }

      // Check for existing dependencies and circular references
      const dependenciesToCreate: Dependency[] = []

      for (const targetItemId of validated.targetItemIds) {
        // Check if dependency already exists
        const exists = await dependencyRepository.exists(
          sourceItemId,
          targetItemId
        )
        if (exists) {
          throw new ApiError(
            `Dependency with target ${targetItemId} already exists`,
            ApiErrorCode.CONFLICT,
            409
          )
        }

        // Check for circular dependencies
        const wouldCycle = await dependencyRepository.wouldCreateCycle(
          sourceItemId,
          targetItemId
        )
        if (wouldCycle) {
          throw new ApiError(
            `Creating dependency with ${targetItemId} would create a circular reference`,
            ApiErrorCode.VALIDATION_ERROR,
            400
          )
        }

        // Create dependency entity
        const dependency = Dependency.create({
          id: crypto.randomUUID(),
          sourceItemId,
          targetItemId,
        })

        dependenciesToCreate.push(dependency)
      }

      // Create all dependencies
      const created = await dependencyRepository.createMany(
        dependenciesToCreate
      )

      return createSuccessResponse(
        {
          dependencies: created.map((dep) => ({
            id: dep.id,
            sourceItemId: dep.sourceItemId,
            targetItemId: dep.targetItemId,
            createdAt: dep.createdAt,
          })),
          count: created.length,
        },
      )
    } else {
      // Single dependency
      const validated = createDependencySchema.parse({
        sourceItemId,
        targetItemId: body.targetItemId,
      })

      // Verify target item exists and belongs to user
      const targetItem = await itemRepository.findById(validated.targetItemId)

      if (!targetItem) {
        throw new ApiError('Target learning item not found', ApiErrorCode.NOT_FOUND, 404)
      }

      if (targetItem.userId !== session.user.id) {
        throw new ApiError(
          'You do not have permission to create dependency with this item',
          ApiErrorCode.FORBIDDEN,
          403
        )
      }

      // Check if dependency already exists
      const exists = await dependencyRepository.exists(
        sourceItemId,
        validated.targetItemId
      )
      if (exists) {
        throw new ApiError(
          'Dependency already exists',
          ApiErrorCode.CONFLICT,
          409
        )
      }

      // Check for circular dependencies
      const wouldCycle = await dependencyRepository.wouldCreateCycle(
        sourceItemId,
        validated.targetItemId
      )
      if (wouldCycle) {
        throw new ApiError(
          'Creating this dependency would create a circular reference',
          ApiErrorCode.VALIDATION_ERROR,
          400
        )
      }

      // Create dependency entity
      const dependency = Dependency.create({
        id: crypto.randomUUID(),
        sourceItemId,
        targetItemId: validated.targetItemId,
      })

      // Save to database
      const created = await dependencyRepository.create(dependency)

      return createSuccessResponse(
        {
          dependency: {
            id: created.id,
            sourceItemId: created.sourceItemId,
            targetItemId: created.targetItemId,
            createdAt: created.createdAt,
          },
        }
      )
    }
  } catch (error) {
    return handleApiError(error)
  }
}
