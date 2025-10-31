import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SignUpForm } from '../sign-up-form'

// Mock do useRouter
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do fetch global
global.fetch = vi.fn()

describe('SignUpForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deve renderizar o formulário corretamente', () => {
    render(<SignUpForm />)

    const criarContaElements = screen.getAllByText('Criar conta')
    expect(criarContaElements.length).toBeGreaterThan(0)
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^senha$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirmar senha/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /criar conta/i })
    ).toBeInTheDocument()
  })

  it('deve exibir link para página de login', () => {
    render(<SignUpForm />)

    const loginLink = screen.getByRole('link', { name: /faça login/i })
    expect(loginLink).toBeInTheDocument()
    expect(loginLink).toHaveAttribute('href', '/sign-in')
  })

  it('deve validar campos obrigatórios', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/o nome deve ter pelo menos 3 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it('deve validar requisitos de senha', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    await user.type(passwordInput, 'weak')

    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/a senha deve ter pelo menos 8 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  it('deve validar se as senhas coincidem', async () => {
    const user = userEvent.setup()
    render(<SignUpForm />)

    const passwordInput = screen.getByLabelText(/^senha$/i)
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i)

    await user.type(passwordInput, 'Password123')
    await user.type(confirmPasswordInput, 'DifferentPassword123')

    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/as senhas não coincidem/i)).toBeInTheDocument()
    })
  })

  it('deve submeter o formulário com dados válidos e redirecionar', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        message: 'Usuário criado com sucesso',
        user: {
          id: 'user-123',
          name: 'Test User',
          email: 'test@example.com',
        },
      }),
    })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/nome completo/i), 'Test User')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')

    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      })
      expect(mockPush).toHaveBeenCalledWith('/sign-in?registered=true')
    })
  })

  it('deve exibir mensagem de erro quando o cadastro falha', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Este email já está cadastrado',
      }),
    })

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/nome completo/i), 'Test User')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')

    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/este email já está cadastrado/i)
      ).toBeInTheDocument()
    })
  })

  it('deve desabilitar o formulário durante o submit', async () => {
    const user = userEvent.setup()
    ;(global.fetch as any).mockImplementation(
      () =>
        new Promise(resolve => {
          setTimeout(() => {
            resolve({
              ok: true,
              json: async () => ({ message: 'Success' }),
            })
          }, 100)
        })
    )

    render(<SignUpForm />)

    await user.type(screen.getByLabelText(/nome completo/i), 'Test User')
    await user.type(screen.getByLabelText(/^email$/i), 'test@example.com')
    await user.type(screen.getByLabelText(/^senha$/i), 'Password123')
    await user.type(screen.getByLabelText(/confirmar senha/i), 'Password123')

    const submitButton = screen.getByRole('button', { name: /criar conta/i })
    await user.click(submitButton)

    expect(
      screen.getByRole('button', { name: /criando conta/i })
    ).toBeDisabled()
    expect(screen.getByLabelText(/nome completo/i)).toBeDisabled()

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalled()
    })
  })
})
