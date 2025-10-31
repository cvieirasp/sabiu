import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Redefinir Senha | SABIU',
  description: 'Redefinir senha da conta SABIU',
}

interface ResetPasswordPageProps {
  searchParams: { token?: string }
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  if (!searchParams.token) {
    redirect('/forgot-password')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm token={searchParams.token} />
    </div>
  )
}
