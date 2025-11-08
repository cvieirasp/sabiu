import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  ModulesEditor,
  type ModulesEditorProps,
  type ModuleData,
} from '../ModulesEditor'
import { ModuleStatus } from '@prisma/client'

// Mock @dnd-kit modules
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  closestCenter: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: (array: any[], oldIndex: number, newIndex: number) => {
    const newArray = [...array]
    const [removed] = newArray.splice(oldIndex, 1)
    newArray.splice(newIndex, 0, removed)
    return newArray
  },
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

describe('ModulesEditor', () => {
  const mockModules: ModuleData[] = [
    {
      id: 'module-1',
      title: 'Introdução ao TypeScript',
      status: ModuleStatus.Concluido,
      order: 0,
    },
    {
      id: 'module-2',
      title: 'Tipos Avançados',
      status: ModuleStatus.Em_Andamento,
      order: 1,
    },
    {
      id: 'module-3',
      title: 'Generics',
      status: ModuleStatus.Pendente,
      order: 2,
    },
  ]

  const defaultProps: ModulesEditorProps = {
    modules: mockModules,
    onModulesChange: vi.fn(),
    isLoading: false,
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render module list with all modules', () => {
      render(<ModulesEditor {...defaultProps} />)

      expect(screen.getByText('Introdução ao TypeScript')).toBeInTheDocument()
      expect(screen.getByText('Tipos Avançados')).toBeInTheDocument()
      expect(screen.getByText('Generics')).toBeInTheDocument()
    })

    it('should display module count', () => {
      render(<ModulesEditor {...defaultProps} />)

      expect(screen.getByText('3 módulos')).toBeInTheDocument()
    })

    it('should display singular module count', () => {
      render(<ModulesEditor {...defaultProps} modules={[mockModules[0]]} />)

      expect(screen.getByText('1 módulo')).toBeInTheDocument()
    })

    it('should show empty state when no modules', () => {
      render(<ModulesEditor {...defaultProps} modules={[]} />)

      expect(
        screen.getByText(/nenhum módulo adicionado ainda/i)
      ).toBeInTheDocument()
      expect(
        screen.getByText(/clique em "adicionar módulo" para começar/i)
      ).toBeInTheDocument()
    })

    it('should display progress percentage', () => {
      render(<ModulesEditor {...defaultProps} />)

      // 1 completed out of 3 = 33%
      expect(screen.getByText('33% concluído')).toBeInTheDocument()
    })

    it('should show 0% progress when no modules completed', () => {
      const pendingModules = mockModules.map(m => ({
        ...m,
        status: ModuleStatus.Pendente,
      }))
      render(<ModulesEditor {...defaultProps} modules={pendingModules} />)

      expect(screen.getByText('0% concluído')).toBeInTheDocument()
    })

    it('should show 100% progress when all modules completed', () => {
      const completedModules = mockModules.map(m => ({
        ...m,
        status: ModuleStatus.Concluido,
      }))
      render(<ModulesEditor {...defaultProps} modules={completedModules} />)

      expect(screen.getByText('100% concluído')).toBeInTheDocument()
    })

    it('should render add module button', () => {
      render(<ModulesEditor {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /adicionar módulo/i })
      ).toBeInTheDocument()
    })
  })

  describe('Adding Modules', () => {
    it('should show input field when add button is clicked', async () => {
      const user = userEvent.setup()
      render(<ModulesEditor {...defaultProps} />)

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      expect(
        screen.getByPlaceholderText(/título do módulo/i)
      ).toBeInTheDocument()
    })

    it('should add new module when title is provided', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      const input = screen.getByPlaceholderText(/título do módulo/i)
      await user.type(input, 'Novo Módulo')

      // Find check button (first button with lucide-check class)
      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(btn =>
        btn.querySelector('.lucide-check')
      )
      await user.click(confirmButton!)

      await waitFor(() => {
        expect(onModulesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            ...mockModules,
            expect.objectContaining({
              title: 'Novo Módulo',
              status: ModuleStatus.Pendente,
              order: 3,
            }),
          ])
        )
      })
    })

    it('should show error when adding module with empty title', async () => {
      const user = userEvent.setup()
      render(<ModulesEditor {...defaultProps} />)

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(btn =>
        btn.querySelector('.lucide-check')
      )
      await user.click(confirmButton!)

      await waitFor(() => {
        expect(
          screen.getByText(/título do módulo não pode estar vazio/i)
        ).toBeInTheDocument()
      })
    })

    it('should show error when title exceeds 200 characters', async () => {
      const user = userEvent.setup()
      render(<ModulesEditor {...defaultProps} />)

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      const input = screen.getByPlaceholderText(/título do módulo/i)
      const longTitle = 'a'.repeat(201)
      await user.type(input, longTitle)

      const buttons = screen.getAllByRole('button')
      const confirmButton = buttons.find(btn =>
        btn.querySelector('.lucide-check')
      )
      await user.click(confirmButton!)

      await waitFor(() => {
        expect(
          screen.getByText(/título não pode exceder 200 caracteres/i)
        ).toBeInTheDocument()
      })
    })

    it('should cancel adding module when cancel button is clicked', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      const input = screen.getByPlaceholderText(/título do módulo/i)
      await user.type(input, 'Test Module')

      const buttons = screen.getAllByRole('button')
      const cancelButton = buttons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-x')
      )
      await user.click(cancelButton!)

      expect(
        screen.queryByPlaceholderText(/título do módulo/i)
      ).not.toBeInTheDocument()
      expect(onModulesChange).not.toHaveBeenCalled()
    })

    it('should add module when Enter key is pressed', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      const input = screen.getByPlaceholderText(/título do módulo/i)
      await user.type(input, 'New Module{Enter}')

      await waitFor(() => {
        expect(onModulesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: 'New Module',
            }),
          ])
        )
      })
    })

    it('should cancel when Escape key is pressed', async () => {
      const user = userEvent.setup()
      render(<ModulesEditor {...defaultProps} />)

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      await user.click(addButton)

      const input = screen.getByPlaceholderText(/título do módulo/i)
      await user.type(input, 'Test{Escape}')

      expect(
        screen.queryByPlaceholderText(/título do módulo/i)
      ).not.toBeInTheDocument()
    })
  })

  describe('Editing Modules', () => {
    // Helper to get the first edit button (edit button for first module)
    const getFirstEditButton = (_container: HTMLElement) => {
      // Edit button appears after the module title "Introdução ao TypeScript"
      const moduleTitle = screen.getByText('Introdução ao TypeScript')
      const moduleContainer = moduleTitle.closest(
        '[class*="flex items-center gap-2"]'
      )
      if (!moduleContainer) return null

      // Find all buttons in that container
      const buttons = Array.from(moduleContainer.querySelectorAll('button'))
      // The edit button has Edit2 icon (not trash icon)
      return buttons.find(btn => {
        const svg = btn.querySelector('svg')
        return (
          svg &&
          !svg.classList.contains('lucide-trash-2') &&
          !svg.classList.contains('lucide-grip-vertical')
        )
      })
    }

    // TODO: Fix Radix UI Dialog/Select interaction tests (hasPointerCapture issue)
    it.skip('should open edit dialog when edit button is clicked', async () => {
      const user = userEvent.setup()
      const { container } = render(<ModulesEditor {...defaultProps} />)

      const editButton = getFirstEditButton(container)
      if (!editButton) {
        throw new Error('Edit button not found')
      }

      await user.click(editButton)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/editar módulo/i)).toBeInTheDocument()
      })
    })

    // TODO: Fix Radix UI Dialog/Select interaction tests (hasPointerCapture issue)
    it.skip('should update module title when edited', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      const { container } = render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const editButton = getFirstEditButton(container)
      if (!editButton) throw new Error('Edit button not found')

      await user.click(editButton)

      const input = await screen.findByDisplayValue('Introdução ao TypeScript')
      await user.clear(input)
      await user.type(input, 'TypeScript Básico')

      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(onModulesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'module-1',
              title: 'TypeScript Básico',
            }),
          ])
        )
      })
    })

    // TODO: Fix Radix UI Dialog/Select interaction tests (hasPointerCapture issue)
    it.skip('should show error when editing with empty title', async () => {
      const user = userEvent.setup()
      const { container } = render(<ModulesEditor {...defaultProps} />)

      const editButton = getFirstEditButton(container)
      if (!editButton) throw new Error('Edit button not found')

      await user.click(editButton)

      const input = await screen.findByDisplayValue('Introdução ao TypeScript')
      await user.clear(input)

      const saveButton = screen.getByRole('button', { name: /salvar/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(
          screen.getByText(/título do módulo não pode estar vazio/i)
        ).toBeInTheDocument()
      })
    })

    // TODO: Fix Radix UI Dialog/Select interaction tests (hasPointerCapture issue)
    it.skip('should close edit dialog when cancel is clicked', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      const { container } = render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const editButton = getFirstEditButton(container)
      if (!editButton) throw new Error('Edit button not found')

      await user.click(editButton)

      const cancelButton = await screen.findByRole('button', {
        name: /cancelar/i,
      })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(onModulesChange).not.toHaveBeenCalled()
      })
    })

    // TODO: Fix Radix UI Dialog/Select interaction tests (hasPointerCapture issue)
    it.skip('should save when Enter key is pressed in edit dialog', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      const { container } = render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const editButton = getFirstEditButton(container)
      if (!editButton) throw new Error('Edit button not found')

      await user.click(editButton)

      const input = await screen.findByDisplayValue('Introdução ao TypeScript')
      await user.clear(input)
      await user.type(input, 'Updated Title{Enter}')

      await waitFor(() => {
        expect(onModulesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              title: 'Updated Title',
            }),
          ])
        )
      })
    })
  })

  describe('Deleting Modules', () => {
    it('should open delete confirmation dialog when delete button is clicked', async () => {
      const user = userEvent.setup()
      render(<ModulesEditor {...defaultProps} />)

      const deleteButtons = screen.getAllByRole('button', { name: '' })
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      )
      await user.click(deleteButton!)

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument()
        expect(screen.getByText(/remover módulo/i)).toBeInTheDocument()
        expect(
          screen.getByText(/tem certeza que deseja remover este módulo/i)
        ).toBeInTheDocument()
      })
    })

    it('should delete module when confirmed', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '' })
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      )
      await user.click(deleteButton!)

      const confirmButton = await screen.findByRole('button', {
        name: /remover/i,
      })
      await user.click(confirmButton)

      await waitFor(() => {
        expect(onModulesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({ id: 'module-2' }),
            expect.objectContaining({ id: 'module-3' }),
          ])
        )
        expect(onModulesChange).not.toHaveBeenCalledWith(
          expect.arrayContaining([expect.objectContaining({ id: 'module-1' })])
        )
      })
    })

    it('should reorder modules after deletion', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '' })
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      )
      await user.click(deleteButton!)

      const confirmButton = await screen.findByRole('button', {
        name: /remover/i,
      })
      await user.click(confirmButton)

      await waitFor(() => {
        const call = onModulesChange.mock.calls[0][0]
        expect(call[0].order).toBe(0)
        expect(call[1].order).toBe(1)
      })
    })

    it('should cancel deletion when cancel is clicked', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const deleteButtons = screen.getAllByRole('button', { name: '' })
      const deleteButton = deleteButtons.find(btn =>
        btn.querySelector('svg')?.classList.contains('lucide-trash-2')
      )
      await user.click(deleteButton!)

      const cancelButton = await screen.findByRole('button', {
        name: /cancelar/i,
      })
      await user.click(cancelButton)

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
        expect(onModulesChange).not.toHaveBeenCalled()
      })
    })
  })

  describe('Status Updates', () => {
    // TODO: Fix Radix UI select interaction tests (hasPointerCapture issue)
    it.skip('should update module status when changed', async () => {
      const user = userEvent.setup()
      const onModulesChange = vi.fn()
      render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      const statusSelects = screen.getAllByRole('combobox')
      await user.click(statusSelects[0])

      const pendingOption = await screen.findByText('Pendente')
      await user.click(pendingOption)

      await waitFor(() => {
        expect(onModulesChange).toHaveBeenCalledWith(
          expect.arrayContaining([
            expect.objectContaining({
              id: 'module-1',
              status: ModuleStatus.Pendente,
            }),
          ])
        )
      })
    })

    it('should display correct status badges', () => {
      render(<ModulesEditor {...defaultProps} />)

      // Use getAllByText since status labels appear both in select and badge
      expect(screen.getAllByText('Concluído').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Em Andamento').length).toBeGreaterThan(0)
      expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0)
    })
  })

  describe('Loading and Disabled States', () => {
    it('should disable all inputs when loading', () => {
      render(<ModulesEditor {...defaultProps} isLoading={true} />)

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      expect(addButton).toBeDisabled()
    })

    it('should disable all inputs when disabled prop is true', () => {
      render(<ModulesEditor {...defaultProps} disabled={true} />)

      const addButton = screen.getByRole('button', {
        name: /adicionar módulo/i,
      })
      expect(addButton).toBeDisabled()
    })

    it('should show loading spinner when isLoading is true', () => {
      render(<ModulesEditor {...defaultProps} isLoading={true} />)

      const spinner = document.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })
  })

  describe('Progress Calculation', () => {
    it('should calculate progress correctly with mixed statuses', () => {
      const modules: ModuleData[] = [
        { id: '1', title: 'M1', status: ModuleStatus.Concluido, order: 0 },
        { id: '2', title: 'M2', status: ModuleStatus.Concluido, order: 1 },
        { id: '3', title: 'M3', status: ModuleStatus.Em_Andamento, order: 2 },
        { id: '4', title: 'M4', status: ModuleStatus.Pendente, order: 3 },
      ]
      render(<ModulesEditor {...defaultProps} modules={modules} />)

      // 2 completed out of 4 = 50%
      expect(screen.getByText('50% concluído')).toBeInTheDocument()
    })

    it('should update progress when module status changes', async () => {
      const onModulesChange = vi.fn()

      const { rerender } = render(
        <ModulesEditor {...defaultProps} onModulesChange={onModulesChange} />
      )

      // Initial: 33% (1/3)
      expect(screen.getByText('33% concluído')).toBeInTheDocument()

      // Simulate status change
      const updatedModules = mockModules.map(m => ({
        ...m,
        status: m.id === 'module-2' ? ModuleStatus.Concluido : m.status,
      }))

      rerender(<ModulesEditor {...defaultProps} modules={updatedModules} />)

      // Now: 67% (2/3)
      expect(screen.getByText('67% concluído')).toBeInTheDocument()
    })

    it('should show 0% when no modules exist', () => {
      render(<ModulesEditor {...defaultProps} modules={[]} />)

      expect(screen.getByText('0% concluído')).toBeInTheDocument()
    })
  })
})
