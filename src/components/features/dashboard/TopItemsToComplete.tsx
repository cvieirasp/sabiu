'use client'

import { Progress } from '@/components/ui/progress'
import { Trophy, Medal, Award } from 'lucide-react'

interface TopItem {
  id: string
  title: string
  progress: number
  category: string
}

// Mock data - will be replaced with real API data later
const MOCK_DATA: TopItem[] = [
  {
    id: '1',
    title: 'React Advanced Patterns',
    progress: 85,
    category: 'E-Learning',
  },
  {
    id: '2',
    title: 'TypeScript Deep Dive',
    progress: 78,
    category: 'Book',
  },
  {
    id: '3',
    title: 'Next.js Performance Optimization',
    progress: 72,
    category: 'YouTube',
  },
]

interface TopItemsToCompleteProps {
  title?: string
  className?: string
}

const RANK_ICONS = [
  { Icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  { Icon: Medal, color: 'text-slate-400', bgColor: 'bg-slate-400/10' },
  { Icon: Award, color: 'text-amber-600', bgColor: 'bg-amber-600/10' },
]

export function TopItemsToComplete({
  title = 'Próximos a Concluir',
  className,
}: TopItemsToCompleteProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="space-y-4">
        {MOCK_DATA.map((item, index) => {
          const { Icon, color, bgColor } = RANK_ICONS[index]

          return (
            <div
              key={item.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
            >
              {/* Rank Icon */}
              <div className={`shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-medium text-sm line-clamp-1">{item.title}</h4>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {item.progress}%
                  </span>
                </div>

                <p className="text-xs text-muted-foreground mb-2">{item.category}</p>

                {/* Progress Bar */}
                <Progress value={item.progress} className="h-2" />
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {MOCK_DATA.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Award className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum item em andamento
          </p>
        </div>
      )}
    </div>
  )
}
