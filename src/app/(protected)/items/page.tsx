'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { Plus, Search, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ItemsTable,
  type LearningItemRow,
  type SortField,
  type SortDirection,
} from '@/components/features/items/ItemsTable'
import { ItemsTableSkeleton } from '@/components/features/items/ItemsTableSkeleton'
import { CreateItemModal } from '@/components/features/items/CreateItemModal'
import { PageHeader } from '@/components/layouts/page-header'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Todos os status' },
  { value: 'Backlog', label: 'Backlog' },
  { value: 'Em_Andamento', label: 'Em Andamento' },
  { value: 'Pausado', label: 'Pausado' },
  { value: 'Concluido', label: 'Concluído' },
]

interface ItemsResponse {
  success: boolean
  data: LearningItemRow[]
  meta: {
    total: number
    page: number
    limit: number
  }
}

async function fetchCategories() {
  const response = await fetch('/api/categories')

  if (!response.ok) {
    throw new Error('Failed to fetch categories')
  }

  const result = await response.json()

  return result.data as { id: string; name: string; color: string }[]
}

async function fetchItems(params: {
  page: number
  limit: number
  status?: string
  categoryId?: string
  search?: string
  orderBy?: string
  order?: string
}): Promise<ItemsResponse> {
  const searchParams = new URLSearchParams()
  searchParams.set('page', params.page.toString())
  searchParams.set('limit', params.limit.toString())

  if (params.status && params.status !== 'all') {
    searchParams.set('status', params.status)
  }
  if (params.categoryId && params.categoryId !== 'all') {
    searchParams.set('categoryId', params.categoryId)
  }
  if (params.search) {
    searchParams.set('search', params.search)
  }
  if (params.orderBy) {
    searchParams.set('orderBy', params.orderBy)
  }
  if (params.order) {
    searchParams.set('order', params.order)
  }

  const response = await fetch(`/api/items?${searchParams.toString()}`)

  if (!response.ok) {
    throw new Error('Failed to fetch items')
  }

  const result = await response.json()

  return {
    success: result.success,
    data: result.data.map(
      (item: {
        id: string
        title: string
        status: string
        progress: number
        dueDate: string | null
        category: {
          id: string
          name: string
          color: string
        }
        createdAt: string
      }) => ({
        id: item.id,
        title: item.title,
        status: item.status,
        progressCached: item.progress,
        dueDate: item.dueDate ? new Date(item.dueDate) : null,
        category: item.category,
        createdAt: new Date(item.createdAt),
      })
    ),
    meta: result.meta,
  }
}

async function deleteItem(itemId: string): Promise<void> {
  const response = await fetch(`/api/items/${itemId}`, {
    method: 'DELETE',
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error?.message || 'Failed to delete item')
  }
}

export default function ItemsPage() {
  const router = useRouter()

  // Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  // Filters state
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [searchInput, setSearchInput] = useState<string>('')

  // Pagination state
  const [page, setPage] = useState<number>(1)
  const [limit] = useState<number>(10)

  // Sorting state
  const [sortField, setSortField] = useState<SortField | null>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Fetch categories with React Query
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  // Fetch items with React Query
  const {
    data: itemsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: [
      'items',
      page,
      limit,
      statusFilter,
      categoryFilter,
      searchQuery,
      sortField,
      sortDirection,
    ],
    queryFn: () =>
      fetchItems({
        page,
        limit,
        status: statusFilter,
        categoryId: categoryFilter,
        search: searchQuery,
        orderBy: sortField || 'createdAt',
        order: sortDirection || 'desc',
      }),
  })

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(prev => {
        if (prev === 'asc') return 'desc'
        if (prev === 'desc') return null
        return 'asc'
      })
      if (sortDirection === 'desc') {
        setSortField(null)
      }
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setPage(1) // Reset to first page
  }

  const handleClearSearch = () => {
    setSearchInput('')
    setSearchQuery('')
    setPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPage(1)
  }

  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value)
    setPage(1)
  }

  const handleView = (itemId: string) => {
    router.push(`/items/${itemId}`)
  }

  const handleEdit = (itemId: string) => {
    router.push(`/items/${itemId}/edit`)
  }

  const handleDelete = async (itemId: string) => {
    await deleteItem(itemId)
    await refetch()
  }

  const handleNewItem = () => {
    setIsCreateModalOpen(true)
  }

  const handleCreateSuccess = async () => {
    await refetch()
  }

  const totalPages = itemsData?.meta
    ? Math.ceil(itemsData.meta.total / itemsData.meta.limit)
    : 0

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <PageHeader
        title="Itens de Aprendizado"
        subtitle="Gerencie seus cursos, vídeos, livros e certificações"
        action={
          <Button className="cursor-pointer" onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" />
            Novo Item
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por título ou descrição..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleSearch()
                }
              }}
              className="pl-9 pr-9"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <Button
            className="cursor-pointer"
            onClick={handleSearch}
            variant="secondary"
          >
            Buscar
          </Button>
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Category Filter - TODO: Fetch categories from API */}
        <Select value={categoryFilter} onValueChange={handleCategoryChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categoriesData &&
              categoriesData.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {itemsData && (
        <div className="text-sm text-muted-foreground">
          {itemsData.meta.total === 0
            ? 'Nenhum item encontrado'
            : `${itemsData.meta.total} ${itemsData.meta.total === 1 ? 'item encontrado' : 'itens encontrados'}`}
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <ItemsTableSkeleton />
      ) : error ? (
        <div className="rounded-md border border-destructive bg-destructive/10 p-4">
          <p className="text-sm text-destructive">
            Erro ao carregar itens. Tente novamente.
          </p>
        </div>
      ) : itemsData && itemsData.data.length > 0 ? (
        <ItemsTable
          items={itemsData.data}
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-muted-foreground text-lg mb-4">
            Nenhum item encontrado
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Comece criando seu primeiro item de aprendizado
          </p>
          <Button className="cursor-pointer" onClick={handleNewItem}>
            <Plus className="mr-2 h-4 w-4" />
            Criar Primeiro Item
          </Button>
        </div>
      )}

      {/* Pagination */}
      {itemsData && itemsData.data.length > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}

      {/* Create Item Modal */}
      <CreateItemModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </div>
  )
}
