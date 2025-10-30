import { describe, it, expect } from 'vitest'
import { signUpSchema, signInSchema } from '../auth'

describe('Auth Validations', () => {
  describe('signUpSchema', () => {
    it('deve validar dados válidos de cadastro', () => {
      const validData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar nome muito curto', () => {
      const invalidData = {
        name: 'AB',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('name')
      }
    })

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        name: 'Test User',
        email: 'invalid-email',
        password: 'Password123',
        confirmPassword: 'Password123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('deve rejeitar senha fraca', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'weak',
        confirmPassword: 'weak',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((issue) => issue.path.includes('password'))).toBe(true)
      }
    })

    it('deve rejeitar senhas que não coincidem', () => {
      const invalidData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password123',
        confirmPassword: 'DifferentPassword123',
      }

      const result = signUpSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword')
      }
    })
  })

  describe('signInSchema', () => {
    it('deve validar dados válidos de login', () => {
      const validData = {
        email: 'test@example.com',
        password: 'any-password',
      }

      const result = signInSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('deve rejeitar email inválido', () => {
      const invalidData = {
        email: 'invalid-email',
        password: 'any-password',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email')
      }
    })

    it('deve rejeitar senha vazia', () => {
      const invalidData = {
        email: 'test@example.com',
        password: '',
      }

      const result = signInSchema.safeParse(invalidData)
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password')
      }
    })
  })
})
