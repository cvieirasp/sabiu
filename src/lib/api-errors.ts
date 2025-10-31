import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

/**
 * Standard API Error Response structure
 */
export interface ApiErrorResponse {
  success: false
  error: {
    message: string
    code: string
    details?: any
  }
}

/**
 * Standard API Success Response structure
 */
export interface ApiSuccessResponse<T = any> {
  success: true
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

/**
 * API Error codes
 */
export enum ApiErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  BAD_REQUEST = 'BAD_REQUEST',
  CONFLICT = 'CONFLICT',
}

/**
 * Custom API Error class
 */
export class ApiError extends Error {
  constructor(
    public message: string,
    public code: ApiErrorCode,
    public statusCode: number,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }

  toJSON(): ApiErrorResponse {
    return {
      success: false,
      error: {
        message: this.message,
        code: this.code,
        details: this.details,
      },
    }
  }
}

/**
 * Creates a validation error from Zod error
 */
export function createValidationError(error: ZodError<any>): ApiError {
  const details = error.issues.map((err: any) => ({
    path: err.path.join('.'),
    message: err.message,
  }))

  return new ApiError(
    'Erro de validação',
    ApiErrorCode.VALIDATION_ERROR,
    400,
    details
  )
}

/**
 * Creates a not found error
 */
export function createNotFoundError(resource: string): ApiError {
  return new ApiError(
    `${resource} não encontrado`,
    ApiErrorCode.NOT_FOUND,
    404
  )
}

/**
 * Creates an unauthorized error
 */
export function createUnauthorizedError(
  message: string = 'Não autorizado'
): ApiError {
  return new ApiError(message, ApiErrorCode.UNAUTHORIZED, 401)
}

/**
 * Creates a forbidden error
 */
export function createForbiddenError(
  message: string = 'Acesso negado'
): ApiError {
  return new ApiError(message, ApiErrorCode.FORBIDDEN, 403)
}

/**
 * Creates an internal error
 */
export function createInternalError(
  message: string = 'Erro interno do servidor'
): ApiError {
  return new ApiError(message, ApiErrorCode.INTERNAL_ERROR, 500)
}

/**
 * Creates a bad request error
 */
export function createBadRequestError(message: string): ApiError {
  return new ApiError(message, ApiErrorCode.BAD_REQUEST, 400)
}

/**
 * Creates a conflict error
 */
export function createConflictError(message: string): ApiError {
  return new ApiError(message, ApiErrorCode.CONFLICT, 409)
}

/**
 * Handles errors and returns appropriate NextResponse
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('API Error:', error)

  // Handle ApiError
  if (error instanceof ApiError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Handle ZodError
  if (error instanceof ZodError) {
    const apiError = createValidationError(error)
    return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
  }

  // Handle domain errors (from entities)
  if (error instanceof Error) {
    // Check if it's a domain validation error
    if (
      error.message.includes('cannot be empty') ||
      error.message.includes('cannot exceed') ||
      error.message.includes('must be') ||
      error.message.includes('invalid') ||
      error.message.includes('Invalid')
    ) {
      const apiError = new ApiError(
        error.message,
        ApiErrorCode.VALIDATION_ERROR,
        400
      )
      return NextResponse.json(apiError.toJSON(), {
        status: apiError.statusCode,
      })
    }

    // Check if it's a not found error
    if (error.message.includes('not found')) {
      const apiError = new ApiError(
        error.message,
        ApiErrorCode.NOT_FOUND,
        404
      )
      return NextResponse.json(apiError.toJSON(), {
        status: apiError.statusCode,
      })
    }

    // Generic domain error
    const apiError = new ApiError(
      error.message,
      ApiErrorCode.BAD_REQUEST,
      400
    )
    return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
  }

  // Unknown error
  const apiError = createInternalError()
  return NextResponse.json(apiError.toJSON(), { status: apiError.statusCode })
}

/**
 * Creates a success response
 */
export function createSuccessResponse<T>(
  data: T,
  meta?: {
    total?: number
    page?: number
    limit?: number
  }
): NextResponse<ApiSuccessResponse<T>> {
  const response: ApiSuccessResponse<T> = {
    success: true,
    data,
  }

  if (meta) {
    response.meta = {
      ...meta,
      hasMore: meta.total && meta.page && meta.limit
        ? meta.page * meta.limit < meta.total
        : undefined,
    }
  }

  return NextResponse.json(response)
}

/**
 * Creates a created response (201)
 */
export function createCreatedResponse<T>(
  data: T
): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: 201 }
  )
}

/**
 * Creates a no content response (204)
 */
export function createNoContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}
