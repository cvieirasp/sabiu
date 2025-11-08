import { prisma } from '@/lib/prisma'
import { ListLearningItems } from '@/core/use-cases/ListLearningItems'
import { PrismaLearningItemQueryRepository } from '@/infra/repositories/PrismaLearningItemQueryRepository'

export function makeListLearningItems() {
  const learningItemQueryRepository = new PrismaLearningItemQueryRepository(
    prisma
  )
  return new ListLearningItems(learningItemQueryRepository)
}
