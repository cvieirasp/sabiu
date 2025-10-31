'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeSanitize from 'rehype-sanitize'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Status } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

// Zod schema for form validation
const itemFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode exceder 200 caracteres'),
  descriptionMD: z.string(),
  dueDate: z.date().nullable(),
  status: z.nativeEnum(Status),
  categoryId: z.string().nullable(),
  tagIds: z.array(z.string()),
})

export type ItemFormValues = z.infer<typeof itemFormSchema>

export interface ItemFormProps {
  initialValues?: Partial<ItemFormValues>
  categories?: Array<{ id: string; name: string; color: string }>
  tags?: Array<{ id: string; name: string }>
  onSubmit: (values: ItemFormValues) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function ItemForm({
  initialValues,
  categories = [],
  tags = [],
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
}: ItemFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tagIds || []
  )
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      title: initialValues?.title || '',
      descriptionMD: initialValues?.descriptionMD || '',
      dueDate: initialValues?.dueDate || null,
      status: initialValues?.status || Status.Backlog,
      categoryId: initialValues?.categoryId || null,
      tagIds: initialValues?.tagIds || [],
    },
  })

  const descriptionMD = watch('descriptionMD')
  const dueDate = watch('dueDate')
  const selectedStatus = watch('status')
  const selectedCategory = watch('categoryId')

  const handleFormSubmit = async (data: ItemFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter((id) => id !== tagId)
      : [...selectedTags, tagId]

    setSelectedTags(newTags)
    setValue('tagIds', newTags)
  }

  const statusLabels = {
    [Status.Backlog]: 'Backlog',
    [Status.Em_Andamento]: 'Em Andamento',
    [Status.Pausado]: 'Pausado',
    [Status.Concluido]: 'Concluído',
  }

  const loading = isLoading || isSubmitting

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Title Field */}
      <div className="space-y-2">
        <Label htmlFor="title">
          Título <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          placeholder="Ex: Aprender TypeScript Avançado"
          aria-invalid={!!errors.title}
          disabled={loading}
          {...register('title')}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      {/* Description with Markdown */}
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Tabs defaultValue="edit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit">Editar</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit" className="mt-2">
            <Textarea
              id="description"
              placeholder="Descreva seu item de aprendizado... (Suporta Markdown)"
              rows={8}
              disabled={loading}
              aria-invalid={!!errors.descriptionMD}
              {...register('descriptionMD')}
            />
            {errors.descriptionMD && (
              <p className="text-sm text-destructive mt-1">
                {errors.descriptionMD.message}
              </p>
            )}
          </TabsContent>
          <TabsContent value="preview" className="mt-2">
            <div className="min-h-[200px] rounded-md border border-input bg-background p-4">
              {descriptionMD ? (
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeSanitize]}
                  >
                    {descriptionMD}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">
                  Nenhuma descrição para visualizar
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={selectedCategory || undefined}
          onValueChange={(value) => setValue('categoryId', value)}
          disabled={loading}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma categoria</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {category.name}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.categoryId && (
          <p className="text-sm text-destructive">{errors.categoryId.message}</p>
        )}
      </div>

      {/* Due Date Picker */}
      <div className="space-y-2">
        <Label htmlFor="dueDate">Prazo</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="dueDate"
              variant="outline"
              className={cn(
                'w-full justify-start text-left font-normal',
                !dueDate && 'text-muted-foreground'
              )}
              disabled={loading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dueDate ? (
                format(dueDate, 'PPP', { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dueDate || undefined}
              onSelect={(date) => setValue('dueDate', date || null)}
              initialFocus
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        {errors.dueDate && (
          <p className="text-sm text-destructive">{errors.dueDate.message}</p>
        )}
      </div>

      {/* Status Selector */}
      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select
          value={selectedStatus}
          onValueChange={(value) => setValue('status', value as Status)}
          disabled={loading}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione um status" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(Status).map((status) => (
              <SelectItem key={status} value={status}>
                {statusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive">{errors.status.message}</p>
        )}
      </div>

      {/* Tags Multi-Select */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start"
              disabled={loading}
            >
              {selectedTags.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map((tagId) => {
                    const tag = tags.find((t) => t.id === tagId)
                    return tag ? (
                      <Badge key={tagId} variant="secondary">
                        {tag.name}
                      </Badge>
                    ) : null
                  })}
                </div>
              ) : (
                <span className="text-muted-foreground">Selecione tags</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[400px] p-0">
            <Command>
              <CommandInput placeholder="Buscar tags..." />
              <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
              <CommandGroup className="max-h-64 overflow-auto">
                {tags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    onSelect={() => toggleTag(tag.id)}
                    className="cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedTags.includes(tag.id)}
                      className="mr-2"
                    />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </Command>
          </PopoverContent>
        </Popover>
        {errors.tagIds && (
          <p className="text-sm text-destructive">{errors.tagIds.message}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
