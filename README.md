# Scale Engine

Plataforma de geração e otimização de escalas. Produto completo de ponta a ponta: autenticação
real, o módulo de Escolas (Professores, Turmas, Disciplinas, Salas, Horários, Regras,
Disponibilidade, Atribuições) e o fluxo de Escalas — incluindo o solver de otimização (MILP via
PuLP/CBC), que roda como um processo Python separado (`/solver`) acionado pelo backend Node a
cada "Gerar escala".

## Estrutura

```text
/frontend   React + TypeScript + Vite + Tailwind + React Router
/backend    Node.js + TypeScript + Express + Prisma/PostgreSQL
/solver     Motor de otimização (Python/PuLP) — venv versionado, acionado via subprocess pelo backend
/documentos Referência do sistema antigo (apenas para entender o fluxo, não o layout)
guides.md   Visão de produto do Scale Engine (motor de otimização)
```

O frontend não possui regras de negócio; toda a lógica vive no backend, em
`backend/src/{routes,controllers,services,repositories,models}`.

## Banco de dados

Tudo é persistido em **PostgreSQL** via **Prisma** (`backend/prisma/schema.prisma`): usuários
(com senha com hash), sistemas/permissões, escolas, professores, turmas, disciplinas, salas,
horários (momentos), regras, disponibilidade (de professores e de turmas) e escalas.

Toda rota de escola/professor/turma/etc. exige login (JWT) **e** verifica que o usuário logado
é o dono da escola — um token válido de outra conta recebe 403, não vê dados de escolas alheias.

## Como rodar

Requer Node.js 20+ e Docker (para o Postgres local).

```bash
# 1. Sobe o Postgres (porta 5433, não conflita com um Postgres local na 5432)
npm run db:up

# 2. Instala as dependências
npm install

# 3. Configura o backend (uma vez, ou quando o schema mudar)
cp backend/.env.example backend/.env
npm run db:migrate   # aplica as migrations
npm run db:seed      # popula dados de demonstração

# 4. Roda tudo
npm run dev
```

Isso sobe simultaneamente:

- Backend em `http://localhost:4000` (API em `/api`)
- Frontend em `http://localhost:5173`

Login: `junior@crtcomunicacao.com.br` (ou `joao@escola.com` / `maria@escola.com`) com a senha
**`escala123`** (já pré-preenchida na tela de login). Como o login agora emite um JWT de
verdade, **é preciso logar de novo** sempre que o banco for resetado/re-seedado (os IDs mudam).

### Rodando separadamente

```bash
npm run dev:backend
npm run dev:frontend
```

### Scripts úteis (raiz do repo)

```bash
npm run db:up        # sobe o container do Postgres
npm run db:down      # derruba o container (mantém o volume/dados)
npm run db:migrate   # cria/aplica uma nova migration a partir do schema.prisma
npm run db:seed      # reseta e repopula os dados de demonstração
npm run db:studio    # abre o Prisma Studio (GUI pra inspecionar o banco)
```

### Pool de conexões

A `DATABASE_URL` aceita `connection_limit` e `pool_timeout` como query params — ajuste
conforme a carga observada (não existe um valor "correto" sem medir; o padrão do Prisma
é `num_cpus * 2 + 1`). Ver `backend/.env.example`.

### Variáveis de ambiente

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

`JWT_SECRET` já vem preenchido no `.env` de exemplo para facilitar — gere o seu para qualquer
ambiente que não seja sua própria máquina:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Fluxo navegável

```text
Login → Escalas (modelo de negócio) → Escola → Minhas escolas → Dashboard da escola
  → Cadastros (Professores/Turmas/Disciplinas/Salas)
  → Configurações (Horários/Disponibilidade de professores/Disponibilidade de turmas/Regras/Atribuições)
  → Escalas (Minhas escalas / Nova escala — wizard completo, roda o solver de verdade)
```

Também existe uma área `/admin` (Admin Master) com Usuários, Sistemas, Permissões e Escolas.

## Como o solver é acionado

1. Em Configurações → Atribuições, defina qual professor dá qual disciplina em qual turma
   (aulas/semana e máximo/dia).
2. No wizard de Nova escala, a etapa "Gerar" chama `POST /schedules/:id/generate`.
3. O backend monta o payload (`backend/src/services/solverPayload.service.ts`) a partir do
   Postgres, grava um JSON temporário e roda `solver/venv/bin/python3 solver/bridge.py` como
   subprocesso.
4. O bridge reconstrói as estruturas (DataFrames) que o modelo MILP legado espera, roda as
   checagens de pré-validação e o solver (PuLP/CBC), e devolve um JSON com a(s) grade(s)
   encontrada(s) ou as mensagens de erro.
5. O resultado é persistido em `ScheduleSolution` e exibido na página da escala.

Só entram no solver professores/turmas que têm ao menos uma atribuição — sem isso, o backend
recusa a geração com uma mensagem clara.
