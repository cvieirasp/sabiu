import { prisma } from '@/lib/prisma'
import { CreateLearningItem } from '@/core/use-cases/CreateLearningItem'
import { PrismaLearningItemRepository } from '@/infra/repositories/PrismaLearningItemRepository'
import { PrismaCategoryRepository } from '@/infra/repositories/PrismaCategoryRepository'
import { PrismaModuleRepository } from '@/infra/repositories/PrismaModuleRepository'
import { CuidGenerator } from '@/infra/utils/CuidGenerator'

export function makeCreateLearningItem() {
  const learningItemRepository = new PrismaLearningItemRepository(prisma)
  const moduleRepository = new PrismaModuleRepository(prisma)
  const categoryRepository = new PrismaCategoryRepository(prisma)
  const idGenerador = new CuidGenerator()

  return new CreateLearningItem(
    learningItemRepository,
    moduleRepository,
    categoryRepository,
    idGenerador
  )
}
