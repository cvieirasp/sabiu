import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  updateLearningItemSchema,
  cuidSchema,
} from '@/lib/validations/learning-item'
import {
  handleApiError,
  createSuccessResponse,
  createNoContentResponse,
  createUnauthorizedError,
  createNotFoundError,
} from '@/lib/api-errors'
import {
  PrismaLearningItemRepository,
  PrismaModuleRepository,
  PrismaCategoryRepository,
  PrismaDependencyRepository,
} from '@/infra/repositories'
import {
  GetLearningItem,
  UpdateLearningItem,
  DeleteLearningItem,
} from '@/core/use-cases'
import { StatusVO } from '@/core/value-objects'

/**
 * GET /api/items/[id]
 *
 * Get a single learning item by ID
 *
 * Query params:
 * - includeModules: 'true' | 'false' (default: 'false')
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Validate ID
    const id = cuidSchema.parse(params.id)

    // Parse query params
    const searchParams = request.nextUrl.searchParams
    const includeModules = searchParams.get('includeModules') === 'true'

    // Initialize repository and use case
    const learningItemRepository = new PrismaLearningItemRepository(prisma)
    const getLearningItem = new GetLearningItem(learningItemRepository)

    // Execute use case
    const result = await getLearningItem.execute({
      id,
      userId: session.user.id,
      includeModules,
    })

    // Map domain entity to response DTO
    const item = {
      id: result.learningItem.id,
      title: result.learningItem.title,
      descriptionMD: result.learningItem.descriptionMD,
      dueDate: result.learningItem.dueDate,
      status: result.learningItem.status.value,
      progress: result.learningItem.progress.value,
      userId: result.learningItem.userId,
      categoryId: result.learningItem.categoryId,
      createdAt: result.learningItem.createdAt,
      updatedAt: result.learningItem.updatedAt,
      modules: includeModules
        ? result.learningItem.modules.map((module) => ({
            id: module.id,
            learningItemId: module.learningItemId,
            title: module.title,
            status: module.status.value,
            order: module.order,
            createdAt: module.createdAt,
            updatedAt: module.updatedAt,
          }))
        : undefined,
    }

    return createSuccessResponse(item)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * PUT /api/items/[id]
 *
 * Update a learning item
 *
 * Body:
 * - title: string (optional)
 * - descriptionMD: string (optional)
 * - dueDate: ISO date string or null (optional)
 * - status: Status enum (optional)
 * - categoryId: string or null (optional)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Validate ID
    const id = cuidSchema.parse(params.id)

    // Parse and validate request body
    const body = await request.json()
    const validatedData = updateLearningItemSchema.parse(body)

    // Convert status string to StatusVO if provided
    const statusVO = validatedData.status
      ? StatusVO.create(validatedData.status)
      : undefined

    // Initialize repositories and use case
    const learningItemRepository = new PrismaLearningItemRepository(prisma)
    const moduleRepository = new PrismaModuleRepository(prisma)
    const categoryRepository = new PrismaCategoryRepository(prisma)

    const updateLearningItem = new UpdateLearningItem(
      learningItemRepository,
      moduleRepository,
      categoryRepository
    )

    // Execute use case
    const result = await updateLearningItem.execute({
      id,
      userId: session.user.id,
      title: validatedData.title,
      descriptionMD: validatedData.descriptionMD,
      dueDate: validatedData.dueDate,
      status: statusVO,
      categoryId: validatedData.categoryId,
    })

    // Map domain entity to response DTO
    const item = {
      id: result.learningItem.id,
      title: result.learningItem.title,
      descriptionMD: result.learningItem.descriptionMD,
      dueDate: result.learningItem.dueDate,
      status: result.learningItem.status.value,
      progress: result.learningItem.progress.value,
      userId: result.learningItem.userId,
      categoryId: result.learningItem.categoryId,
      createdAt: result.learningItem.createdAt,
      updatedAt: result.learningItem.updatedAt,
      modules: result.learningItem.modules.map((module) => ({
        id: module.id,
        learningItemId: module.learningItemId,
        title: module.title,
        status: module.status.value,
        order: module.order,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      })),
    }

    return createSuccessResponse(item)
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * DELETE /api/items/[id]
 *
 * Delete a learning item
 *
 * Cascades to modules and dependencies
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Validate ID
    const id = cuidSchema.parse(params.id)

    // Initialize repositories and use case
    const learningItemRepository = new PrismaLearningItemRepository(prisma)
    const dependencyRepository = new PrismaDependencyRepository(prisma)

    const deleteLearningItem = new DeleteLearningItem(
      learningItemRepository,
      dependencyRepository
    )

    // Execute use case
    const result = await deleteLearningItem.execute({
      id,
      userId: session.user.id,
    })

    if (!result.success) {
      throw createNotFoundError('Item de aprendizado')
    }

    return createNoContentResponse()
  } catch (error) {
    return handleApiError(error)
  }
}
