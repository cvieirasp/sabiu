'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  PieLabelRenderProps
} from 'recharts'

export interface DonutChartData {
  name: string
  value: number
  color: string
  [key: string]: string | number
}

interface DonutChartProps {
  data: DonutChartData[]
  title?: string
  innerRadius?: number
  outerRadius?: number
}

export function DonutChart({
  data,
  title,
  innerRadius = 60,
  outerRadius = 80,
}: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const renderCustomLabel = (props: PieLabelRenderProps) => {
    const { cx, cy } = props

    if (typeof cx !== 'number' || typeof cy !== 'number') {
      return null
    }

    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-foreground"
      >
        <tspan x={cx} dy="-0.5em" className="text-2xl font-bold">
          {total}
        </tspan>
        <tspan x={cx} dy="1.5em" className="text-sm text-muted-foreground">
          Total
        </tspan>
      </text>
    )
  }

  return (
    <div className="w-full h-full">
      {title && (
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={2}
            dataKey="value"
            label={renderCustomLabel}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '6px',
            }}
            itemStyle={{
              color: 'var(--foreground)',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-foreground">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
