'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  GripVertical,
  Plus,
  Trash2,
  Check,
  X,
  Edit2,
  Loader2,
} from 'lucide-react'
import { ModuleStatus as PrismaModuleStatus } from '@prisma/client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

export interface ModuleData {
  id: string
  title: string
  status: PrismaModuleStatus
  order: number
}

export interface ModulesEditorProps {
  modules: ModuleData[]
  onModulesChange: (modules: ModuleData[]) => void
  isLoading?: boolean
  disabled?: boolean
}

interface SortableModuleItemProps {
  module: ModuleData
  onEdit: (module: ModuleData) => void
  onDelete: (moduleId: string) => void
  disabled?: boolean
}

function SortableModuleItem({
  module,
  onEdit,
  onDelete,
  disabled,
}: SortableModuleItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: module.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border bg-card p-3',
        isDragging && 'opacity-50'
      )}
    >
      <button
        className="cursor-grab active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
        {...attributes}
        {...listeners}
        type="button"
        disabled={disabled}
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>

      <div className="flex-1">
        <p className="font-medium">{module.title}</p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer"
        type="button"
        onClick={() => onEdit(module)}
        disabled={disabled}
      >
        <Edit2 className="h-4 w-4 text-accent" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="cursor-pointer"
        type="button"
        onClick={() => onDelete(module.id)}
        disabled={disabled}
      >
        <Trash2 className="h-4 w-4 text-destructive" />
      </Button>
    </div>
  )
}

export function ModulesEditor({
  modules,
  onModulesChange,
  isLoading = false,
  disabled = false,
}: ModulesEditorProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [editingModule, setEditingModule] = useState<ModuleData | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [deleteModuleId, setDeleteModuleId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = modules.findIndex(m => m.id === active.id)
      const newIndex = modules.findIndex(m => m.id === over.id)

      const reorderedModules = arrayMove(modules, oldIndex, newIndex).map(
        (module, index) => ({
          ...module,
          order: index,
        })
      )

      onModulesChange(reorderedModules)
    }
  }

  const handleAddModule = () => {
    if (!newModuleTitle.trim()) {
      setError('Título do módulo não pode estar vazio')
      return
    }

    if (newModuleTitle.length > 200) {
      setError('Título não pode exceder 200 caracteres')
      return
    }

    const newModule: ModuleData = {
      id: `temp-${Date.now()}`,
      title: newModuleTitle.trim(),
      status: PrismaModuleStatus.Pendente,
      order: modules.length,
    }

    onModulesChange([...modules, newModule])
    setNewModuleTitle('')
    setIsAdding(false)
    setError(null)
  }

  const handleEditModule = () => {
    if (!editingModule) return

    if (!editTitle.trim()) {
      setError('Título do módulo não pode estar vazio')
      return
    }

    if (editTitle.length > 200) {
      setError('Título não pode exceder 200 caracteres')
      return
    }

    const updatedModules = modules.map(m =>
      m.id === editingModule.id ? { ...m, title: editTitle.trim() } : m
    )

    onModulesChange(updatedModules)
    setEditingModule(null)
    setEditTitle('')
    setError(null)
  }

  const handleDeleteModule = () => {
    if (!deleteModuleId) return

    const filteredModules = modules
      .filter(m => m.id !== deleteModuleId)
      .map((m, index) => ({ ...m, order: index }))

    onModulesChange(filteredModules)
    setDeleteModuleId(null)
  }

  const isDisabled = disabled || isLoading

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-lg font-semibold">Módulos</h3>
          <p className="text-sm text-muted-foreground">
            {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="cursor-pointer"
          type="button"
          onClick={() => setIsAdding(true)}
          disabled={isDisabled}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Plus className="mr-2 h-4 w-4" />
          )}
          Adicionar Módulo
        </Button>
      </div>

      {isAdding && (
        <div className="flex items-center gap-2 rounded-md border bg-muted/50 p-3">
          <Input
            placeholder="Título do módulo"
            value={newModuleTitle}
            onChange={e => setNewModuleTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddModule()
              if (e.key === 'Escape') {
                setIsAdding(false)
                setNewModuleTitle('')
                setError(null)
              }
            }}
            disabled={isDisabled}
          />
          <Button
            size="icon"
            variant="default"
            className="cursor-pointer"
            onClick={handleAddModule}
            type="button"
            disabled={isDisabled}
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="cursor-pointer"
            type="button"
            onClick={() => {
              setIsAdding(false)
              setNewModuleTitle('')
              setError(null)
            }}
            disabled={isDisabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      {modules.length === 0 ? (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum módulo adicionado ainda.
            <br />
            Clique em &quot;Adicionar Módulo&quot; para começar.
          </p>
        </div>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={modules.map(m => m.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {modules.map(module => (
                <SortableModuleItem
                  key={module.id}
                  module={module}
                  onEdit={m => {
                    setEditingModule(m)
                    setEditTitle(m.title)
                  }}
                  onDelete={setDeleteModuleId}
                  disabled={isDisabled}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingModule}
        onOpenChange={() => setEditingModule(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Módulo</DialogTitle>
            <DialogDescription>
              Atualize o título do módulo abaixo.
            </DialogDescription>
          </DialogHeader>
          <Input
            value={editTitle}
            onChange={e => setEditTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleEditModule()
            }}
            placeholder="Título do módulo"
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              type="button"
              onClick={() => setEditingModule(null)}
            >
              Cancelar
            </Button>
            <Button
              className="cursor-pointer"
              type="button"
              onClick={handleEditModule}
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteModuleId}
        onOpenChange={() => setDeleteModuleId(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remover Módulo</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja remover este módulo? Esta ação não pode ser
              desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              className="cursor-pointer"
              type="button"
              onClick={() => setDeleteModuleId(null)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              className="cursor-pointer"
              type="button"
              onClick={handleDeleteModule}
            >
              Remover
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
