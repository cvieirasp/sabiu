import { z } from 'zod'

/**
 * Schema for creating a new dependency
 */
export const createDependencySchema = z.object({
  sourceItemId: z.cuid('Invalid source item ID format'),
  targetItemId: z.cuid('Invalid target item ID format'),
})

export type CreateDependencyInput = z.infer<typeof createDependencySchema>

/**
 * Schema for creating multiple dependencies at once
 */
export const createManyDependenciesSchema = z.object({
  sourceItemId: z.cuid('Invalid source item ID format'),
  targetItemIds: z
    .array(z.cuid('Invalid target item ID format'))
    .min(1, 'At least one target item is required')
    .max(50, 'Cannot create more than 50 dependencies at once'),
})

export type CreateManyDependenciesInput = z.infer<
  typeof createManyDependenciesSchema
>

/**
 * Schema for dependency response
 */
export const dependencySchema = z.object({
  id: z.cuid(),
  sourceItemId: z.cuid(),
  targetItemId: z.cuid(),
  createdAt: z.coerce.date(),
})

export type DependencyOutput = z.infer<typeof dependencySchema>

/**
 * Schema for dependency with item details
 */
export const dependencyWithItemsSchema = dependencySchema.extend({
  sourceItem: z.object({
    id: z.cuid(),
    title: z.string(),
    status: z.string(),
  }),
  targetItem: z.object({
    id: z.cuid(),
    title: z.string(),
    status: z.string(),
  }),
})

export type DependencyWithItemsOutput = z.infer<
  typeof dependencyWithItemsSchema
>

/**
 * Schema for list dependencies query parameters
 */
export const listDependenciesQuerySchema = z.object({
  itemId: z.cuid('Invalid item ID format'),
  type: z.enum(['prerequisites', 'dependents', 'all']).optional().default('all'),
})

export type ListDependenciesQuery = z.infer<typeof listDependenciesQuerySchema>

/**
 * Schema for checking circular dependencies
 */
export const checkCircularDependencySchema = z.object({
  sourceItemId: z.cuid('Invalid source item ID format'),
  targetItemId: z.cuid('Invalid target item ID format'),
})

export type CheckCircularDependencyInput = z.infer<
  typeof checkCircularDependencySchema
>
