'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface LearningItemRow {
  id: string
  title: string
  status: string
  progressCached: number
  dueDate: Date | null
  category: {
    id: string
    name: string
    color: string
  }
  createdAt: Date
}

export type SortField =
  | 'title'
  | 'status'
  | 'progressCached'
  | 'dueDate'
  | 'createdAt'
  | 'updatedAt'
export type SortDirection = 'asc' | 'desc' | null

export interface ItemsTableProps {
  items: LearningItemRow[]
  sortField: SortField | null
  sortDirection: SortDirection
  onSort: (field: SortField) => void
  onView: (itemId: string) => void
  onEdit: (itemId: string) => void
  onDelete: (itemId: string) => Promise<void>
}

export function ItemsTable({
  items,
  sortField,
  sortDirection,
  onSort,
  onView,
  onEdit,
  onDelete,
}: ItemsTableProps) {
  const [deleteItemId, setDeleteItemId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteItemId) return

    setIsDeleting(true)
    try {
      await onDelete(deleteItemId)
      setDeleteItemId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('title')}
                  className="h-8 px-2"
                >
                  Título
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('status')}
                  className="h-8 px-2"
                >
                  Status
                  {getSortIcon('status')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('progressCached')}
                  className="h-8 px-2"
                >
                  Progresso
                  {getSortIcon('progressCached')}
                </Button>
              </TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('dueDate')}
                  className="h-8 px-2"
                >
                  Prazo
                  {getSortIcon('dueDate')}
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => onSort('createdAt')}
                  className="h-8 px-2"
                >
                  Criado em
                  {getSortIcon('createdAt')}
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  Nenhum item encontrado.
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/items/${item.id}`}
                      className="hover:underline"
                    >
                      {item.title}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn('text-xs', getStatusColor(item.status))}
                    >
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={item.progressCached} className="w-20" />
                      <span className="text-xs text-muted-foreground">
                        {item.progressCached}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.category.color }}
                      />
                      <span className="text-sm">{item.category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.dueDate ? (
                      <span className="text-sm">
                        {format(item.dueDate, 'dd/MM/yyyy', { locale: ptBR })}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {format(item.createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onView(item.id)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Visualizar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(item.id)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setDeleteItemId(item.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deletar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deleteItemId} onOpenChange={() => setDeleteItemId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja deletar este item de aprendizado? Esta ação
              não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteItemId(null)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deletando...' : 'Deletar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
