'use client'

import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'

export interface LineChartDataPoint {
  name: string
  [key: string]: string | number
}

export interface LineConfig {
  dataKey: string
  color: string
  name: string
}

interface LineChartProps {
  data: LineChartDataPoint[]
  lines: LineConfig[]
  title?: string
  xAxisLabel?: string
  yAxisLabel?: string
  showLegend?: boolean
}

export function LineChart({
  data,
  lines,
  title,
  xAxisLabel,
  yAxisLabel,
  showLegend = true,
}: LineChartProps) {
  return (
    <div className="w-full h-full">
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="name"
            label={
              xAxisLabel
                ? { value: xAxisLabel, position: 'insideBottom', offset: -5 }
                : undefined
            }
            tick={{ fill: 'var(--foreground)', fontSize: 12 }}
            className="text-xs"
          />
          <YAxis
            domain={[0, 100]}
            label={
              yAxisLabel
                ? {
                    value: yAxisLabel,
                    angle: -90,
                    position: 'insideLeft',
                    style: { textAnchor: 'middle' },
                  }
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
            cursor={{ stroke: 'var(--muted)', strokeWidth: 2, strokeDasharray: '5 5' }}
          />
          {showLegend && (
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
          )}
          {lines.map((line) => (
            <Line
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey}
              name={line.name}
              stroke={line.color}
              strokeWidth={3}
              dot={{ fill: line.color, r: 4 }}
              activeDot={{ r: 6 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  )
}
