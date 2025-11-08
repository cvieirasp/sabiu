import { PrismaClient } from '@prisma/client'
import { Dependency } from '@/core/entities'
import { DependencyRepository } from '@/core/interfaces'
import { DependencyMapper } from '../mappers'

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

  async findBySourceAndTarget(
    sourceItemId: string,
    targetItemId: string
  ): Promise<Dependency | null> {
    const dependency = await this.prisma.dependency.findFirst({
      where: {
        sourceItemId,
        targetItemId,
      },
    })

    if (!dependency) {
      return null
    }

    return DependencyMapper.toDomain(dependency)
  }

  async getPrerequisites(itemId: string): Promise<Dependency[]> {
    return this.findBySourceItemId(itemId)
  }

  async getDependents(itemId: string): Promise<Dependency[]> {
    return this.findByTargetItemId(itemId)
  }

  async create(dependency: Dependency): Promise<Dependency> {
    const data = DependencyMapper.toPrisma(dependency)

    const created = await this.prisma.dependency.create({
      data,
    })

    return DependencyMapper.toDomain(created)
  }

  async createMany(dependencies: Dependency[]): Promise<Dependency[]> {
    const data = DependencyMapper.toPrismaMany(dependencies)

    await this.prisma.dependency.createMany({
      data,
    })

    // Fetch created dependencies
    const created = await this.prisma.dependency.findMany({
      where: {
        id: {
          in: dependencies.map(d => d.id),
        },
      },
    })

    return DependencyMapper.toDomainMany(created)
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.dependency.delete({
        where: { id },
      })
      return true
    } catch {
      return false
    }
  }

  async deleteByItemId(itemId: string): Promise<number> {
    const result = await this.prisma.dependency.deleteMany({
      where: {
        OR: [{ sourceItemId: itemId }, { targetItemId: itemId }],
      },
    })

    return result.count
  }

  async exists(sourceItemId: string, targetItemId: string): Promise<boolean> {
    const dependency = await this.findBySourceAndTarget(
      sourceItemId,
      targetItemId
    )
    return dependency !== null
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

  async getDependencyGraph(itemIds: string[]): Promise<Dependency[]> {
    const dependencies = await this.prisma.dependency.findMany({
      where: {
        AND: [
          { sourceItemId: { in: itemIds } },
          { targetItemId: { in: itemIds } },
        ],
      },
    })

    return DependencyMapper.toDomainMany(dependencies)
  }

  async count(
    itemId: string,
    type: 'prerequisites' | 'dependents'
  ): Promise<number> {
    if (type === 'prerequisites') {
      return this.prisma.dependency.count({
        where: { sourceItemId: itemId },
      })
    } else {
      return this.prisma.dependency.count({
        where: { targetItemId: itemId },
      })
    }
  }
}
