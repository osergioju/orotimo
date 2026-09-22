# Scale Engine

Plataforma de geração e otimização de escalas. Este repositório contém a **primeira etapa**
do produto: estrutura navegável, autenticação, seleção de sistemas, administração básica e o
módulo de Escolas — tudo com dados mockados. O motor matemático de otimização (solver) e as
regras complexas de escala **ainda não foram implementados** (ver `guides.md`).

## Estrutura

```text
/frontend   React + TypeScript + Vite + Tailwind + React Router
/backend    Node.js + TypeScript + Express (endpoints mockados)
/documentos Referência do sistema antigo (apenas para entender o fluxo, não o layout)
guides.md   Visão de produto do Scale Engine (motor de otimização)
```

O frontend não possui regras de negócio; toda a "lógica" (ainda mockada) vive no backend,
em `backend/src/{routes,controllers,services,repositories,models}`.

## Como rodar

Requer Node.js 20+.

```bash
npm install
npm run dev
```

Isso sobe simultaneamente:

- Backend em `http://localhost:4000` (API em `/api`)
- Frontend em `http://localhost:5173`

Use qualquer e-mail da lista de usuários mockados (ex.: `junior@crtcomunicacao.com.br`) e
qualquer senha — a autenticação é mockada nesta etapa, mas já preparada para JWT.

### Rodando separadamente

```bash
npm run dev:backend
npm run dev:frontend
```

### Variáveis de ambiente

Copie os arquivos de exemplo se quiser customizar portas/URLs:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

## Fluxo navegável desta etapa

```text
Login → Seleção de sistema → Escalas → Escola → Minhas escolas
  → Dashboard da escola → Cadastros / Configurações / Escalas → Nova escala (wizard)
```

Também existe uma área `/admin` (Admin Master) com Usuários, Sistemas, Permissões e Escolas.

## Próxima etapa

Modelagem definitiva do PostgreSQL, entidades reais, regras escolares, cadastros completos,
solver de otimização (OR-Tools CP-SAT ou similar), múltiplas soluções e autenticação/permissões
reais — ver `guides.md`.
