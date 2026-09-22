import { Button, EmptyState } from '../../../components/ui'

interface CadastroEmptyPageProps {
  title: string
  icon: string
  actionLabel: string
}

export function CadastroEmptyPage({ title, icon, actionLabel }: CadastroEmptyPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
      <EmptyState
        icon={icon}
        title={`Nenhum registro em ${title.toLowerCase()}`}
        description="Os cadastros desta área serão implementados na próxima etapa do produto."
        action={<Button disabled>{actionLabel}</Button>}
      />
    </div>
  )
}
