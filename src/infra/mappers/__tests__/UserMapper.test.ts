import { describe, it, expect } from 'vitest'
import type { User as PrismaUser } from '@prisma/client'
import { UserMapper } from '@/infra/mappers/UserMapper'
import { Email } from '@/core/value-objects'
import { User } from '@/core'

describe('UserMapper', () => {
  describe('toDomain', () => {
    it('should convert Prisma model to domain entity', () => {
      const prismaModel: PrismaUser = {
        id: 'user-123',
        name: 'John Doe',
        email: 'john@example.com',
        passwordHash: '$2a$10$hashedpassword',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      }

      const entity = UserMapper.toDomain(prismaModel)

      expect(entity.id).toBe('user-123')
      expect(entity.name).toBe('John Doe')
      expect(entity.email.value).toBe('john@example.com')
      expect(entity.passwordHash).toBe('$2a$10$hashedpassword')
      expect(entity.createdAt).toEqual(new Date('2025-01-01'))
      expect(entity.updatedAt).toEqual(new Date('2025-01-02'))
    })

    it('should create Email value object from string', () => {
      const prismaModel: PrismaUser = {
        id: 'user-456',
        name: 'Jane Smith',
        email: 'jane@example.com',
        passwordHash: '$2a$10$anotherhashedpassword',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const entity = UserMapper.toDomain(prismaModel)

      expect(entity.email).toBeInstanceOf(Email)
      expect(entity.email.value).toBe('jane@example.com')
    })

    it('should handle different name formats', () => {
      const prismaModel: PrismaUser = {
        id: 'user-789',
        name: 'Maria José da Silva',
        email: 'maria@example.com',
        passwordHash: '$2a$10$hash',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const entity = UserMapper.toDomain(prismaModel)

      expect(entity.name).toBe('Maria José da Silva')
    })
  })

  describe('toPrisma', () => {
    it('should convert domain entity to Prisma input', () => {
      const entity = {
        id: 'user-123',
        name: 'John Doe',
        email: Email.create('john@example.com'),
        passwordHash: '$2a$10$hashedpassword',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
      }

      const prismaInput = UserMapper.toPrisma(entity as User)

      expect(prismaInput.id).toBe('user-123')
      expect(prismaInput.name).toBe('John Doe')
      expect(prismaInput.email).toBe('john@example.com')
      expect(prismaInput.passwordHash).toBe('$2a$10$hashedpassword')
      expect(prismaInput).not.toHaveProperty('createdAt')
      expect(prismaInput).not.toHaveProperty('updatedAt')
    })

    it('should extract email value from Email value object', () => {
      const entity = {
        id: 'user-456',
        name: 'Jane Smith',
        email: Email.create('jane@example.com'),
        passwordHash: '$2a$10$hash',
        createdAt: new Date(),
      }

      const prismaInput = UserMapper.toPrisma(entity as User)

      expect(typeof prismaInput.email).toBe('string')
      expect(prismaInput.email).toBe('jane@example.com')
    })
  })

  describe('batch operations', () => {
    it('should convert multiple Prisma models to domain entities', () => {
      const entities = [
        {
          id: 'user-1',
          name: 'User One',
          email: Email.create('user1@example.com'),
          passwordHash: '$2a$10$hash1',
          createdAt: new Date('2025-01-01'),
          updatedAt: new Date('2025-01-01'),
        },
        {
          id: 'user-2',
          name: 'User Two',
          email: Email.create('user2@example.com'),
          passwordHash: '$2a$10$hash2',
          createdAt: new Date('2025-01-02'),
          updatedAt: new Date('2025-01-02'),
        },
        {
          id: 'user-3',
          name: 'User Three',
          email: Email.create('user3@example.com'),
          passwordHash: '$2a$10$hash3',
          createdAt: new Date('2025-01-03'),
          updatedAt: new Date('2025-01-03'),
        },
      ]

      expect(entities).toHaveLength(3)
      expect(entities[0].name).toBe('User One')
      expect(entities[1].name).toBe('User Two')
      expect(entities[2].name).toBe('User Three')
      expect(entities[0].email.value).toBe('user1@example.com')
      expect(entities[1].email.value).toBe('user2@example.com')
      expect(entities[2].email.value).toBe('user3@example.com')
    })

    it('should convert multiple domain entities to Prisma inputs', () => {
      const entities = [
        {
          id: 'user-1',
          name: 'User One',
          email: Email.create('user1@example.com'),
          passwordHash: '$2a$10$hash1',
          createdAt: new Date(),
        },
        {
          id: 'user-2',
          name: 'User Two',
          email: Email.create('user2@example.com'),
          passwordHash: '$2a$10$hash2',
          createdAt: new Date(),
        },
        {
          id: 'user-3',
          name: 'User Three',
          email: Email.create('user3@example.com'),
          passwordHash: '$2a$10$hash3',
          createdAt: new Date(),
        },
      ]

      const prismaInputs = UserMapper.toPrismaMany(entities as User[])

      expect(prismaInputs).toHaveLength(3)
      expect(prismaInputs[0].email).toBe('user1@example.com')
      expect(prismaInputs[1].email).toBe('user2@example.com')
      expect(prismaInputs[2].email).toBe('user3@example.com')
      expect(prismaInputs[0]).not.toHaveProperty('createdAt')
      expect(prismaInputs[1]).not.toHaveProperty('createdAt')
      expect(prismaInputs[2]).not.toHaveProperty('createdAt')
    })
  })
})
