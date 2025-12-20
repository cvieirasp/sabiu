'use client'

import { LineChart, type LineChartDataPoint, type LineConfig } from './LineChart'

// Mock data - will be replaced with real API data later
// Represents average progress per category over the last 12 months
const MOCK_DATA: LineChartDataPoint[] = [
  { name: 'Jan', 'E-Learning': 10, 'YouTube': 8, 'Book': 20, 'MBA': 12 },
  { name: 'Fev', 'E-Learning': 15, 'YouTube': 12, 'Book': 10, 'MBA': 18 },
  { name: 'Mar', 'E-Learning': 22, 'YouTube': 5, 'Book': 15, 'MBA': 25 },
  { name: 'Abr', 'E-Learning': 18, 'YouTube': 3, 'Book': 12, 'MBA': 32 },
  { name: 'Mai', 'E-Learning': 35, 'YouTube': 20, 'Book': 10, 'MBA': 40 },
  { name: 'Jun', 'E-Learning': 24, 'YouTube': 38, 'Book': 8, 'MBA': 48 },
  { name: 'Jul', 'E-Learning': 42, 'YouTube': 10, 'Book': 13, 'MBA': 55 },
  { name: 'Ago', 'E-Learning': 58, 'YouTube': 15, 'Book': 16, 'MBA': 63 },
  { name: 'Set', 'E-Learning': 40, 'YouTube': 26, 'Book': 23, 'MBA': 70 },
  { name: 'Out', 'E-Learning': 45, 'YouTube': 34, 'Book': 21, 'MBA': 76 },
  { name: 'Nov', 'E-Learning': 69, 'YouTube': 20, 'Book': 12, 'MBA': 82 },
  { name: 'Dez', 'E-Learning': 85, 'YouTube': 13, 'Book': 7, 'MBA': 88 },
]

// Line configurations matching category colors
const LINES: LineConfig[] = [
  { dataKey: 'E-Learning', name: 'E-Learning', color: '#3B82F6' },
  { dataKey: 'YouTube', name: 'YouTube', color: '#FF5733' },
  { dataKey: 'Book', name: 'Book', color: '#10B981' },
  { dataKey: 'MBA', name: 'MBA', color: '#F59E0B' },
]

interface OverallProgressChartProps {
  title?: string
  className?: string
}

export function OverallProgressChart({
  title = 'Progresso Médio por Categoria',
  className,
}: OverallProgressChartProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      <LineChart
        data={MOCK_DATA}
        lines={LINES}
        title={title}
        yAxisLabel="Progresso (%)"
        showLegend={true}
      />
    </div>
  )
}
