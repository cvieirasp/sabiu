import { prisma } from '@/lib/prisma'
import { GetLearningItem } from '@/core/use-cases/GetLearningItem'
import { PrismaLearningItemQueryRepository } from '@/infra/repositories/PrismaLearningItemQueryRepository'

export function makeGetLearningItem() {
  const learningItemQueryRepository = new PrismaLearningItemQueryRepository(
    prisma
  )
  return new GetLearningItem(learningItemQueryRepository)
}
