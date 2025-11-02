import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ItemForm, type ItemFormProps } from '../ItemForm'
import { Status } from '@prisma/client'

describe('ItemForm', () => {
  const mockCategories = [
    { id: 'cat-1', name: 'Programação', color: '#3B82F6' },
    { id: 'cat-2', name: 'Design', color: '#F5A524' },
  ]

  const mockTags = [
    { id: 'tag-1', name: 'TypeScript' },
    { id: 'tag-2', name: 'React' },
    { id: 'tag-3', name: 'Next.js' },
  ]

  const defaultProps: ItemFormProps = {
    categories: mockCategories,
    tags: mockTags,
    onSubmit: vi.fn(),
    isLoading: false,
    submitLabel: 'Salvar',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render all form fields', () => {
    render(<ItemForm {...defaultProps} />)

    expect(screen.getByLabelText(/título/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/descrição/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/categoria/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/prazo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument()
    //expect(screen.getByLabelText(/tags/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeInTheDocument()
  })

  it('should display validation error for empty title', async () => {
    const user = userEvent.setup()
    render(<ItemForm {...defaultProps} />)

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/título é obrigatório/i)).toBeInTheDocument()
    })
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<ItemForm {...defaultProps} onSubmit={onSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Aprender TypeScript')

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Aprender TypeScript',
          descriptionMD: '',
          status: Status.Backlog,
          tagIds: [],
        })
      )
    })
  })

  it('should populate form with initial values', () => {
    const initialValues = {
      title: 'Curso de React',
      descriptionMD: '# Descrição\nConteúdo do curso',
      status: Status.Em_Andamento,
      categoryId: 'cat-1',
      tagIds: ['tag-1', 'tag-2'],
    }

    render(<ItemForm {...defaultProps} initialValues={initialValues} />)

    expect(screen.getByDisplayValue('Curso de React')).toBeInTheDocument()
    /*expect(
      screen.getByDisplayValue('# Descrição\nConteúdo do curso')
    ).toBeInTheDocument()*/
  })

  it.skip('should show markdown preview when switching tabs', async () => {
    const user = userEvent.setup()
    render(<ItemForm {...defaultProps} />)

    const descriptionInput = screen.getByLabelText(/descrição/i)
    await user.type(descriptionInput, '# Título\n\nTexto **negrito**')

    const previewTab = screen.getByRole('tab', { name: /preview/i })
    await user.click(previewTab)

    await waitFor(() => {
      expect(screen.getByText('Título')).toBeInTheDocument()
      expect(screen.getByText('negrito')).toBeInTheDocument()
    })
  })

  it('should disable form fields when loading', () => {
    render(<ItemForm {...defaultProps} isLoading={true} />)

    expect(screen.getByLabelText(/título/i)).toBeDisabled()
    expect(screen.getByLabelText(/descrição/i)).toBeDisabled()
    expect(screen.getByRole('button', { name: /salvar/i })).toBeDisabled()
  })

  it('should validate title max length', async () => {
    const user = userEvent.setup()
    render(<ItemForm {...defaultProps} />)

    const titleInput = screen.getByLabelText(/título/i)
    const longTitle = 'a'.repeat(201)
    await user.type(titleInput, longTitle)

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/título não pode exceder 200 caracteres/i)
      ).toBeInTheDocument()
    })
  })

  // TODO: Fix Radix UI select interaction tests (hasPointerCapture issue)
  it.skip('should handle category selection', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<ItemForm {...defaultProps} onSubmit={onSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Test Item')

    const categorySelect = screen.getByLabelText(/categoria/i)
    await user.click(categorySelect)

    const programacaoOption = await screen.findByText('Programação')
    await user.click(programacaoOption)

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          categoryId: 'cat-1',
        })
      )
    })
  })

  // TODO: Fix Radix UI select interaction tests (hasPointerCapture issue)
  it.skip('should handle status selection', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<ItemForm {...defaultProps} onSubmit={onSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Test Item')

    const statusSelect = screen.getByLabelText(/status/i)
    await user.click(statusSelect)

    const emAndamentoOption = await screen.findByText('Em Andamento')
    await user.click(emAndamentoOption)

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          status: Status.Em_Andamento,
        })
      )
    })
  })

  it('should show loading spinner when submitting', async () => {
    const user = userEvent.setup()
    const onSubmit = vi
      .fn()
      .mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      )

    render(<ItemForm {...defaultProps} onSubmit={onSubmit} />)

    const titleInput = screen.getByLabelText(/título/i)
    await user.type(titleInput, 'Test Item')

    const submitButton = screen.getByRole('button', { name: /salvar/i })
    await user.click(submitButton)

    // Button should be disabled during submission
    expect(submitButton).toBeDisabled()

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled()
    })
  })

  it('should display custom submit label', () => {
    render(<ItemForm {...defaultProps} submitLabel="Criar Item" />)

    expect(
      screen.getByRole('button', { name: /criar item/i })
    ).toBeInTheDocument()
  })

  it('should handle markdown with special characters', async () => {
    const user = userEvent.setup()
    render(<ItemForm {...defaultProps} />)

    const descriptionInput = screen.getByLabelText(/descrição/i)
    await user.type(descriptionInput, '`code` and **bold** and [link](url)')

    const previewTab = screen.getByRole('tab', { name: /preview/i })
    await user.click(previewTab)

    await waitFor(() => {
      expect(screen.getByText('code')).toBeInTheDocument()
      expect(screen.getByText('bold')).toBeInTheDocument()
      //expect(screen.getByText('link')).toBeInTheDocument()
    })
  })

  it('should show empty preview message when no description', async () => {
    const user = userEvent.setup()
    render(<ItemForm {...defaultProps} />)

    const previewTab = screen.getByRole('tab', { name: /preview/i })
    await user.click(previewTab)

    expect(
      screen.getByText(/nenhuma descrição para visualizar/i)
    ).toBeInTheDocument()
  })
})
