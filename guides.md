# Projeto — Motor Inteligente de Otimização de Escalas

## 1. Visão da ideia

Criar uma plataforma brasileira de **geração e otimização de escalas** capaz de atender diferentes nichos que possuem problemas complexos de alocação de pessoas, horários, recursos e restrições.

A ideia central não é simplesmente criar um sistema que "monte uma escala".

O produto deve possuir um **motor matemático de otimização** capaz de:

- receber pessoas, recursos, horários, disponibilidades e regras;
- transformar essas informações em um problema de otimização;
- encontrar soluções válidas;
- gerar **múltiplas alternativas de escala**;
- comparar as alternativas segundo diferentes objetivos;
- explicar os principais motivos pelos quais uma solução foi escolhida;
- permitir que cada nicho possua regras específicas sem precisar reescrever o motor principal.

O conceito é construir primeiro um **Scale Engine / Optimization Engine** genérico e, sobre ele, criar módulos verticais.

---

# 2. Problema que quero resolver

Hoje muitas empresas ainda fazem escalas utilizando:

- Excel;
- Google Sheets;
- sistemas muito específicos;
- regras manuais;
- tentativa e erro;
- WhatsApp para ajustes;
- sistemas que encontram apenas uma solução.

Em operações mais complexas, o problema cresce rapidamente.

Exemplos:

- muitos funcionários;
- múltiplos turnos;
- folgas;
- disponibilidade individual;
- carga horária;
- legislação;
- cobertura mínima;
- competências;
- locais diferentes;
- conflitos entre pessoas;
- preferências;
- custos;
- horas extras;
- necessidade de equilíbrio.

Uma alteração aparentemente simples pode obrigar o gestor a refazer grande parte da escala.

A proposta é transformar esse processo em um **problema de otimização computacional**.

---

# 3. Visão de produto

O usuário fornece:

```text
Pessoas
Recursos
Horários
Turnos
Disponibilidades
Demandas
Restrições
Preferências
Objetivos
```

O sistema transforma isso em um modelo matemático e procura soluções.

Exemplo:

```text
48 funcionários
7 dias
3 turnos
5 regras obrigatórias
12 preferências
demanda mínima por turno
```

Resultado:

```text
Solução A
Solução B
Solução C
Solução D
...
```

Cada solução pode ter características diferentes.

---

# 4. O grande diferencial: múltiplas soluções

O sistema não deve pensar apenas:

> "Existe uma escala válida?"

Ele deve pensar:

> "Quais são as melhores escalas possíveis considerando diferentes objetivos?"

Exemplo:

## Solução A — Econômica

- menor custo;
- menor quantidade de horas extras;
- cobertura atendida.

## Solução B — Funcionários

- melhor distribuição de finais de semana;
- melhor distribuição de noites;
- maior respeito às preferências.

## Solução C — Operacional

- melhor cobertura;
- menos trocas;
- maior estabilidade da equipe.

## Solução D — Equilibrada

Combinação ponderada dos objetivos.

O usuário pode escolher qual solução deseja utilizar.

---

# 5. Arquitetura conceitual

A plataforma deve ser construída em camadas.

```text
                    SCALE ENGINE
                         │
        ┌────────────────┼────────────────┐
        │                │                │
    Modelagem         Solver          Avaliação
        │                │                │
    Pessoas          Otimização       Score
    Turnos           Restrições       Métricas
    Recursos         Objetivos        Comparação
    Regras           Busca            Explicação
                         │
                         ▼
                  MÚLTIPLAS SOLUÇÕES
                         │
          ┌──────────────┼──────────────┐
          │              │              │
       Educação        Varejo         Saúde
          │              │              │
       Escolas          Lojas        Hospitais
```

O **core matemático não deve conhecer detalhes específicos de cada nicho**.

O nicho deve fornecer:

- entidades;
- regras;
- restrições;
- objetivos;
- parâmetros.

---

# 6. Nichos possíveis

A plataforma poderá futuramente atender:

### Educação

- escolas;
- universidades;
- cursos;
- professores;
- salas;
- disciplinas;
- turmas.

Problema conhecido como **timetabling**.

### Empresas

- equipes;
- turnos;
- folgas;
- jornadas;
- disponibilidade;
- cobertura.

### Varejo

- funcionários;
- lojas;
- horários de pico;
- cargos;
- cobertura mínima.

### Saúde

- médicos;
- enfermeiros;
- plantões;
- especialidades;
- cobertura mínima;
- descanso.

### Hotelaria

