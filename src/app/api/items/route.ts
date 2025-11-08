import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import {
  createLearningItemSchema,
  listLearningItemsQuerySchema,
} from '@/lib/validations/learning-item'
import {
  handleApiError,
  createSuccessResponse,
  createCreatedResponse,
  createUnauthorizedError,
} from '@/lib/api-errors'
import { StatusVO } from '@/core/value-objects'
import { makeCreateLearningItem } from '@/infra/factories/MakeCreateLearningItem'
import { makeListLearningItems } from '@/infra/factories/MakeListLearningItems'

/**
 * GET /api/items
 *
 * List learning items with filtering, pagination and sorting
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - status: Status enum (optional)
 * - categoryId: string (optional)
 * - tagIds: comma-separated string (optional)
 * - search: string (optional)
 * - orderBy: 'title' | 'createdAt' | 'updatedAt' | 'dueDate' | 'progress' | 'status' (default: 'createdAt')
 * - order: 'asc' | 'desc' (default: 'desc')
 * - includeModules: 'true' | 'false' (default: 'false')
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
    const queryParams = Object.fromEntries(searchParams.entries())

    const validatedParams = listLearningItemsQuerySchema.parse(queryParams)

    // Calculate skip for pagination
    const skip = (validatedParams.page - 1) * validatedParams.limit

    // Convert status string to StatusVO if provided
    const statusVO = validatedParams.status
      ? StatusVO.create(validatedParams.status)
      : undefined

    // Initialize use case
    const listLearningItems = makeListLearningItems()

    // Execute use case
    const result = await listLearningItems.execute({
      userId: session.user.id,
      filters: {
        status: statusVO,
        categoryId: validatedParams.categoryId,
        tagIds: validatedParams.tagIds,
        search: validatedParams.search,
      },
      pagination: {
        skip,
        take: validatedParams.limit,
      },
      sorting: {
        orderBy: validatedParams.orderBy,
        order: validatedParams.order,
      },
      includeModules: validatedParams.includeModules,
    })

    // Map domain entities to response DTOs
    const items = result.learningItems.map(item => ({
      id: item.id,
      title: item.title,
      descriptionMD: item.descriptionMD,
      dueDate: item.dueDate,
      status: item.status,
      progress: item.progress,
      userId: item.userId,
      category: {
        id: item.category.id,
        name: item.category.name,
        color: item.category.color,
      },
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    return createSuccessResponse(items, {
      total: result.total,
      page: validatedParams.page,
      limit: validatedParams.limit,
    })
  } catch (error) {
    return handleApiError(error)
  }
}

/**
 * POST /api/items
 *
 * Create a new learning item
 *
 * Body:
 * - title: string (required)
 * - descriptionMD: string (optional)
 * - dueDate: ISO date string (optional)
 * - categoryId: string (optional)
 * - modules: Array<{ title: string, order: number }> (optional)
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      throw createUnauthorizedError()
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = createLearningItemSchema.parse(body)

    // Initialize use case
    const createLearningItem = makeCreateLearningItem()

    // Execute use case
    const result = await createLearningItem.execute({
      title: validatedData.title,
      descriptionMD: validatedData.descriptionMD,
      dueDate: validatedData.dueDate,
      userId: session.user.id,
      categoryId: validatedData.categoryId,
      modules: validatedData.modules,
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
      modules: result.modules.map(module => ({
        id: module.id,
        learningItemId: module.learningItemId,
        title: module.title,
        status: module.status.value,
        order: module.order,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      })),
    }

    return createCreatedResponse(item)
  } catch (error) {
    return handleApiError(error)
  }
}
