import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignInForm } from '../sign-in-form'

// Mock do useRouter
const mockPush = vi.fn()
const mockRefresh = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}))

// Mock do signIn do NextAuth
const mockSignIn = vi.fn()
vi.mock('next-auth/react', () => ({
  signIn: (...args: any[]) => mockSignIn(...args),
}))

describe('SignInForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário corretamente', () => {
    render(<SignInForm />)

    const entrarElements = screen.getAllByText('Entrar')
    expect(entrarElements.length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /^entrar$/i })).toBeInTheDocument()
  })

  it('deve exibir link para página de cadastro', () => {
    render(<SignInForm />)

    const cadastroLink = screen.getByRole('link', { name: /criar conta/i })
    expect(cadastroLink).toBeInTheDocument()
    expect(cadastroLink).toHaveAttribute('href', '/sign-up')
  })

  it('deve exibir link para recuperação de senha', () => {
    render(<SignInForm />)

    const forgotPasswordLink = screen.getByRole('link', {
      name: /esqueceu a senha/i,
    })
    expect(forgotPasswordLink).toBeInTheDocument()
    expect(forgotPasswordLink).toHaveAttribute('href', '/forgot-password')
  })

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<SignInForm />)

    const submitButton = screen.getByRole('button', { name: /^entrar$/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it('deve validar senha obrigatória', async () => {
    const user = userEvent.setup()
    render(<SignInForm />)

    const emailInput = screen.getByLabelText(/^email$/i)
    const submitButton = screen.getByRole('button', { name: /^entrar$/i })

    await user.type(emailInput, 'test@example.com')
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/a senha é obrigatória/i)).toBeInTheDocument()
    })
  })

  it('deve fazer login com credenciais válidas e redirecionar', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({
      ok: true,
      error: null,
    })

    render(<SignInForm />)

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /^entrar$/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      })
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
      expect(mockRefresh).toHaveBeenCalled()
    })
  })

  it('deve exibir mensagem de erro quando o login falha', async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValueOnce({
      ok: false,
      error: 'CredentialsSignin',
    })

    render(<SignInForm />)

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'wrongpassword')

    const submitButton = screen.getByRole('button', { name: /^entrar$/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/email ou senha incorretos/i)
      ).toBeInTheDocument()
    })
  })

  it('deve desabilitar o formulário durante o submit', async () => {
    const user = userEvent.setup()
    mockSignIn.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ ok: true, error: null })
          }, 100)
        })
    )

    render(<SignInForm />)

    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'password123')

    const submitButton = screen.getByRole('button', { name: /^entrar$/i })
    await user.click(submitButton)

    expect(screen.getByRole('button', { name: /entrando/i })).toBeDisabled()
    expect(screen.getByLabelText(/^email$/i)).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })
})