- recepção;
- limpeza;
- cozinha;
- manutenção;
- cobertura por horário.

### Segurança

- postos;
- vigilantes;
- turnos;
- qualificações;
- cobertura.

### Indústria

- operadores;
- máquinas;
- turnos;
- competências;
- produção.

### Aviação

Possível no futuro, mas muito mais complexo:

- pilotos;
- copilotos;
- comissários;
- aeronaves;
- voos;
- bases;
- qualificações;
- descanso;
- legislação.

---

# 7. Como a matemática entra no produto

O coração do projeto será **Otimização Combinatória / Programação Matemática / Constraint Programming**.

Não devemos começar tentando construir apenas regras `if/else`.

Precisamos modelar o problema matematicamente.

---

# 8. Variáveis de decisão

Um modelo simples pode possuir uma variável binária:

```text
x[pessoa][dia][turno]
```

Onde:

```text
x = 1 → pessoa trabalha naquele turno
x = 0 → pessoa não trabalha
```

Exemplo:

```text
x[joao][segunda][manha] = 1
```

significa que João está escalado na segunda-feira de manhã.

---

# 9. Restrições obrigatórias

As restrições obrigatórias são regras que **não podem ser quebradas**.

Exemplos:

### Disponibilidade

Se João não pode trabalhar domingo:

```text
x[joao][domingo][qualquer_turno] = 0
```

### Cobertura mínima

Se um turno precisa de pelo menos 5 pessoas:

```text
Σ x[pessoa][dia][turno] >= 5
```

### Máximo de dias consecutivos

Não permitir mais que 6 dias consecutivos de trabalho.

### Descanso mínimo

Garantir um intervalo mínimo entre jornadas.

### Limite de horas

```text
horas_trabalhadas <= limite
```

### Qualificação

Uma determinada função pode exigir que pelo menos uma pessoa com determinada competência esteja presente.

---

# 10. Restrições "soft"

Nem todas as regras precisam ser obrigatórias.

Algumas podem ser preferências.

Exemplos:

- João prefere trabalhar de manhã;
- Maria prefere não trabalhar domingo;
- evitar muitas noites consecutivas;
- tentar distribuir finais de semana;
- tentar evitar janelas;
- tentar manter determinada equipe junta.

Essas regras podem receber **penalidades**.

Exemplo:

```text
preferência não atendida = +10 pontos de penalidade
```

O solver tenta minimizar a penalidade.

Isso é fundamental para permitir soluções diferentes.

---

# 11. Função objetivo

Uma função objetivo pode combinar diversos fatores:

```text
MINIMIZAR:

custo
+ horas_extras
+ penalidades_de_preferência
+ desequilíbrio
+ trocas
+ violações_soft
```

Cada fator pode possuir um peso.

Exemplo:

```text
custo = 0.7
satisfação = 0.5
cobertura = 1.0
preferências = 0.6
```

Esses pesos poderão gerar soluções diferentes.

---

# 12. Hard constraints vs Soft constraints

O sistema deve separar claramente:

## Hard constraints

Nunca podem ser violadas.

Exemplo:

```text
funcionário indisponível
```

## Soft constraints

Podem ser violadas, mas geram penalidade.

Exemplo:

```text
funcionário prefere não trabalhar domingo
```

Essa separação será uma parte fundamental da arquitetura.

---

# 13. Multi-objective optimization

Uma característica importante do produto será permitir múltiplos objetivos.

Exemplo:

```text
Objetivo:
reduzir custo
+
aumentar satisfação
+
reduzir horas extras
+
melhorar cobertura
```

Existem diferentes estratégias possíveis:

### Weighted Sum

```text
score =
(custo * peso_custo)
+
(horas_extra * peso_horas)
+
(insatisfação * peso_satisfação)
```

### Pareto Optimization

Em uma etapa futura, o sistema pode encontrar soluções que representam diferentes compromissos entre objetivos.

Exemplo:

```text
        Satisfação
             ↑
             │       ● B
             │
       ● C   │
             │
             │               ● A
             └────────────────────→
                       Custo
```

Isso permitiria apresentar ao usuário soluções com diferentes trade-offs.

---

# 14. O conceito de "score"

Cada escala deve possuir métricas.

Exemplo:

```text
Cobertura:             100%
Horas extras:          12h
Custo estimado:        R$ 18.420
Satisfação estimada:   91%
Finais de semana:      equilibrados
Violações hard:        0
Penalidades soft:      14
```

Não devemos transformar isso inicialmente em um "nota única" sem contexto.

