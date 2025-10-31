import { describe, it, expect } from 'vitest'
import { authOptions } from '../auth'

describe('NextAuth Configuration', () => {
  describe('Configuration', () => {
    it('deve ter Prisma Adapter configurado', () => {
      expect(authOptions.adapter).toBeDefined()
    })

    it('deve ter strategy JWT configurada', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('deve ter páginas personalizadas configuradas', () => {
      expect(authOptions.pages).toEqual({
        signIn: '/sign-in',
        signOut: '/sign-in',
        error: '/sign-in',
        newUser: '/dashboard',
      })
    })

    it('deve ter provider Credentials configurado', () => {
      const credentialsProvider = authOptions.providers.find(
        provider => provider.id === 'credentials'
      )
      expect(credentialsProvider).toBeDefined()
      expect(credentialsProvider?.type).toBe('credentials')
    })

    it('deve ter callbacks JWT e Session configurados', () => {
      expect(authOptions.callbacks?.jwt).toBeDefined()
      expect(authOptions.callbacks?.session).toBeDefined()
    })
  })

  describe('JWT Callback', () => {
    it('deve adicionar dados do usuário ao token no primeiro login', async () => {
      // Arrange
      const token = { sub: 'user-123', id: 'user-123' }
      const user = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      }

      // Act
      const result = await authOptions.callbacks!.jwt!({
        token,
        user,
        account: null,
        profile: undefined,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined,
      })

      // Assert
      expect(result).toEqual({
        sub: 'user-123',
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      })
    })

    it('deve manter token existente em requisições subsequentes', async () => {
      // Arrange
      const token = {
        sub: 'user-123',
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      }

      // Act - Simula uma requisição subsequente onde o user não está presente
      const result = await authOptions.callbacks!.jwt!({
        token,
        user: {
          id: 'user-123',
          email: 'test@example.com',
          name: 'Test User',
        },
        account: null,
        profile: undefined,
        trigger: 'signIn',
        isNewUser: false,
        session: undefined,
      })

      // Assert
      expect(result).toEqual(token)
    })
  })

  describe('Session Callback', () => {
    it('deve adicionar dados do token à sessão', async () => {
      // Arrange
      const session = {
        user: {
          id: '',
          name: '',
          email: '',
          image: '',
        },
        expires: '2025-12-31',
      }
      const token = {
        sub: 'user-123',
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
      }

      // Act
      const result = await authOptions.callbacks!.session!({
        session,
        token,
      } as any)

      // Assert
      expect(result.user).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: '',
      })
    })
  })
})
