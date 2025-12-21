'use client'

import { BarChart, type BarChartData } from './BarChart'
import { useItemsByStatus } from '@/hooks/useDashboardReports'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle } from 'lucide-react'

interface ItemsByStatusChartProps {
  title?: string
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  'Backlog': '#94A3B8', // Slate/Muted
  'Em_Andamento': '#3B82F6', // Primary - Sabiá Blue
  'Pausado': '#F59E0B', // Warning
  'Concluido': '#10B981', // Success
}

const STATUS_LABELS: Record<string, string> = {
  'Backlog': 'Backlog',
  'Em_Andamento': 'Em Andamento',
  'Pausado': 'Pausado',
  'Concluido': 'Concluído',
}

export function ItemsByStatusChart({
  title = 'Itens por Status',
  className,
}: ItemsByStatusChartProps) {
  const { data, isLoading, error } = useItemsByStatus()

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

  const chartData: BarChartData[] = data?.map(item => ({
    name: STATUS_LABELS[item.status] || item.status,
    value: item.count,
    color: STATUS_COLORS[item.status] || '#94A3B8',
  })) || []

  return (
    <div className={`h-full w-full ${className || ''}`}>
      <BarChart data={chartData} title={title} />
    </div>
  )
}