O sistema deve preservar as métricas individuais para que o usuário entenda o trade-off.

---

# 15. Explicabilidade

O sistema deve explicar a solução.

Exemplo:

> Esta solução foi escolhida porque mantém 100% da cobertura, reduz horas extras em 18% e distribui os finais de semana de maneira mais equilibrada.

Também deve explicar quando não consegue encontrar solução:

> Não foi possível gerar uma escala válida com as regras atuais.

E informar possíveis conflitos:

```text
Problema:
Turno 22h–06h exige 4 funcionários.

Disponibilidade atual:
3 funcionários.

Sugestão:
- reduzir cobertura para 3;
- aumentar disponibilidade;
- adicionar funcionário;
- permitir determinada exceção.
```

---

# 16. Geração de várias soluções

Não basta executar o solver uma vez.

Uma abordagem inicial:

1. encontrar solução ótima;
2. armazenar solução;
3. adicionar restrição para impedir solução idêntica;
4. executar novamente;
5. armazenar nova solução;
6. repetir.

Outra possibilidade é variar pesos da função objetivo.

Exemplo:

```text
Execução 1:
custo = 1.0
satisfação = 0.2

Execução 2:
custo = 0.5
satisfação = 0.8

Execução 3:
custo = 0.2
satisfação = 1.0
```

Isso pode produzir alternativas significativamente diferentes.

---

# 17. Primeiro MVP

Não tentar construir todos os nichos inicialmente.

O primeiro MVP deve provar o motor.

Sugestão:

## MVP 1 — Escala genérica

Entidades:

```text
Employee
Shift
Day
Availability
Rule
Requirement
Schedule
```

Funcionalidades:

- cadastrar funcionários;
- cadastrar turnos;
- cadastrar dias;
- definir disponibilidade;
- definir demanda mínima;
- criar regras;
- gerar escala;
- gerar múltiplas alternativas;
- comparar alternativas;
- exportar escala.

---

# 18. Primeiro nicho recomendado para validação

Educação pode ser um primeiro laboratório porque possui um problema matemático muito claro:

```text
Professor
Turma
Disciplina
Sala
Dia
Horário
```

Exemplo:

```text
Professor A
Matemática
Turma 7A
Segunda
08:00
```

Restrições:

- professor não pode estar em duas turmas ao mesmo tempo;
- turma não pode ter duas disciplinas no mesmo horário;
- sala não pode ser utilizada por duas turmas;
- professor possui disponibilidade;
- disciplina possui carga horária;
- algumas disciplinas podem ter regras de distribuição;
- tentar minimizar janelas dos professores.

Depois que o motor estiver funcionando, o mesmo core poderá ser abstraído.

---

# 19. Stack inicial sugerida

## Backend / Optimization

Python.

Motivos:

- excelente ecossistema para otimização;
- OR-Tools;
- Pyomo;
- PuLP;
- SciPy;
- integração fácil com APIs.

Uma primeira avaliação deve comparar principalmente:

### Google OR-Tools

Possibilidades:

- CP-SAT;
- Constraint Programming;
- Integer Programming;
- scheduling.

É provavelmente uma das primeiras tecnologias que devemos testar no MVP.

---

# 20. API

O motor deve ser separado da interface.

Exemplo:

```http
POST /api/optimization/schedule
```

Entrada conceitual:

```json
{
  "employees": [],
  "shifts": [],
  "availability": [],
  "requirements": [],
  "constraints": [],
  "objectives": []
}
```

Resposta:

```json
{
  "solutions": [
    {
      "id": "solution-1",
      "metrics": {},
      "schedule": []
    },
    {
      "id": "solution-2",
      "metrics": {},
      "schedule": []
    }
  ]
}
```

---

# 21. Frontend

Pode utilizar:

- React;
- Vite;
- Tailwind;
- TypeScript.

A interface deve permitir que o usuário modele o problema sem precisar entender matemática.

O usuário não deve escrever:

```text
x[i][j][k]
```

Ele deve simplesmente configurar:

> "Preciso de no mínimo 4 pessoas nesse turno."

O sistema converte isso para o modelo matemático.

---

# 22. Arquitetura importante

Separar:

```text
DOMAIN
    ↓
CONSTRAINTS
    ↓
OPTIMIZATION MODEL
    ↓
SOLVER
    ↓
SOLUTIONS
    ↓
SCORING
    ↓
API
    ↓
FRONTEND
```

O solver não deve ficar acoplado ao frontend.

Também não devemos colocar regras específicas de escola diretamente no core.

