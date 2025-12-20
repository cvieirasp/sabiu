'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { ItemForm, type ItemFormValues } from '@/components/forms/ItemForm'

interface CreateItemModalProps {
  trigger?: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSuccess?: () => void
}

export function CreateItemModal({
  trigger,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
  onSuccess,
}: CreateItemModalProps) {
  const router = useRouter()
  const [internalOpen, setInternalOpen] = useState(false)

  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen
  const setIsOpen =
    controlledOnOpenChange !== undefined ? controlledOnOpenChange : setInternalOpen

  const handleCreateItem = async (values: ItemFormValues) => {
    const response = await fetch('/api/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: values.title,
        descriptionMD: values.descriptionMD,
        dueDate: values.dueDate?.toISOString(),
        categoryId: values.categoryId,
        modules: values.modules,
        dependencyIds: values.dependencyIds,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Failed to create item')
    }

    setIsOpen(false)

    // Call onSuccess callback if provided
    if (onSuccess) {
      onSuccess()
    } else {
      // Default behavior: refresh the page
      router.refresh()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Novo Item de Aprendizado</DialogTitle>
          <DialogDescription>
            Preencha os detalhes do seu novo item de aprendizado
          </DialogDescription>
        </DialogHeader>
        <ItemForm onSubmit={handleCreateItem} submitLabel="Criar Item" />
      </DialogContent>
    </Dialog>
  )
}
