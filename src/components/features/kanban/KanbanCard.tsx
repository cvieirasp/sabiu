'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import type { LearningItemDTO } from '@/hooks/useLearningItems'
import { GripVertical } from 'lucide-react'

interface KanbanCardProps {
  item: LearningItemDTO
}

export function KanbanCard({ item }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: {
      type: 'item',
      item,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="cursor-move hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm line-clamp-2">{item.title}</h3>
            </div>
            <button
              className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="w-4 h-4" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 space-y-3">
          {/* Category badge */}
          <Badge
            variant="secondary"
            style={{
              backgroundColor: `${item.category.color}20`,
              color: item.category.color,
              borderColor: item.category.color,
            }}
            className="border"
          >
            {item.category.name}
          </Badge>

          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Progresso</span>
              <span className="font-medium">{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-1.5" />
          </div>

          {/* Due date if exists */}
          {item.dueDate && (
            <div className="text-xs text-muted-foreground">
              Prazo: {new Date(item.dueDate).toLocaleDateString('pt-BR')}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
