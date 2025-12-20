import { PageHeader } from '@/components/layouts/page-header'
import { ItemsByCategoryChart } from '@/components/features/dashboard/ItemsByCategoryChart'
import { ItemsByStatusChart } from '@/components/features/dashboard/ItemsByStatusChart'
import { TopItemsToComplete } from '@/components/features/dashboard/TopItemsToComplete'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Bem-vindo ao Sabiu! Aqui você acompanha seu progresso de aprendizado."
      />

      {/* Dashboard Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Items by Category Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Itens por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ItemsByCategoryChart title="" />
            </div>
          </CardContent>
        </Card>

        {/* Items by Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Itens por Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ItemsByStatusChart title="" />
            </div>
          </CardContent>
        </Card>

        {/* Top Items to Complete */}
        <Card>
          <CardHeader>
            <CardTitle>Próximos a Concluir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <TopItemsToComplete title="" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
