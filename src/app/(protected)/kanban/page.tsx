import { PageHeader } from '@/components/layouts/page-header'
import { KanbanBoard } from '@/components/features/kanban/KanbanBoard'

export default function KanbanPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Kanban"
        subtitle="Organize seus itens de aprendizado visualmente em colunas por status."
      />

      <KanbanBoard />
    </div>
  )
}
