import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = {
  title: 'Redefinir Senha | SABIU',
  description: 'Redefinir senha da conta SABIU',
}

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>
}

export default async function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams

  if (!params.token) {
    redirect('/forgot-password')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <ResetPasswordForm token={params.token} />
    </div>
  )
}
