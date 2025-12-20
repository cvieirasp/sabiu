'use client'

import { BarChart, type BarChartData } from './BarChart'

// Mock data - will be replaced with real API data later
const MOCK_DATA: BarChartData[] = [
  {
    name: 'Backlog',
    value: 15,
    color: '#94A3B8', // Slate/Muted
  },
  {
    name: 'Em Andamento',
    value: 8,
    color: '#3B82F6', // Primary - Sabiá Blue
  },
  {
    name: 'Pausado',
    value: 3,
    color: '#F59E0B', // Warning
  },
  {
    name: 'Concluído',
    value: 10,
    color: '#10B981', // Success
  },
]

interface ItemsByStatusChartProps {
  title?: string
  className?: string
}

export function ItemsByStatusChart({
  title = 'Itens por Status',
  className,
}: ItemsByStatusChartProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <BarChart data={MOCK_DATA} title={title} />
    </div>
  )
}
