import type { User as PrismaUser } from '@prisma/client'
import { User } from '@/core/entities'
import { Email } from '@/core/value-objects'

/**
 * User Mapper
 *
 * Maps between Prisma models and domain entities
 */
export class UserMapper {
  /**
   * Convert Prisma model to Domain Entity
   */
  static toDomain(prisma: PrismaUser): User {
    return User.reconstitute({
      id: prisma.id,
      name: prisma.name,
      email: Email.create(prisma.email),
      passwordHash: prisma.passwordHash,
      createdAt: prisma.createdAt,
      updatedAt: prisma.updatedAt,
    })
  }

  /**
   * Convert Domain Entity to Prisma input (for create/update)
   */
  static toPrisma(entity: User): Omit<PrismaUser, 'createdAt' | 'updatedAt'> {
    return {
      id: entity.id,
      name: entity.name,
      email: entity.email.value,
      passwordHash: entity.passwordHash,
    }
  }

  /**
   * Convert multiple Prisma models to Domain Entities
   */
  static toDomainMany(prismaModels: PrismaUser[]): User[] {
    return prismaModels.map((model) => this.toDomain(model))
  }

  /**
   * Convert multiple Domain Entities to Prisma inputs
   */
  static toPrismaMany(entities: User[]): Omit<PrismaUser, 'createdAt' | 'updatedAt'>[] {
    return entities.map((entity) => this.toPrisma(entity))
  }
}
