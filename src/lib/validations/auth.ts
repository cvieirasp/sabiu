import { z } from 'zod'

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(3, 'O nome deve ter pelo menos 3 caracteres')
      .max(100, 'O nome deve ter no máximo 100 caracteres'),
    email: z.email('Email inválido'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type SignUpFormData = z.infer<typeof signUpSchema>

export const signInSchema = z.object({
  email: z.email('Email inválido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})

export type SignInFormData = z.infer<typeof signInSchema>

export const forgotPasswordSchema = z.object({
  email: z.email('Email inválido'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z
      .string()
      .min(8, 'A senha deve ter pelo menos 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'A senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
