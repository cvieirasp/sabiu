import { StatusVO } from '@/core/value-objects/Status'

export interface ListLearningItemParams {
  page?: number
  pageSize?: number
  filters?: LearningItemFilters
  orderBy?:
    | 'title'
    | 'createdAt'
    | 'dueDate'
    | 'progressCached'
    | 'status'
    | 'updatedAt'
    | undefined
  order?: 'asc' | 'desc'
  includeModules?: boolean
}

export interface LearningItemFilters {
  status?: StatusVO
  categoryId?: string
  tagIds?: string[]
  search?: string
}

export interface LearningItemDTO {
  id: string
  title: string
  descriptionMD: string
  dueDate: Date | null
  status: string
  progress: number
  userId: string
  category: {
    id: string
    name: string
    color: string
  }
  createdAt: Date
  updatedAt: Date | null
}

export interface LearningItemQueryRepository {
  listLearningItems(
    userId: string,
    params: ListLearningItemParams
  ): Promise<{
    learningItems: LearningItemDTO[]
    total: number
  }>

  findById(id: string, includeModules?: boolean): Promise<LearningItemDTO | null>
}
