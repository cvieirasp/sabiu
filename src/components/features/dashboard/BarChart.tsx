'use client'

import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'

export interface BarChartData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface BarChartProps {
  data: BarChartData[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
}

export function BarChart({
  data,
  title,
  xAxisLabel,
  yAxisLabel,
}: BarChartProps) {
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            angle={-45}
            textAnchor="end"
            height={60}
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -5, dy: 10 }
                : undefined
            }
            tick={{ fill: 'var(--foreground)', fontSize: 14 }}
            className="text-xs"
          />
          <YAxis
            label={
              yAxisLabel
                ? { value: yAxisLabel, angle: -90, position: 'insideLeft' }
                : undefined
            }
            tick={{ fill: 'var(--foreground)', fontSize: 14 }}
            className="text-xs"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
            itemStyle={{
              color: 'var(--foreground)',
            }}
            cursor={{ fill: 'var(--muted)', opacity: 0.2 }}
          />
          <Bar dataKey="value" radius={[8, 8, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}
