import { EmptyState } from '../../../components/ui'

interface ConfiguracaoEmptyPageProps {
  title: string
  icon: string
  description: string
}

export function ConfiguracaoEmptyPage({ title, icon, description }: ConfiguracaoEmptyPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <EmptyState icon={icon} title="Configuração em preparação" description={description} />
    </div>
  )
}
