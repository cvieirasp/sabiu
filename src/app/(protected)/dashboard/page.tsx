import { PageHeader } from '@/components/layouts/page-header'

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-8 space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Bem-vindo ao Sabiu! Aqui você acompanha seu progresso de aprendizado."
      />

      {/* Dashboard content will be added here */}
      <div className="mt-6">
        {/* Placeholder for future dashboard content */}
      </div>
    </div>
  )
}
