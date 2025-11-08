'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import dynamic from 'next/dynamic'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import rehypeSanitize from 'rehype-sanitize'

import { ModuleStatus } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { cn } from '@/lib/utils'
import { ModulesEditor, ModuleData } from '@/components/forms/ModulesEditor'
import {
  DependenciesPicker,
  DependencyData,
  DependencyItem,
} from '@/components/forms/DependenciesPicker'

import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Import MDEditor dynamically to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

// Zod schema for form validation
const itemFormSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título não pode exceder 200 caracteres'),
  descriptionMD: z.string(),
  dueDate: z.date().nullable(),
  categoryId: z.string().nullable(),
  tagIds: z.array(z.string()),
  modules: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      status: z.enum(ModuleStatus),
      order: z.number(),
    })
  ),
  dependencyIds: z.array(z.string()),
})

export type ItemFormValues = z.infer<typeof itemFormSchema>

export interface ItemFormProps {
  initialValues?: Partial<ItemFormValues>
  tags?: Array<{ id: string; name: string }>
  availableItems?: DependencyItem[]
  onSubmit: (values: ItemFormValues) => Promise<void>
  isLoading?: boolean
  submitLabel?: string
}

export function ItemForm({
  initialValues,
  tags = [],
  availableItems = [],
  onSubmit,
  isLoading = false,
  submitLabel = 'Salvar',
}: ItemFormProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialValues?.tagIds || []
  )
  const [modules, setModules] = useState<ModuleData[]>(
    initialValues?.modules || []
  )
  const [dependencies, setDependencies] = useState<DependencyData[]>([])
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string; color: string }>
  >([])
  const [isFetchingCategories, setIsFetchingCategories] = useState(false)
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
      categoryId: initialValues?.categoryId || null,
      tagIds: initialValues?.tagIds || [],
      modules: initialValues?.modules || [],
      dependencyIds: initialValues?.dependencyIds || [],
    },
  })

  const descriptionMD = watch('descriptionMD')
  const dueDate = watch('dueDate')
  const selectedCategory = watch('categoryId')

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      setIsFetchingCategories(true)
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error)
      } finally {
        setIsFetchingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleFormSubmit = async (data: ItemFormValues) => {
    setIsSubmitting(true)
    try {
      // Include modules and dependencies in the submission
      const submissionData = {
        ...data,
        modules,
        dependencyIds: dependencies.map(dep => dep.targetItem.id),
      }
      await onSubmit(submissionData)
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleTag = (tagId: string) => {
    const newTags = selectedTags.includes(tagId)
      ? selectedTags.filter(id => id !== tagId)
      : [...selectedTags, tagId]

    setSelectedTags(newTags)
    setValue('tagIds', newTags)
  }

  const handleModulesChange = (updatedModules: ModuleData[]) => {
    setModules(updatedModules)
    setValue('modules', updatedModules)
  }

  const handleAddDependencies = async (targetItemIds: string[]) => {
    // Create mock dependency data for new dependencies
    const newDependencies = targetItemIds.map(itemId => {
      const item = availableItems.find(i => i.id === itemId)
      return {
        id: `temp-${Date.now()}-${itemId}`,
        targetItem: item!,
      }
    })
    setDependencies([...dependencies, ...newDependencies])
  }

  const handleRemoveDependency = async (dependencyId: string) => {
    setDependencies(dependencies.filter(dep => dep.id !== dependencyId))
  }

  const loading = isLoading || isSubmitting || isFetchingCategories

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
        <div data-color-mode="auto">
          <MDEditor
            value={descriptionMD}
            onChange={(value: string | undefined) =>
              setValue('descriptionMD', value || '')
            }
            preview="live"
            height={300}
            autoFocusEnd={true}
            textareaProps={{
              placeholder:
                'Descreva seu item de aprendizado... (Suporta Markdown)',
              disabled: loading,
            }}
            previewOptions={{
              rehypePlugins: [[rehypeSanitize]],
              className:
                'wmde-markdown prose prose-sm dark:prose-invert max-w-none',
            }}
            hideToolbar={loading}
          />
        </div>
        {errors.descriptionMD && (
          <p className="text-sm text-destructive mt-1">
            {errors.descriptionMD.message}
          </p>
        )}
      </div>

      {/* Category Selector */}
      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={selectedCategory || undefined}
          onValueChange={value => setValue('categoryId', value)}
          disabled={loading}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Selecione uma categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Nenhuma categoria</SelectItem>
            {categories.map(category => (
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
          <p className="text-sm text-destructive">
            {errors.categoryId.message}
          </p>
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
              onSelect={date => setValue('dueDate', date || null)}
              disabled={date => {
                const today = new Date()
                today.setHours(0, 0, 0, 0)
                return date < today
              }}
              locale={ptBR}
            />
          </PopoverContent>
        </Popover>
        {errors.dueDate && (
          <p className="text-sm text-destructive">{errors.dueDate.message}</p>
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
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId)
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
                {tags.map(tag => (
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

      {/* Modules Editor */}
      <div className="space-y-2">
        <ModulesEditor
          modules={modules}
          onModulesChange={handleModulesChange}
          isLoading={loading}
          disabled={loading}
        />
        {errors.modules && (
          <p className="text-sm text-destructive">{errors.modules.message}</p>
        )}
      </div>

      {/* Dependencies Picker */}
      <div className="space-y-2">
        <DependenciesPicker
          itemId={initialValues?.title || 'new-item'}
          currentDependencies={dependencies}
          availableItems={availableItems}
          onAdd={handleAddDependencies}
          onRemove={handleRemoveDependency}
          isLoading={loading}
          disabled={loading}
        />
        {errors.dependencyIds && (
          <p className="text-sm text-destructive">
            {errors.dependencyIds.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-3">
        <Button type="submit" className="cursor-pointer" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
