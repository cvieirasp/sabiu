'use client'

import { DonutChart, type DonutChartData } from './DonutChart'
import { useItemsByCategory } from '@/hooks/useDashboardReports'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface ItemsByCategoryChartProps {
  title?: string
  className?: string
}

export function ItemsByCategoryChart({
  title = 'Itens por Categoria',
  className,
}: ItemsByCategoryChartProps) {
  const { data, isLoading, error } = useItemsByCategory()

  if (isLoading) {
    return (
      <div className={`h-full w-full ${className || ''}`}>
        <Skeleton className="h-full w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className={`h-full w-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Erro ao carregar dados
          </p>
        </div>
      </div>
    )
  }

  const chartData: DonutChartData[] = data?.map(item => ({
    id: item.categoryId,
    name: item.categoryName,
    color: item.categoryColor,
    value: item.count,
  })) || []

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <DonutChart data={chartData} title={title} />
    </div>
  )
}
