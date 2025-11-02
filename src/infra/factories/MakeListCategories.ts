import { prisma } from '@/lib/prisma'
import { ListCategories } from '@/core/use-cases/ListCategories'
import { PrismaCategoryRepository } from '@/infra/repositories/PrismaCategoryRepository'

export function makeListCategories() {
  const categoryRepository = new PrismaCategoryRepository(prisma)
  return new ListCategories(categoryRepository)
}
