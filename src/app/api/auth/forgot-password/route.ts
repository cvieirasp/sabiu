import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { forgotPasswordSchema } from '@/lib/validations/auth'
import { z } from 'zod'
import { Resend } from 'resend'
import crypto from 'crypto'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: {
        email: validatedData.email,
      },
    })

    // Don't reveal if user exists or not (security best practice)
    if (!user) {
      return NextResponse.json(
        {
          message:
            'Se o email estiver cadastrado, você receberá um link para redefinir sua senha',
        },
        { status: 200 }
      )
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Delete any existing token for this user
    await prisma.verificationToken.deleteMany({
      where: {
        identifier: user.email,
      },
    })

    // Store new token in database
    await prisma.verificationToken.create({
      data: {
        identifier: user.email,
        token: resetToken,
        expires: resetTokenExpiry,
      },
    })

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: user.email,
      subject: 'Redefinição de senha - SABIU',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Redefinição de senha</h2>
          <p>Olá ${user.name},</p>
          <p>Você solicitou a redefinição de senha da sua conta SABIU.</p>
          <p>Clique no link abaixo para criar uma nova senha:</p>
          <a href="${resetUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
            Redefinir senha
          </a>
          <p>Este link expira em 1 hora.</p>
          <p>Se você não solicitou esta redefinição, ignore este email.</p>
          <hr style="margin: 24px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">SABIU - Sistema de Acompanhamento de Aprendizado</p>
        </div>
      `,
    })

    return NextResponse.json(
      {
        message:
          'Se o email estiver cadastrado, você receberá um link para redefinir sua senha',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Erro ao solicitar reset de senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
