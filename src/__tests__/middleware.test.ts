import { describe, it, expect } from 'vitest'

describe('Middleware Configuration', () => {
  it('deve proteger rotas do dashboard', () => {
    const protectedRoutes = [
      '/dashboard',
      '/dashboard/items',
      '/dashboard/categories',
    ]

    const matcher = [
      '/dashboard/:path*',
      '/profile/:path*',
      '/api/items/:path*',
      '/api/categories/:path*',
      '/api/modules/:path*',
    ]

    protectedRoutes.forEach(route => {
      const isProtected = matcher.some(pattern => {
        // Convert Next.js matcher pattern to regex
        // :path* means match anything after this point (including nothing)
        const regexPattern = pattern
          .replace(/\/:path\*/g, '(/.*)?') // :path* becomes optional path
          .replace(/:\w+/g, '[^/]+') // :param becomes single segment
        const regex = new RegExp('^' + regexPattern + '$')
        return regex.test(route)
      })
      expect(isProtected).toBe(true)
    })
  })

  it('deve proteger rotas de perfil', () => {
    const protectedRoutes = ['/profile', '/profile/settings']

    const matcher = [
      '/dashboard/:path*',
      '/profile/:path*',
      '/api/items/:path*',
      '/api/categories/:path*',
      '/api/modules/:path*',
    ]

    protectedRoutes.forEach(route => {
      const isProtected = matcher.some(pattern => {
        const regexPattern = pattern
          .replace(/\/:path\*/g, '(/.*)?')
          .replace(/:\w+/g, '[^/]+')
        const regex = new RegExp('^' + regexPattern + '$')
        return regex.test(route)
      })
      expect(isProtected).toBe(true)
    })
  })

  it('deve proteger rotas da API', () => {
    const protectedRoutes = [
      '/api/items',
      '/api/items/123',
      '/api/categories',
      '/api/modules',
    ]

    const matcher = [
      '/dashboard/:path*',
      '/profile/:path*',
      '/api/items/:path*',
      '/api/categories/:path*',
      '/api/modules/:path*',
    ]

    protectedRoutes.forEach(route => {
      const isProtected = matcher.some(pattern => {
        const regexPattern = pattern
          .replace(/\/:path\*/g, '(/.*)?')
          .replace(/:\w+/g, '[^/]+')
        const regex = new RegExp('^' + regexPattern + '$')
        return regex.test(route)
      })
      expect(isProtected).toBe(true)
    })
  })

  it('não deve proteger rotas públicas', () => {
    const publicRoutes = [
      '/sign-in',
      '/sign-up',
      '/forgot-password',
      '/reset-password',
      '/',
    ]

    const matcher = [
      '/dashboard/:path*',
      '/profile/:path*',
      '/api/items/:path*',
      '/api/categories/:path*',
      '/api/modules/:path*',
    ]

    publicRoutes.forEach(route => {
      const isProtected = matcher.some(pattern => {
        const regexPattern = pattern
          .replace(/\/:path\*/g, '(/.*)?')
          .replace(/:\w+/g, '[^/]+')
        const regex = new RegExp('^' + regexPattern + '$')
        return regex.test(route)
      })
      expect(isProtected).toBe(false)
    })
  })

  it('não deve proteger rota de registro de API', () => {
    const route = '/api/auth/register'

    const matcher = [
      '/dashboard/:path*',
      '/profile/:path*',
      '/api/items/:path*',
      '/api/categories/:path*',
      '/api/modules/:path*',
    ]

    const isProtected = matcher.some(pattern => {
      const regexPattern = pattern
        .replace(/\/:path\*/g, '(/.*)?')
        .replace(/:\w+/g, '[^/]+')
      const regex = new RegExp('^' + regexPattern + '$')
      return regex.test(route)
    })

    expect(isProtected).toBe(false)
  })
})
