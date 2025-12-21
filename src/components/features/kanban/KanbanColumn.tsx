'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './KanbanCard'
import type { LearningItemDTO, Status } from '@/hooks/useLearningItems'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface KanbanColumnProps {
  status: Status
  title: string
  items: LearningItemDTO[]
  color: string
}

export function KanbanColumn({ status, title, items, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      type: 'column',
      status,
    },
  })

  return (
    <div className="flex flex-col gap-3 flex-1 min-w-[300px]">
      {/* Column header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h2 className="font-semibold text-sm">{title}</h2>
        </div>
        <Badge variant="secondary" className="rounded-full">
          {items.length}
        </Badge>
      </div>

      {/* Droppable area */}
      <Card
        ref={setNodeRef}
        className={`flex-1 p-3 transition-colors ${
          isOver ? 'bg-accent/50 border-accent' : 'bg-muted/30'
        }`}
      >
        <SortableContext
          items={items.map(item => item.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3 min-h-[200px]">
            {items.map(item => (
              <KanbanCard key={item.id} item={item} />
            ))}
            {items.length === 0 && (
              <div className="flex items-center justify-center h-32 text-sm text-muted-foreground">
                Nenhum item
              </div>
            )}
          </div>
        </SortableContext>
      </Card>
    </div>
  )
}
