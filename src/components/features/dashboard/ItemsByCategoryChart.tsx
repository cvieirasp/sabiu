'use client'

import { DonutChart, type DonutChartData } from './DonutChart'

// Mock data - will be replaced with real API data later
const MOCK_DATA: DonutChartData[] = [
  {
    id: 'cat-1',
    name: 'E-Learning',
    color: '#3B82F6',
    value: 12,
  },
  {
    id: 'cat-2',
    name: 'YouTube',
    color: '#FF5733',
    value: 8,
  },
  {
    id: 'cat-3',
    name: 'Book',
    color: '#10B981',
    value: 5,
  },
  {
    id: 'cat-4',
    name: 'MBA',
    value: 7,
    color: '#F59E0B', // Warning
  },
]

interface ItemsByCategoryChartProps {
  title?: string
  className?: string
}

export function ItemsByCategoryChart({
  title = 'Itens por Categoria',
  className,
}: ItemsByCategoryChartProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <DonutChart data={MOCK_DATA} title={title} />
    </div>
  )
}
