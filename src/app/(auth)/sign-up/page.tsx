import { Metadata } from 'next'
import { SignUpForm } from '@/components/auth/sign-up-form'

export const metadata: Metadata = {
  title: 'Criar Conta | SABIU',
  description: 'Crie sua conta no SABIU para começar a organizar seus estudos',
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <SignUpForm />
    </div>
  )
}
