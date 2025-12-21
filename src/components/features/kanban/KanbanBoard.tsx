'use client'

import { useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import {
  useLearningItems,
  useUpdateLearningItemStatus,
  type Status,
  type LearningItemDTO,
} from '@/hooks/useLearningItems'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'

const COLUMNS: Array<{ status: Status; title: string; color: string }> = [
  { status: 'Backlog', title: 'Backlog', color: '#6B7280' },
  { status: 'Em_Andamento', title: 'Em Andamento', color: '#3B82F6' },
  { status: 'Pausado', title: 'Pausado', color: '#F59E0B' },
  { status: 'Concluido', title: 'Concluído', color: '#10B981' },
]

export function KanbanBoard() {
  const { data: items, isLoading, error } = useLearningItems({ limit: 1000 })
  const updateStatus = useUpdateLearningItemStatus()
  const [activeItem, setActiveItem] = useState<LearningItemDTO | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Group items by status
  const itemsByStatus = useMemo(() => {
    const grouped: Record<Status, LearningItemDTO[]> = {
      Backlog: [],
      Em_Andamento: [],
      Pausado: [],
      Concluido: [],
    }

    if (!items) return grouped

    items.forEach(item => {
      grouped[item.status].push(item)
    })

    return grouped
  }, [items])

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const item = active.data.current?.item as LearningItemDTO | undefined
    if (item) {
      setActiveItem(item)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveItem(null)

    if (!over) return

    const itemId = active.id as string
    const item = active.data.current?.item as LearningItemDTO | undefined
    const newStatus = over.data.current?.status as Status | undefined

    if (!item || !newStatus || item.status === newStatus) return

    // Optimistically update the UI
    updateStatus.mutate({ id: itemId, status: newStatus })
  }

  if (isLoading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <div key={column.status} className="flex-1 min-w-[300px]">
            <Skeleton className="h-12 mb-3" />
            <Skeleton className="h-[600px]" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Erro ao carregar itens do Kanban
          </p>
        </div>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => (
          <KanbanColumn
            key={column.status}
            status={column.status}
            title={column.title}
            items={itemsByStatus[column.status] || []}
            color={column.color}
          />
        ))}
      </div>

      <DragOverlay>
        {activeItem ? <KanbanCard item={activeItem} /> : null}
      </DragOverlay>
    </DndContext>
  )
}
