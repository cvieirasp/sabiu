import { PrismaClient } from '@prisma/client'
import { Dependency } from '@/core/entities/Dependency'
import { DependencyRepository } from '@/core/interfaces/DependencyRepository'
import { DependencyMapper } from '@/infra/mappers/DependencyMapper'

/**
 * Prisma implementation of DependencyRepository
 */
export class PrismaDependencyRepository implements DependencyRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Dependency | null> {
    const dependency = await this.prisma.dependency.findUnique({
      where: { id },
    })

    if (!dependency) {
      return null
    }

    return DependencyMapper.toDomain(dependency)
  }

  async findBySourceItemId(sourceItemId: string): Promise<Dependency[]> {
    const dependencies = await this.prisma.dependency.findMany({
      where: { sourceItemId },
    })

    return DependencyMapper.toDomainMany(dependencies)
  }

  async findByTargetItemId(targetItemId: string): Promise<Dependency[]> {
    const dependencies = await this.prisma.dependency.findMany({
      where: { targetItemId },
    })

    return DependencyMapper.toDomainMany(dependencies)
  }

  async create(dependency: Dependency): Promise<Dependency> {
    const data = DependencyMapper.toPrisma(dependency)

    const created = await this.prisma.dependency.create({
      data,
    })

    return DependencyMapper.toDomain(created)
  }

  async delete(id: string): Promise<void> {
    await this.prisma.dependency.delete({
        where: { id },
      })
  }

  async exists(sourceItemId: string, targetItemId: string): Promise<boolean> {
    const dependencies = await this.prisma.dependency.findMany({
      where: { sourceItemId, targetItemId },
    })

    return dependencies.length > 0
  }

  async wouldCreateCycle(
    sourceItemId: string,
    targetItemId: string
  ): Promise<boolean> {
    // If source === target, it's a direct cycle
    if (sourceItemId === targetItemId) {
      return true
    }

    // BFS to check if targetItemId can reach sourceItemId
    const visited = new Set<string>()
    const queue: string[] = [targetItemId]

    while (queue.length > 0) {
      const current = queue.shift()!

      if (visited.has(current)) {
        continue
      }

      visited.add(current)

      // If we reached the source, there's a cycle
      if (current === sourceItemId) {
        return true
      }

      // Get all dependencies where current is the source
      const dependencies = await this.findBySourceItemId(current)

      // Add all targets to the queue
      for (const dep of dependencies) {
        if (!visited.has(dep.targetItemId)) {
          queue.push(dep.targetItemId)
        }
      }
    }

    return false
  }
}
