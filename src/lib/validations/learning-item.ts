import { z } from 'zod'
import { Status } from '@/core/value-objects/Status'

/**
 * Zod schema for LearningItem creation
 */
export const createLearningItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode exceder 200 caracteres')
    .trim(),
  descriptionMD: z.string().default(''),
  dueDate: z.iso
    .datetime()
    .optional()
    .nullable()
    .transform(val => (val ? new Date(val) : null)),
  categoryId: z.cuid(),
  modules: z
    .array(
      z.object({
        id: z.string().optional(), // ID temporário para módulos novos
        title: z.string().min(1, 'Título do módulo é obrigatório'),
        order: z.number().int().min(0),
      })
    )
    .optional()
    .default([]),
  dependencyIds: z.array(z.string()).optional().default([]),
})

export type CreateLearningItemInput = z.infer<typeof createLearningItemSchema>

/**
 * Zod schema for LearningItem update
 */
export const updateLearningItemSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode exceder 200 caracteres')
    .trim()
    .optional(),
  descriptionMD: z.string().optional(),
  dueDate: z.iso
    .datetime()
    .optional()
    .nullable()
    .transform(val =>
      val === undefined ? undefined : val ? new Date(val) : null
    ),
  status: z.enum(Status).optional(),
  categoryId: z.cuid2().optional(),
})

export type UpdateLearningItemInput = z.infer<typeof updateLearningItemSchema>

/**
 * Zod schema for LearningItem query filters
 */
export const learningItemFiltersSchema = z.object({
  status: z.enum(Status).optional(),
  categoryId: z.cuid().optional(),
  tagIds: z
    .string()
    .transform(val => val.split(',').filter(Boolean))
    .pipe(z.array(z.cuid()))
    .optional(),
  search: z.string().optional(),
})

export type LearningItemFilters = z.infer<typeof learningItemFiltersSchema>

/**
 * Zod schema for pagination
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1)),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100)),
})

export type PaginationParams = z.infer<typeof paginationSchema>

/**
 * Zod schema for sorting
 */
export const sortingSchema = z.object({
  orderBy: z
    .enum([
      'title',
      'createdAt',
      'updatedAt',
      'dueDate',
      'progressCached',
      'status',
    ])
    .optional()
    .default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

export type SortingParams = z.infer<typeof sortingSchema>

/**
 * Zod schema for GET /api/items query params
 */
export const listLearningItemsQuerySchema = z
  .object({})
  .extend(learningItemFiltersSchema.shape)
  .extend(paginationSchema.shape)
  .extend(sortingSchema.shape)
  .extend({
    includeModules: z
      .string()
      .optional()
      .transform(val => val === 'true')
      .pipe(z.boolean())
      .optional()
      .default(false),
  })

export type ListLearningItemsQuery = z.infer<
  typeof listLearningItemsQuerySchema
>

/**
 * Zod schema for CUID validation
 */
export const cuidSchema = z.cuid2('ID inválido')

/**
 * Helper to validate status string and convert to StatusVO
 */
export function validateStatus(status: string): Status {
  const result = z.enum(Status).safeParse(status)
  if (!result.success) {
    throw new Error(`Status inválido: ${status}`)
  }
  return result.data
}
