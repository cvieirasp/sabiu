import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { resetPasswordSchema } from '@/lib/validations/auth'
import { z } from 'zod'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    // Find token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: {
        token: validatedData.token,
      },
    })

    if (!verificationToken) {
      return NextResponse.json(
        { error: 'Token inválido ou expirado' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (verificationToken.expires < new Date()) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: {
          token: validatedData.token,
        },
      })

      return NextResponse.json(
        { error: 'Token expirado. Solicite um novo link de redefinição' },
        { status: 400 }
      )
    }

    // Find user by email (identifier)
    const user = await prisma.user.findUnique({
      where: {
        email: verificationToken.identifier,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Hash new password
    const passwordHash = await hash(validatedData.password, 12)

    // Update user password
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        passwordHash,
      },
    })

    // Delete used token
    await prisma.verificationToken.delete({
      where: {
        token: validatedData.token,
      },
    })

    return NextResponse.json(
      {
        message: 'Senha redefinida com sucesso',
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Erro ao resetar senha:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
