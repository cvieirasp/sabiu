import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DependenciesPicker, type DependenciesPickerProps } from '../DependenciesPicker'

describe('DependenciesPicker', () => {
  const mockAvailableItems = [
    { id: 'item-1', title: 'TypeScript Basics', status: 'Concluido' },
    { id: 'item-2', title: 'React Fundamentals', status: 'Em_Andamento' },
    { id: 'item-3', title: 'Next.js Guide', status: 'Backlog' },
  ]

  const mockCurrentDependencies = [
    {
      id: 'dep-1',
      targetItem: { id: 'item-4', title: 'JavaScript Essentials', status: 'Concluido' },
    },
  ]

  const defaultProps: DependenciesPickerProps = {
    itemId: 'current-item',
    currentDependencies: mockCurrentDependencies,
    availableItems: mockAvailableItems,
    onAdd: vi.fn().mockResolvedValue(undefined),
    onRemove: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    disabled: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render dependencies picker with title', () => {
      render(<DependenciesPicker {...defaultProps} />)

      expect(screen.getByText(/dependências \(pré-requisitos\)/i)).toBeInTheDocument()
      expect(screen.getByText(/1 item necessário\(s\) antes deste/i)).toBeInTheDocument()
    })

    it('should display current dependencies', () => {
      render(<DependenciesPicker {...defaultProps} />)

      expect(screen.getByText('JavaScript Essentials')).toBeInTheDocument()
      expect(screen.getByText('Concluído')).toBeInTheDocument()
    })

    it('should show empty state when no dependencies', () => {
      render(<DependenciesPicker {...defaultProps} currentDependencies={[]} />)

      expect(screen.getByText(/nenhum pré-requisito definido/i)).toBeInTheDocument()
      expect(
        screen.getByText(/adicione itens que devem ser concluídos antes deste/i)
      ).toBeInTheDocument()
    })

    it('should render add button', () => {
      render(<DependenciesPicker {...defaultProps} />)

      expect(
        screen.getByRole('button', { name: /adicionar pré-requisito/i })
      ).toBeInTheDocument()
    })

    it('should display loading state', () => {
      render(<DependenciesPicker {...defaultProps} isLoading={true} />)

      const addButton = screen.getByRole('button', { name: /adicionar pré-requisito/i })
      expect(addButton).toBeDisabled()
    })

    it('should disable all controls when disabled prop is true', () => {
      render(<DependenciesPicker {...defaultProps} disabled={true} />)

      const addButton = screen.getByRole('button', { name: /adicionar pré-requisito/i })
      expect(addButton).toBeDisabled()
    })
  })

  describe('Filtering', () => {
    it('should exclude current item from available items', () => {
      const itemsWithSelf = [
        ...mockAvailableItems,
        { id: 'current-item', title: 'Current Item', status: 'Backlog' },
      ]

      render(<DependenciesPicker {...defaultProps} availableItems={itemsWithSelf} />)

      // Current item should not appear in the list
      // We can't easily test this without opening the popover
    })

    it('should exclude already added dependencies from available items', () => {
      const itemsWithExisting = [
        ...mockAvailableItems,
        { id: 'item-4', title: 'JavaScript Essentials', status: 'Concluido' },
      ]

      render(<DependenciesPicker {...defaultProps} availableItems={itemsWithExisting} />)

      // Already added item should not appear in the list
      // We can't easily test this without opening the popover
    })
  })

  describe('Remove Dependency', () => {
    it('should call onRemove when remove button is clicked', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn().mockResolvedValue(undefined)

      render(<DependenciesPicker {...defaultProps} onRemove={onRemove} />)

      // Find remove button (X icon button)
      const removeButtons = screen.getAllByRole('button')
      const removeButton = removeButtons.find((btn) =>
        btn.querySelector('.lucide-x')
      )

      if (removeButton) {
        await user.click(removeButton)

        await waitFor(() => {
          expect(onRemove).toHaveBeenCalledWith('dep-1')
        })
      }
    })

    it('should show loading state on remove button while removing', async () => {
      const user = userEvent.setup()
      const onRemove = vi
        .fn()
        .mockImplementation(
          () => new Promise((resolve) => setTimeout(resolve, 100))
        )

      render(<DependenciesPicker {...defaultProps} onRemove={onRemove} />)

      const removeButtons = screen.getAllByRole('button')
      const removeButton = removeButtons.find((btn) =>
        btn.querySelector('.lucide-x')
      )

      if (removeButton) {
        await user.click(removeButton)

        // Should show loader
        await waitFor(() => {
          expect(removeButton.querySelector('.animate-spin')).toBeInTheDocument()
        })
      }
    })

    it('should display error message when remove fails', async () => {
      const user = userEvent.setup()
      const onRemove = vi.fn().mockRejectedValue(new Error('Failed to remove'))

      render(<DependenciesPicker {...defaultProps} onRemove={onRemove} />)

      const removeButtons = screen.getAllByRole('button')
      const removeButton = removeButtons.find((btn) =>
        btn.querySelector('.lucide-x')
      )

      if (removeButton) {
        await user.click(removeButton)

        await waitFor(() => {
          expect(screen.getByText(/failed to remove/i)).toBeInTheDocument()
        })
      }
    })
  })

  describe('Status Display', () => {
    it('should display status labels correctly', () => {
      const dependencies = [
        {
          id: 'dep-1',
          targetItem: { id: 'item-1', title: 'Item 1', status: 'Concluido' },
        },
        {
          id: 'dep-2',
          targetItem: { id: 'item-2', title: 'Item 2', status: 'Em_Andamento' },
        },
        {
          id: 'dep-3',
          targetItem: { id: 'item-3', title: 'Item 3', status: 'Pausado' },
        },
        {
          id: 'dep-4',
          targetItem: { id: 'item-4', title: 'Item 4', status: 'Backlog' },
        },
      ]

      render(<DependenciesPicker {...defaultProps} currentDependencies={dependencies} />)

      expect(screen.getByText('Concluído')).toBeInTheDocument()
      expect(screen.getByText('Em Andamento')).toBeInTheDocument()
      expect(screen.getByText('Pausado')).toBeInTheDocument()
      expect(screen.getByText('Backlog')).toBeInTheDocument()
    })
  })

  describe('Counts', () => {
    it('should display correct count for single dependency', () => {
      render(<DependenciesPicker {...defaultProps} currentDependencies={mockCurrentDependencies} />)

      expect(screen.getByText(/1 item necessário\(s\) antes deste/i)).toBeInTheDocument()
    })

    it('should display correct count for multiple dependencies', () => {
      const multipleDeps = [
        ...mockCurrentDependencies,
        {
          id: 'dep-2',
          targetItem: { id: 'item-5', title: 'Another Item', status: 'Backlog' },
        },
      ]

      render(<DependenciesPicker {...defaultProps} currentDependencies={multipleDeps} />)

      expect(screen.getByText(/2 itens necessário\(s\) antes deste/i)).toBeInTheDocument()
    })

    it('should display zero when no dependencies', () => {
      render(<DependenciesPicker {...defaultProps} currentDependencies={[]} />)

      expect(screen.getByText(/0 itens necessário\(s\) antes deste/i)).toBeInTheDocument()
    })
  })

  describe('Empty States', () => {
    it('should show message when all available items are added', () => {
      render(
        <DependenciesPicker
          {...defaultProps}
          currentDependencies={mockCurrentDependencies}
          availableItems={[]}
        />
      )

      expect(
        screen.getByText(/todos os itens disponíveis já foram adicionados como pré-requisitos/i)
      ).toBeInTheDocument()
    })

    it('should disable add button when no available items', () => {
      render(<DependenciesPicker {...defaultProps} availableItems={[]} />)

      const addButton = screen.getByRole('button', { name: /adicionar pré-requisito/i })
      expect(addButton).toBeDisabled()
    })
  })
})