---

# 23. Conceito de plugin por nicho

No futuro:

```text
/core
    optimizer
    constraints
    objectives
    scoring

/modules
    /education
    /retail
    /healthcare
    /hospitality
    /security
    /industry
```

Cada módulo implementa suas próprias entidades e regras.

Exemplo:

```text
education:
    Teacher
    Class
    Subject
    Room

retail:
    Employee
    Store
    Position
    Shift

healthcare:
    Doctor
    Specialty
    Unit
    Shift
```

Mas todos utilizam o mesmo motor.

---

# 24. Modelo de negócio futuro

Possíveis formatos:

### SaaS por empresa

Mensalidade baseada em:

- quantidade de funcionários;
- quantidade de escalas;
- número de unidades;
- complexidade do problema.

### SaaS por nicho

Exemplo:

```text
Scale Education
Scale Retail
Scale Health
Scale Hospitality
```

### API de otimização

Empresas que já possuem seus próprios sistemas podem consumir o motor:

```text
Sistema do cliente
       ↓
Optimization API
       ↓
Scale Engine
       ↓
Soluções
```

Essa possibilidade pode ser particularmente importante.

---

# 25. Diferencial estratégico

A plataforma não deve tentar ser apenas:

> "mais um software de escala."

A visão é:

> **Uma infraestrutura de otimização de alocação de pessoas e recursos, adaptável a diferentes setores.**

O produto final pode ser composto por:

```text
Motor matemático
+
Framework de restrições
+
Framework de objetivos
+
Gerador de múltiplas soluções
+
Comparação de cenários
+
Explicabilidade
+
Produtos verticais
```

---

# 26. O que NÃO fazer inicialmente

Evitar:

- tentar atender 10 nichos;
- construir app mobile;
- implementar folha de pagamento;
- tentar substituir sistemas completos de RH;
- construir dezenas de integrações;
- criar um algoritmo próprio antes de testar solvers existentes;
- focar primeiro em design visual;
- criar uma arquitetura excessivamente complexa.

O objetivo inicial é provar:

> **Consigo transformar um conjunto real de regras em um problema matemático e gerar boas escalas automaticamente?**

---

# 27. Primeira prova de conceito

Criar um dataset pequeno:

```text
20 funcionários
7 dias
3 turnos
5 regras hard
5 regras soft
```

Gerar:

```text
10 soluções
```

E apresentar:

| Solução | Custo | Horas Extras | Satisfação | Cobertura |
|---|---:|---:|---:|---:|
| A | 18.420 | 12h | 88% | 100% |
| B | 18.700 | 8h | 92% | 100% |
| C | 19.100 | 4h | 96% | 100% |

Os valores acima são apenas ilustrativos.

O objetivo do POC é validar o conceito.

---

# 28. Roadmap inicial

## Fase 1 — Pesquisa

- estudar workforce scheduling;
- estudar timetabling;
- estudar constraint programming;
- estudar OR-Tools CP-SAT;
- estudar programação inteira;
- estudar multi-objective optimization;
- analisar softwares brasileiros existentes.

## Fase 2 — Solver

Criar um modelo simples de escala.

## Fase 3 — Restrições

Implementar hard constraints.

## Fase 4 — Soft constraints

Implementar penalidades e preferências.

## Fase 5 — Múltiplas soluções

Implementar geração e comparação de alternativas.

## Fase 6 — API

Criar serviço independente de otimização.

## Fase 7 — Interface

Criar painel para configuração e visualização.

## Fase 8 — Primeiro vertical

Escolher um nicho e criar regras específicas.

---

# 29. Primeira tarefa para o Claude Code

Antes de sair escrevendo toda a aplicação, o Claude Code deve:

1. analisar este documento;
2. propor uma arquitetura inicial;
3. pesquisar/avaliar OR-Tools CP-SAT e alternativas;
4. criar um pequeno POC matemático;
5. usar dados fictícios;
6. gerar pelo menos 5 soluções diferentes;
7. medir as soluções;
8. demonstrar os trade-offs;
9. só depois propor a arquitetura completa do produto.

A prioridade inicial é **validar o motor matemático**, não construir uma interface bonita.

---

# 30. Princípio central do projeto

> **Não construir um sistema que simplesmente monta escalas.**
>
> Construir um sistema capaz de **explorar o espaço de soluções**, respeitar restrições, otimizar diferentes objetivos e apresentar ao usuário alternativas explicáveis.

Essa é a hipótese central que deve orientar o desenvolvimento.
