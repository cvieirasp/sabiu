'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CreateItemModal } from '@/components/features/items/CreateItemModal'

export function CreateItemButton() {
  return (
    <CreateItemModal
      trigger={
        <Button
          size="lg"
          className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50 cursor-pointer"
        >
          <Plus className="h-6 w-6" />
        </Button>
      }
    />
  )
}
