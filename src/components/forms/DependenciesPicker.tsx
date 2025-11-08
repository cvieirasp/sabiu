'use client'

import { useState } from 'react'
import { Search, X, Loader2, AlertCircle, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'

export interface DependencyItem {
  id: string
  title: string
  status: string
}

export interface DependencyData {
  id: string
  targetItem: DependencyItem
}

export interface DependenciesPickerProps {
  itemId: string
  currentDependencies: DependencyData[]
  availableItems: DependencyItem[]
  onAdd: (targetItemIds: string[]) => Promise<void>
  onRemove: (dependencyId: string) => Promise<void>
  isLoading?: boolean
  disabled?: boolean
}

export function DependenciesPicker({
  itemId,
  currentDependencies,
  availableItems,
  onAdd,
  onRemove,
  isLoading = false,
  disabled = false,
}: DependenciesPickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Filter available items (exclude current dependencies and self)
  const filteredAvailableItems = availableItems.filter(item => {
    // Exclude self
    if (item.id === itemId) return false

    // Exclude already added dependencies
    const isAlreadyAdded = currentDependencies.some(
      dep => dep.targetItem.id === item.id
    )
    if (isAlreadyAdded) return false

    // Apply search filter
    if (searchQuery) {
      return item.title.toLowerCase().includes(searchQuery.toLowerCase())
    }

    return true
  })

  const handleToggleItem = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleAddDependencies = async () => {
    if (selectedItems.length === 0) return

    setIsAdding(true)
    setError(null)

    try {
      await onAdd(selectedItems)
      setSelectedItems([])
      setIsOpen(false)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to add dependencies'
      )
    } finally {
      setIsAdding(false)
    }
  }

  const handleRemoveDependency = async (dependencyId: string) => {
    setRemovingId(dependencyId)
    setError(null)

    try {
      await onRemove(dependencyId)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to remove dependency'
      )
    } finally {
      setRemovingId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Concluido':
        return 'bg-green-500/10 text-green-700 dark:text-green-400'
      case 'Em_Andamento':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400'
      case 'Pausado':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400'
      default:
        return 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Concluido':
        return 'Concluído'
      case 'Em_Andamento':
        return 'Em Andamento'
      case 'Pausado':
        return 'Pausado'
      case 'Backlog':
        return 'Backlog'
      default:
        return status
    }
  }

  const isDisabled = disabled || isLoading

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-sm font-semibold">
            Dependências (Pré-requisitos)
          </h3>
          <p className="text-xs text-muted-foreground">
            {currentDependencies.length}{' '}
            {currentDependencies.length === 1 ? 'item' : 'itens'} necessário(s)
            antes deste
          </p>
        </div>

        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isDisabled || filteredAvailableItems.length === 0}
            >
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Search className="mr-2 h-4 w-4" />
              )}
              Adicionar Pré-requisito
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0" align="end">
            <Command>
              <CommandInput
                placeholder="Buscar itens..."
                value={searchQuery}
                onValueChange={setSearchQuery}
              />
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {filteredAvailableItems.map(item => (
                  <CommandItem
                    key={item.id}
                    onSelect={() => handleToggleItem(item.id)}
                    className="cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      className="mr-2"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.title}</p>
                      <Badge
                        variant="secondary"
                        className={cn('text-xs', getStatusColor(item.status))}
                      >
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>

            {selectedItems.length > 0 && (
              <div className="border-t p-2">
                <Button
                  onClick={handleAddDependencies}
                  disabled={isAdding}
                  className="w-full"
                  size="sm"
                >
                  {isAdding ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="mr-2 h-4 w-4" />
                  )}
                  Adicionar {selectedItems.length}{' '}
                  {selectedItems.length === 1 ? 'item' : 'itens'}
                </Button>
              </div>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentDependencies.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum pré-requisito definido.
            <br />
            Adicione itens que devem ser concluídos antes deste.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {currentDependencies.map(dependency => (
            <div
              key={dependency.id}
              className="flex items-center gap-3 rounded-md border bg-card p-3"
            >
              <div className="flex-1">
                <p className="text-sm font-medium">
                  {dependency.targetItem.title}
                </p>
                <Badge
                  variant="secondary"
                  className={cn(
                    'text-xs mt-1',
                    getStatusColor(dependency.targetItem.status)
                  )}
                >
                  {getStatusLabel(dependency.targetItem.status)}
                </Badge>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveDependency(dependency.id)}
                disabled={isDisabled || removingId === dependency.id}
              >
                {removingId === dependency.id ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <X className="h-4 w-4 text-destructive" />
                )}
              </Button>
            </div>
          ))}
        </div>
      )}

      {filteredAvailableItems.length === 0 &&
        currentDependencies.length > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            Todos os itens disponíveis já foram adicionados como pré-requisitos
          </p>
        )}
    </div>
  )
}
