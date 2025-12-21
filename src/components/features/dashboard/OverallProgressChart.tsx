'use client'

import { LineChart, type LineChartDataPoint, type LineConfig } from './LineChart'
import { useProgressByCategory } from '@/hooks/useDashboardReports'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface OverallProgressChartProps {
  title?: string
  className?: string
}

const MONTH_LABELS: Record<string, string> = {
  '01': 'Jan',
  '02': 'Fev',
  '03': 'Mar',
  '04': 'Abr',
  '05': 'Mai',
  '06': 'Jun',
  '07': 'Jul',
  '08': 'Ago',
  '09': 'Set',
  '10': 'Out',
  '11': 'Nov',
  '12': 'Dez',
}

export function OverallProgressChart({
  title = 'Progresso Médio por Categoria',
  className,
}: OverallProgressChartProps) {
  const { data, isLoading, error } = useProgressByCategory(6)

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

  // Transform API data to chart format
  // Group by month and create data points
  const monthsMap = new Map<string, Record<string, number>>()
  const categoriesSet = new Set<string>()
  const categoryColors = new Map<string, string>()

  data?.forEach(item => {
    const monthKey = item.month
    const [, month] = monthKey.split('-')
    const monthLabel = MONTH_LABELS[month] || month

    if (!monthsMap.has(monthLabel)) {
      monthsMap.set(monthLabel, { name: monthLabel })
    }

    const monthData = monthsMap.get(monthLabel)!
    monthData[item.categoryName] = item.averageProgress

    categoriesSet.add(item.categoryName)

    // Store color for this category (use first occurrence)
    if (!categoryColors.has(item.categoryName)) {
      // Generate a color based on category name if not provided
      // You could also fetch this from the items-by-category endpoint
      const colors = ['#3B82F6', '#FF5733', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899']
      const index = Array.from(categoriesSet).indexOf(item.categoryName)
      categoryColors.set(item.categoryName, colors[index % colors.length])
    }
  })

  const chartData: LineChartDataPoint[] = Array.from(monthsMap.values())

  const lines: LineConfig[] = Array.from(categoriesSet).map(categoryName => ({
    dataKey: categoryName,
    name: categoryName,
    color: categoryColors.get(categoryName) || '#94A3B8',
  }))

  // Empty state
  if (chartData.length === 0) {
    return (
      <div className={`h-full w-full flex items-center justify-center ${className || ''}`}>
        <div className="text-center p-6">
          <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            Sem dados de progresso disponíveis
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <LineChart
        data={chartData}
        lines={lines}
        title={title}
        yAxisLabel="Progresso Médio (%)"
        showLegend={true}
      />
    </div>
  )
}
