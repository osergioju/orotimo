from copy import deepcopy
from pandas import DataFrame
from numpy import where


def gerar_turmas_df(prob, professores, turmas, momentos, dias):

    turmas_df = {turma: DataFrame(data=[], columns=dias.values(), index=momentos.values()) for turma in turmas.values()}
    for v in prob.variables():

        if v.varValue <= 0:
            continue

        name = v.name
        name = [int(letra) for letra in name.replace("H_", "").replace(",_", ", ").replace("(", "").replace(")", "").split(",")]

        indice_professor = name[1]
        nm_professor = professores[indice_professor]
        
        indice_turma = name[0]
        nm_turma = turmas[indice_turma]

        indice_horario = name[3]
        nm_horario = momentos[indice_horario]

        indice_dia = name[2]
        nm_dia = dias[indice_dia]

        turmas_df[nm_turma].loc[nm_horario, nm_dia] = nm_professor
    
    return turmas_df

def formata_turmas_df(turmas_df, professores_turmas_materias, aulas_minimas_semanais, momentos, dias):

    turmas_df_formatado_escola = deepcopy(turmas_df)
    for nm_turma in turmas_df_formatado_escola:

        professores = set(turmas_df_formatado_escola[nm_turma].values.ravel())
        for nm_professor in professores:

            try:
                nm_materias_professor = professores_turmas_materias[nm_professor][nm_turma]
            except KeyError:
                continue
            
            qtd_aulas_dia_materia = {}
            materias_inserir = []
            for nm_materia in nm_materias_professor:
                materias_inserir += [nm_materia] * int(aulas_minimas_semanais[nm_materia][nm_turma])

                qtd_aulas_dia_materia.update({nm_materia: {nm_dia: 0 for nm_dia in dias.values()}})
            
            posicoes = where(turmas_df_formatado_escola[nm_turma] == nm_professor)

            for indice_momento, indice_dia in zip(*posicoes):

                nm_momento = momentos[indice_momento]
                nm_dia = dias[indice_dia]

                if qtd_aulas_dia_materia[materias_inserir[0]][nm_dia] < 2:
                    materia_inserir = materias_inserir[0]
                else:
                    materia_inserir = materias_inserir[-1]
                
                qtd_aulas_dia_materia[materia_inserir][nm_dia] += 1

                turmas_df_formatado_escola[nm_turma].loc[nm_momento, nm_dia] = f"{materia_inserir} | {nm_professor}"
                materias_inserir.remove(materia_inserir)
        
        turmas_df_formatado_escola[nm_turma].fillna("-", inplace=True)
    
    return turmas_df_formatado_escola

def gera_visualizacao_professores(professores, dias, momentos, turmas_df, 
                                  professores_turmas_materias, aulas_minimas_semanais):
    
    visualizacoes_professores = {prof: DataFrame(data=[], columns=dias.values(), 
                                        index=momentos.values()) for prof in professores.values()}

    for nm_professor in professores.values():
        for turma_prof in professores_turmas_materias[nm_professor].keys():

            materias_prof = professores_turmas_materias[nm_professor][turma_prof]
            materias_prof_semana = []
            for materia in materias_prof:
                qtd_aulas = aulas_minimas_semanais[materia][turma_prof]
                materias_prof_semana += [materia] * int(qtd_aulas)
            
            id_momentos, id_dias =  where(turmas_df[turma_prof].values == nm_professor)

            for i, (id_momento, id_dia) in enumerate(zip(id_momentos, id_dias)):
                nm_momento = momentos[id_momento]
                nm_dia = dias[id_dia]

                visualizacoes_professores[nm_professor].loc[nm_momento, nm_dia] = f"{turma_prof} | {materias_prof_semana[i]}"
        
        visualizacoes_professores[nm_professor].fillna("-", inplace=True)
    
    return visualizacoes_professores

def gera_visualizacao_janelas(professores, turmas, dias, momentos, turmas_df, turmas_df_formatado_escola):
    dados = []
    for nm_professor in professores.values():
        for nm_turma in turmas.values():
            for nm_dia in dias.values():
                posicoes = where(turmas_df[nm_turma][[nm_dia]].values == nm_professor)
                for indice_momento, indice_dia in zip(*posicoes):
                    nm_momento = momentos[indice_momento]
                    nm_materia = turmas_df_formatado_escola[nm_turma].loc[nm_momento, nm_dia]

                    # o momento precisa ser formatado para medir janelas posteriormente (contar_janelas)
                    nm_momento_formatado = f"aula {indice_momento + 1}"

                    # dados.append([nm_professor, nm_materia, nm_turma, nm_dia, nm_momento])
                    dados.append([nm_professor, nm_materia, nm_turma, nm_dia, nm_momento, nm_momento_formatado])
    
    df_visualizacao_professores = DataFrame(data=dados, columns=["professor", "materia/professor", "turma", "dia", "momento", "momento_formatado"])
    df_visualizacao_professores.sort_values(by=["dia", "momento_formatado", "materia/professor"], inplace=True)
    df_visualizacao_professores.reset_index(drop=True, inplace=True)

    return df_visualizacao_professores

