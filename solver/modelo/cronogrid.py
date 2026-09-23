from pandas import DataFrame
from itertools import product
from pulp import (LpProblem, LpVariable, 
                  lpSum,
                  LpMaximize, LpBinary, get_solver, LpStatus)
from numpy import array, linspace
from pickle import dump
from restricoes.restricoes import (restricao_um, restricao_dois, restricao_tres, 
                                   restricao_quatro,restricao_cinco, restricao_seis,)

from formatacoes.formatacoes import gerar_turmas_df, formata_turmas_df, gera_visualizacao_janelas, gera_visualizacao_professores
from utils.transforma_configs import transforma_configuracoes
from datetime import datetime
from solvers import nm_solvers
from utils.connector import Connector
from tabulate import tabulate
from utils.utils import contar_janelas

def cronogrid(configuracoes):

    """
    Função que roda o modelo do cronogrid.

    Argumentos:
    configuracoes -- dicionário com as informações de insumo do modelo
        A -- número de professores
        B -- número de turmas
        C -- número de dias
        D -- número de momentos
        turmas -- dicionário com os indices das turmas (chaves) e os nomes das turmas (valores)
        professores -- dicionário com os indices dos professores (chaves) e os nomes dos professores (valores)
        dias -- dicionário com os indices dos dias (chaves) e os nomes dos dias (valores)
        momentos -- dicionário com os indices dos momentos (chaves) e os nomes dos momentos (valores)
        materias -- dicionário com os indices das materias (chaves) e os nomes das materias (valores)
        aulas_minimas_semanais -- dicionário com o número mínimo de aulas semanais de cada matéria e turma (serie/turma)
        professores_turmas_materias -- dicionário com as matérias que cada professor pode dar em cada turma
        df_disponibilidades -- dataframe com as disponibilidades de cada professor em cada dia e momento preenchiadas com 1 ou 0
    """
    
    # a sequencia b, a, d, c permite que a sequencia das variáveis facilite a criação dos coeficientes para aumentar as dobradinhas (aulas geminadas)
    b, a, d, c = range(configuracoes["B"]), range(configuracoes["A"]), range(configuracoes["D"]), range(configuracoes["C"])
    comb = [str(x) for x in product(b, a, d, c)]

    # gerando os coeficientes das variáveis conforme a preferência das materias
    opcoes = [array([x for x in range(1, configuracoes["C"] + 1, 1)]), 
              array([x for x in range(configuracoes["C"], 0, -1)])
            ]

    opcoes_dias = linspace(1, 1000, configuracoes["D"]).round(decimals=0)
    
    coefss = []
    for opcao in opcoes:
        coefs = []
        for _, com in enumerate(comb):

            indice_turma = int(com.split(",")[0].replace("(", "").replace(")", ""))
            indice_dia = int(com.split(",")[2].replace("(", "").replace(")", ""))
            indice_professor = int(com.split(",")[1].replace("(", "").replace(")", ""))
            indice_momento = int(com.split(",")[3].replace("(", "").replace(")", ""))

            nm_turma = configuracoes["turmas"][indice_turma]
            nm_professor = configuracoes["professores"][indice_professor]

            if nm_turma in configuracoes["professores_turmas_materias"][nm_professor].keys():
                nm_materias = configuracoes["professores_turmas_materias"][nm_professor][nm_turma]
            else:
                coefs.append(0)
                continue
            
            media = 0
            for nm_materia in nm_materias:
                nota_preferencia = configuracoes["preferencias_materia"][nm_materia]
                media += nota_preferencia
            
            media /= len(nm_materias)

            # nota de preferência (prioridade) do professor para minizar suas janelas
            preferencia_professor = configuracoes["preferencias_professor"][nm_professor]

            # a opção_final serve para deixar as preferencias mais no meio do dia
            # a media serve para dar mais peso para determinadas materias. do contrario, todas as materias teriam a mesma preferencia
            # e não haverá o efeito de dobradinhas
            opcao_final = preferencia_professor * media * opcao * opcoes_dias[indice_dia]

            # os coeficientes fazem com que o modelo prefira soluções com mais aulas geminadas
            coefs.append(opcao_final[indice_momento])
        coefss.append(coefs)

    solucoes = []
    for i, coefs in enumerate(coefss):
        # criando o objeto do problema
        prob = LpProblem(name="Creative_Planner", sense=LpMaximize)

        # criando as variáveis
        vars_ = LpVariable.dicts(name="H", indices=comb, cat=LpBinary)

        # criando a função objetivo
        prob += lpSum([coefs[i] * vars_[h] for i, h in enumerate(comb)]), "Função Objetivo H".replace(" ", "_")

        # print(configuracoes)

        restricoes = [
        {
            "desc": "Uma turma não pode ser usada por mais de um professor ao mesmo tempo e dia",
            "letras_vertical": ["b", "c", "d"],
            "letras_horizontal": ["a"],
            "argumentos": [prob, a, b, c, d, vars_],
            "callable": restricao_um,
            "active": True,
        },
        {
            "desc": "Uma matéria não pode ser dada em mais de uma turma ao mesmo tempo e dia",
            "letras_vertical": ["a", "c", "d"],
            "letras_horizontal": ["b"],
            "argumentos": [prob, a, b, c, d, vars_, configuracoes["professores_turmas_materias"], 
                        configuracoes["professores"], configuracoes["turmas"]],
            "callable": restricao_dois,
            "active": True,
        },
        {
            "desc": "Cada professor deve ministrar um número mínimo de aulas por semana por turma",
            "letras_vertical": ["a", "b"],
            "letras_horizontal": ["c", "d"],
            "argumentos": [prob, a, b, c, d, vars_, configuracoes["aulas_minimas_semanais"], configuracoes["professores_turmas_materias"],
                        configuracoes["professores"], configuracoes["turmas"]],
            "callable": restricao_tres,
            "active": True,
        },
        {
            "desc": "Cada professor só pode ministrar até duas (ou mais ou menos) aulas por dia numa mesma turma",
            "letras_vertical": ["a", "b", "d"],
            "letras_horizontal": ["c"],
            "argumentos": [prob, a, b, c, d, vars_, configuracoes["aulas_maximas_diarias"], configuracoes["professores_turmas_materias"], 
                        configuracoes["professores"], configuracoes["turmas"]],
            "callable": restricao_quatro,
            "active": True,
        },
        {
            "desc": "Restrições pessoais do professor para todas as suas turmas e matérias",
            "letras_vertical": [],
            "letras_horizontal": [],
            "argumentos": [prob, a, b, vars_, configuracoes["df_disponibilidades"], configuracoes["professores_turmas_materias"], 
                        configuracoes["professores"], configuracoes["turmas"], configuracoes["dias"]],
            "callable": restricao_cinco,
            "active": True,
        },
        {
            "desc": "Restrições organizacionais da escola para barrar aulas em determinados dias e momentos",
            "letras_vertical": ["d", "c"],
            "letras_horizontal": ["b", "a"],
            "argumentos": [prob, vars_, a, b, c, d, configuracoes["turmas"],
                           configuracoes["dias"], configuracoes["momentos"],
                           configuracoes["dict_disponibilidades_aulas"]],
            "callable": restricao_seis,
            "active": True,
        },
        ]

        # aplicando as restrições
        for rest, restricao in enumerate(restricoes):
            if restricao["active"]:
                print(f"Aplicando restrição {rest:02d}: {restricao['desc']}")
                restricao["callable"](*restricao["argumentos"], rest)
            else:
                print(f"Restrição {rest:02d}: {restricao['desc']} não aplicada")
        
        # solvers disponiveis DELL Casa Igor ['GLPK_CMD' (não está funcionando), 'GUROBI_CMD', 'PULP_CBC_CMD', 'COIN_CMD']
        for j, nm_solver in enumerate(nm_solvers):

            print("-" * 100)
            print(f"Rodando o solver {nm_solver}")
            
            solver = get_solver(nm_solver)
        
            # resolvendo o problema
            prob.solve(solver=solver)                
            print("Status:", LpStatus[prob.status])

            print(f"Valor da Função Objetivo: {prob.objective.value()}")

            # checando se a solução é ótima
            if LpStatus[prob.status] == "Optimal":

                print(f"Encontrada uma solução ótima com o solver {nm_solver}")

                turmas_df = gerar_turmas_df(prob, configuracoes["professores"], configuracoes["turmas"], 
                                            configuracoes["momentos"], configuracoes["dias"])

                turmas_df_formatado_escola = formata_turmas_df(turmas_df, configuracoes["professores_turmas_materias"], 
                                                             configuracoes["aulas_minimas_semanais"], configuracoes["momentos"], 
                                                             configuracoes["dias"])

                df_visualizacao_janelas = gera_visualizacao_janelas(configuracoes["professores"], configuracoes["turmas"], configuracoes["dias"], 
                                                                            configuracoes["momentos"], turmas_df, turmas_df_formatado_escola)
                
                dict_visualizacao_professores = gera_visualizacao_professores(configuracoes["professores"], 
                                                                            configuracoes["dias"], 
                                                                            configuracoes["momentos"],
                                                                            turmas_df, 
                                                                            configuracoes["professores_turmas_materias"], 
                                                                            configuracoes["aulas_minimas_semanais"])

                visualizacao_escola = []
                for nm_turma in configuracoes["turmas"].values():
                    solucao = turmas_df_formatado_escola[nm_turma]
                    for nm_momento, row in solucao.iterrows():
                        materias = list(row.values)
                        visualizacao_escola.append([nm_turma, nm_momento] + materias)

                df_visualizacao_escola = DataFrame(data=visualizacao_escola, 
                                                   columns=["turma", "momento"] + list(configuracoes["dias"].values()))

                visualizacao_prof = []
                for nm_professor in configuracoes["professores"].values():
                    solucao = dict_visualizacao_professores[nm_professor]
                    for nm_momento, row in solucao.iterrows():
                        aulas = list(row.values)
                        visualizacao_prof.append([nm_professor, nm_momento] + aulas)
                
                df_visualizacao_prof = DataFrame(data=visualizacao_prof, 
                                                 columns=["professor", "momento"] + list(configuracoes["dias"].values()))
                
                df_resumo_janelas = contar_janelas(df_visualizacao_janelas=df_visualizacao_janelas, 
                         dias=configuracoes["dias"], 
                         professores=configuracoes["professores"])

                date_and_time = datetime.now().strftime("%d/%m/%Y %H:%M:%S")
                solucoes.append({"datetime": date_and_time, "df_visualizacao_escola": df_visualizacao_escola, 
                                 "df_visualizacao_professores": df_visualizacao_prof,
                                 "df_visualizacao_janelas": df_visualizacao_janelas,
                                 "df_resumo_janelas": df_resumo_janelas, 
                                 "configuracoes": configuracoes, "prob": prob})
            else:

                print(f"Não foi possível encontrar uma solução ótima com o solver {nm_solver}")
                if i  == len(coefss) - 1 and j == len(nm_solvers) - 1 and len(solucoes) == 0:
                    return LpStatus[prob.status]
            print("-" * 100)
            
    
    return solucoes
