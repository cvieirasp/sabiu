'use client'

import { Clock, BookOpen, Video, GraduationCap, Monitor } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface RecentItem {
  id: string
  title: string
  category: string
  categoryType: 'E-Learning' | 'YouTube' | 'Book' | 'MBA'
  progress: number
  viewedAt: string
}

// Mock data - will be replaced with real API data later
const MOCK_DATA: RecentItem[] = [
  {
    id: '1',
    title: 'Advanced TypeScript Patterns',
    category: 'E-Learning',
    categoryType: 'E-Learning',
    progress: 67,
    viewedAt: '2 horas atrás',
  },
  {
    id: '2',
    title: 'Clean Code Principles',
    category: 'Book',
    categoryType: 'Book',
    progress: 45,
    viewedAt: 'Ontem',
  },
  {
    id: '3',
    title: 'System Design Interview',
    category: 'YouTube',
    categoryType: 'YouTube',
    progress: 23,
    viewedAt: 'Há 3 dias',
  },
]

const CATEGORY_CONFIGS = {
  'E-Learning': {
    Icon: Monitor,
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
    color: '#3B82F6',
  },
  YouTube: {
    Icon: Video,
    bgColor: 'bg-red-500/10',
    iconColor: 'text-red-500',
    color: '#FF5733',
  },
  Book: {
    Icon: BookOpen,
    bgColor: 'bg-green-500/10',
    iconColor: 'text-green-500',
    color: '#10B981',
  },
  MBA: {
    Icon: GraduationCap,
    bgColor: 'bg-amber-500/10',
    iconColor: 'text-amber-500',
    color: '#F59E0B',
  },
}

interface RecentlyViewedItemsProps {
  title?: string
  className?: string
}

export function RecentlyViewedItems({
  title = 'Vistos Recentemente',
  className,
}: RecentlyViewedItemsProps) {
  return (
    <div className={`h-full w-full ${className || ''}`}>
      {title && <h3 className="text-lg font-semibold mb-4">{title}</h3>}

      <div className="space-y-3">
        {MOCK_DATA.map((item) => {
          const config = CATEGORY_CONFIGS[item.categoryType]
          const { Icon, bgColor, iconColor, color } = config

          return (
            <div
              key={item.id}
              className="group relative flex items-start gap-3 p-4 rounded-lg border border-border hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
            >
              {/* Category Icon */}
              <div
                className={`shrink-0 w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center group-hover:scale-110 transition-transform`}
              >
                <Icon className={`w-6 h-6 ${iconColor}`} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                {/* Title and Time */}
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                    {item.title}
                  </h4>
                </div>

                {/* Category and Timestamp */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium" style={{ color }}>
                    {item.category}
                  </span>
                  <span className="text-xs text-muted-foreground">•</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    <span>{item.viewedAt}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                  <Progress value={item.progress} className="h-1.5 flex-1" />
                  <span className="text-xs font-medium text-muted-foreground shrink-0">
                    {item.progress}%
                  </span>
                </div>
              </div>

              {/* Hover Indicator */}
              <div className="absolute top-0 left-0 w-1 h-full rounded-l-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ backgroundColor: color }} />
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {MOCK_DATA.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center p-6">
          <Clock className="w-12 h-12 text-muted-foreground mb-3" />
          <p className="text-sm text-muted-foreground">
            Nenhum item visualizado recentemente
          </p>
        </div>
      )}
    </div>
  )
}
