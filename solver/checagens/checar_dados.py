from numpy import zeros, where, array, insert
from pandas import pivot_table, Series
from pulp import LpProblem, LpVariable, LpBinary, lpSum, LpMaximize, LpStatus, PULP_CBC_CMD
from itertools import product

def checa_problemas_um(configuracoes):

    """
    Checa se há professores com disponibilidades insuficientes para suas atribuições

    :param configuracoes: dicionario com as configurações do problema
    :return: lista com os problemas encontrados
    """
    dica = """
    Erro de preenchimento do tipo 1:
    Há professor(es) cuja a disponibilidade não é suficiente para suas atribuições!
    """

    problemas = []
    for professor in configuracoes["professores"].values():
        disponibilidades_oferecidas = configuracoes["df_disponibilidades"].loc[configuracoes["df_disponibilidades"]["professor"] == professor, 
                                                                               configuracoes["dias"].values()].values.sum()
        atribuicoes = 0
        turmas_prof = configuracoes["professores_turmas_materias"][professor].keys()
        for turma_prof in turmas_prof:
            materias_prof_turma = configuracoes["professores_turmas_materias"][professor][turma_prof]
            for materia_prof in materias_prof_turma:
                atribuicoes += configuracoes["aulas_minimas_semanais"][materia_prof][turma_prof]
            
        if disponibilidades_oferecidas < atribuicoes:
            problemas.append(f"""O professor {professor} disponibilizou {disponibilidades_oferecidas} horários, 
                                mas tem {atribuicoes} aulas atribuídas.""")
            
            

    return problemas, dica

def checa_problemas_dois(configuracoes):

    """
    Checa se os professores de cada turma preenchem a semana inteira de aulas

    :param configuracoes: dicionario com as configurações do problema
    :return: lista com os problemas encontrados
    """

    dica = """
    Erro de preenchimento do tipo 2:
    Existe algum dia/momento sem professor disponível para uma turma ou algum professor não deu nenhuma disponibilidade.
    """

    problemas = []
    for nm_turma in configuracoes["turmas"].values():
        professores_turma = \
        [professor for professor in configuracoes["professores"].values() 
         if nm_turma in configuracoes["professores_turmas_materias"][professor].keys()]

        disponibilidades_todos_profs = zeros((configuracoes["C"], configuracoes["D"]), dtype=int)
        for professor in professores_turma:
            disponibilidade = configuracoes["df_disponibilidades"].loc[configuracoes["df_disponibilidades"]["professor"] == professor, 
                                                                       configuracoes["dias"].values()].values
            
            if disponibilidade.size == 0:
                problemas.append(f"Professor {professor} não tem disponibilidade cadastrada")
                continue
            
            try:
                disponibilidades_todos_profs += disponibilidade
            except ValueError:
                problemas.append(f"""Professor {professor} deve ter suas disponibilidades cadastradas com
                                 quantidade de dias e momentos diferentes do que foi especificado nas
                                 telas de 'Dias' e 'Momentos'.""")
            
        posicoes_zeros = where(disponibilidades_todos_profs == 0)
        for indice_momento, indice_dia in zip(*posicoes_zeros):
            nm_dia = configuracoes["dias"][indice_dia]
            nm_momento = configuracoes["momentos"][indice_momento]

            if configuracoes["dict_disponibilidades_aulas"][nm_turma].loc[nm_momento, nm_dia] == 1:
                problemas.append(f"A Turma {nm_turma} não tem professor para o dia {nm_dia} no momento {nm_momento}")

    return problemas, dica

def checa_problemas_tres(configuracoes):

    """
    1) Checa se há alguma turma sem professor para alguma matéria
    2) Checa se há alguma turma com mais professores do que matérias
    3) Checa se há alguma matéria que não é ministrada por algum professor de uma turma

    :param configuracoes: dicionario com as configurações do problema
    :return: lista com os problemas encontrados
    """

    dica = """
    Erro de preenchimento do tipo 3:
    """

    problemas = []
    for nm_turma in configuracoes["turmas"].values():
        materias_turma = [nm_materia for nm_materia in configuracoes["materias"].values() 
                            if configuracoes["aulas_minimas_semanais"][nm_materia][nm_turma] > 0]
        
        professores_turma = [nm_professor for nm_professor in configuracoes["professores"].values() 
                                if nm_turma in configuracoes["professores_turmas_materias"][nm_professor].keys()]
        
        if len(professores_turma) > len(materias_turma):
            problemas.append(f"Turma {nm_turma} tem mais professores ({len(professores_turma)}) do que materias ({len(materias_turma)})." \
                             "Alguma matéria está sendo ministrada simultenamente por mais de um professor para esta turma.")
        
        for nm_professor in professores_turma:
            materias_professor_turma = configuracoes["professores_turmas_materias"][nm_professor][nm_turma]

            for nm_materia in materias_professor_turma:
                try:
                    materias_turma.remove(nm_materia)
                except ValueError:
                    problemas.append(f"""Verifique se existe mais de um professor cadastrado para ministrar a 
                                         matéria {nm_materia} na turma {nm_turma}.""")
        
        if len(materias_turma) > 0:
            problemas.append(f"A Turma {nm_turma} não tem professor cadastrado para a(s) materia(s) {materias_turma}")
    
    return problemas, dica

def checa_problemas_quatro(configuracoes):

    """
    Checa se um determinado dia e horário existem, pelo menos, (C * D) professores para tentar atender a demanda

    :param configuracoes: dicionario com as configurações do problema
    :return: lista com os problemas encontrados
    """

    dica = """Erro de preenchimento do tipo 4:"
              Os dias e momentos com mais professores disponiveis são:"""

    df_disponibilidades_pivot = pivot_table(configuracoes["df_disponibilidades"], 
                                            index=["professor"], columns=["momento"], values=configuracoes["dias"].values(), aggfunc="sum")
    df_disponibilidades_pivot = \
        df_disponibilidades_pivot.loc[:, 
                    sorted(df_disponibilidades_pivot.columns, key=lambda par: list(configuracoes["dias"].values()).index(par[0]))]

    qtd_insuficiente_profs_momento_dia = df_disponibilidades_pivot.values.sum(axis=0) < configuracoes["B"]

    ranking_disponibilidades = sorted(zip(df_disponibilidades_pivot.columns, df_disponibilidades_pivot.values.sum(axis=0)), key=lambda par: par[1], reverse=True)
    for momento_dia, qtd_profs in ranking_disponibilidades[:5]:
        nm_momento, nm_dia = momento_dia

        dica += f"\n{nm_dia} {nm_momento} possui {qtd_profs} professores disponíveis"

    colunas_problema = [coluna for i, coluna in enumerate(df_disponibilidades_pivot.columns) if qtd_insuficiente_profs_momento_dia[i]]

    records = df_disponibilidades_pivot[colunas_problema].sum(axis=0).to_frame().reset_index().rename(columns={"level_0": "dia", 0: "soma"}).to_dict(orient="records")
    
    problemas = []
    for record in records:
        for nm_turma in configuracoes["turmas"].values():
            if configuracoes["dict_disponibilidades_aulas"][nm_turma].loc[record["momento"], record["dia"]] == 0:
                break
        else:
            problemas.append(f"O momento {record['momento']} do dia {record['dia']} tem apenas {record['soma']} professores disponiveis.")

    return problemas, dica

def checa_problemas_cinco(configuracoes):

    """
    Checa se o número de aulas mínimas por semana está correto para todas as matérias de cada série

    :param configuracoes: dicionario com as configurações do problema
    :return: lista com os problemas encontrados
    """

    dica = """
    Erro de preenchimento do tipo 5:
    Faça a checagem das matérias atribuídas às turmas e certificando-se que a quantidade de aulas mínimas semanais seja igual ao total
    de aulas semanais da turma
    """

    problemas = []
    for nm_turma in configuracoes["turmas"].values():
        soma_aulas = 0
        for nm_materia in configuracoes["materias"].values():
            soma_aulas += configuracoes["aulas_minimas_semanais"][nm_materia][nm_turma]

        qtd_aulas_nao_permitidas = (1 - configuracoes["dict_disponibilidades_aulas"][nm_turma].values).sum()
        if soma_aulas != configuracoes["C"] * configuracoes["D"] - qtd_aulas_nao_permitidas:
            problemas.append(f"""O número de aulas mínimas semanais ({soma_aulas}) para a turma {nm_turma} é diferente da quantidade
                             de aulas semanais da turma ({configuracoes['C'] * configuracoes['D'] - qtd_aulas_nao_permitidas})""")
    
    return problemas, dica


def checa_problemas_seis(configuracoes):

    """
    Função que checa se algum professor não tem disponibilidade suficiente para suas atribuições 
    com apenas duas aulas por dia e por turma. Foi necessário rodar um modelo para cada professor
    pois não foi encontrada uma lógica para resolver o problema de forma direta.

    Args:
    configuracoes (dict): dicionário com as configurações do problema

    Returns:
    problemas (list): lista com os problemas encontrados
    """

    dica = """
    Erro de preenchimentos do tipo 6:
    Algum(uns) professor(es) não tem disponibilidade suficiente para suas atribuições
    """
    
    b, a, d, c = range(configuracoes['B']), range(1), range(configuracoes['D']), range(configuracoes['C'])
    comb = [str(x) for x in product(b, a, d, c)]

    problemas = []
    for nm_professor in configuracoes["professores"].values():
        
        prob = LpProblem(name=f"Creative_Planner_{nm_professor.replace(' ', '_')}", sense=LpMaximize)
        vars_ = LpVariable.dicts(name="H", indices=comb, cat=LpBinary)
        prob += lpSum([vars_[c] for c in comb]), "Função_Objetivo_H"

        # -------------------------------------------------------------------------------------------------------------------------------------
        
        rest = 0
        x = 0
        # o 'for' abaixo realiza a variação na vertical
        for i, ba in enumerate(product(b, a)):
            ba_ = array(ba)

            indice_turma = ba_[0]

            nm_turma = configuracoes['turmas'][indice_turma]
            
            # se o professor não pode dar aula na turma, pula para a próxima combinação de turma (b) e professor (a)
            if nm_turma not in configuracoes['professores_turmas_materias'][nm_professor].keys():
                continue

            ks = []
            # o 'for' abaixo realiza a variação na horizontal
            for j, dc in enumerate(product(d, c)):
                dc_ = array(dc)
                k = insert(ba_, 2, dc_)
                ks.append(k)
            
            nm_materias_professor = configuracoes['professores_turmas_materias'][nm_professor][nm_turma]

            min_aulas_semana_professor = 0
            for nm_materia_professor in nm_materias_professor:
                min_aulas_semana_professor += configuracoes['aulas_minimas_semanais'][nm_materia_professor][nm_turma]

            prob += lpSum([vars_[str(tuple(k))] for k in ks]) >= min_aulas_semana_professor, f"{rest:02}_{x:03}"
            x += 1

        rest += 1
        # -------------------------------------------------------------------------------------------------------------------------------------

        # -------------------------------------------------------------------------------------------------------------------------------------
        x = 0
        # o 'for' abaixo realiza a variação na vertical
        for i, bad in enumerate(product(b, a, d)):
            bad_ = array(bad)

            indice_turma = bad_[0]

            nm_turma = configuracoes['turmas'][indice_turma]
            
            # se o professor não pode dar aula na turma, pula para a próxima combinação de turma (b) e professor (a)
            if nm_turma not in configuracoes['professores_turmas_materias'][nm_professor].keys():
                continue

            ks = []
            # o 'for' abaixo realiza a variação na horizontal
            for j, c_ in enumerate(c):
                k = insert(bad_, 3, c_)
                ks.append(k)
            
            aulas_maximas = configuracoes["aulas_maximas_diarias"][nm_professor][nm_turma]
            prob += lpSum([vars_[str(tuple(k))] for k in ks]) <= aulas_maximas, f"{rest:02}_{x:03}" # f"{rest:02}_{2 * x:03}"
            x += 1
        
        rest += 1
        # -------------------------------------------------------------------------------------------------------------------------------------

        # -------------------------------------------------------------------------------------------------------------------------------------

        x = 0
        # o 'for' abaixo realiza a variação na vertical
        for i, ba in enumerate(product(b, a)):

            ba_ = array(ba)

            indice_turma = ba_[0]

            nm_turma = configuracoes['turmas'][indice_turma]

            # se o professor não dá aula na turma, pula para a próxima combinação de turma (b) e professor (a)
            if nm_turma not in configuracoes['professores_turmas_materias'][nm_professor].keys():
                continue

            df_possibilidades = configuracoes['df_disponibilidades'].loc[
                configuracoes['df_disponibilidades']["professor"] == nm_professor, 
                configuracoes['dias'].values()].values
            
            posicoes = where(df_possibilidades == 0)

            for indice_momento, indice_dia in zip(*posicoes):
                prob += vars_[str((indice_turma, 0, indice_dia, indice_momento))] == 0, f"{rest:02}_{x:03d}"
                x += 1

        # -------------------------------------------------------------------------------------------------------------------------------------

        prob.solve(PULP_CBC_CMD(msg=False))

        if LpStatus[prob.status] == "Infeasible":
            problemas.append(f"""O professor {nm_professor} não tem disponibilidades suficientes para suas atribuições
                             com apenas {aulas_maximas} aulas máximas por dia e por turma. É necessário aumentar a 
                             disponibilidade em outros dias da semana ou aumentar a quantidade de aulas máximas diárias.""")
        del prob
    
    return problemas, dica

def checa_problemas_sete(configs):
    """
    Checa se há problemas com a configuração para o cronogrid
    """

    dica = """
    Erro de preenchimento do tipo 7:
    
    A quantidade de aulas máximas diárias e a quantidade de aulas mínimas semanais de algum(uns)
    professor(es) não está(ão) de acordo com a carga horária semanal da(s) matéria(s) que ele(s).

    A quantidade de aulas máximas diárias do professor vezes a quantidade de dias de aula por 
    semana deve ser maior ou igual a quantidade de aulas mínimas semanais.
    """

    problemas = []
    for nm_professor in configs["professores_turmas_materias"]:
        for nm_turma in configs["professores_turmas_materias"][nm_professor]:
            aulas_minimas_semanais_professor = 0
            for nm_materia in configs["professores_turmas_materias"][nm_professor][nm_turma]:
                
                aulas_minimas_semanais_professor += \
                    configs["aulas_minimas_semanais"][nm_materia][nm_turma]
                

            qtd_dias_disponibilizados = \
                (configs["df_disponibilidades"][configs["df_disponibilidades"]["professor"] == nm_professor][configs["dias"].values()].
                    sum(axis=0) > 0).sum()
            
            aulas_maximas_diarias_professor = configs["aulas_maximas_diarias"][nm_professor][nm_turma]
            if aulas_maximas_diarias_professor * qtd_dias_disponibilizados < aulas_minimas_semanais_professor:
                problemas.append(f"""
                                 O Professor {nm_professor} possui {aulas_maximas_diarias_professor} aula(s) máxima(s) diária(s),
                                 e {qtd_dias_disponibilizados} dia(s) disponibilizado(s), porém, a quantidade de aulas semanais
                                 na turma {nm_turma}, é de {aulas_minimas_semanais_professor} aulas semanais.
                                 """)
                continue
    
    return problemas, dica

def checa_problemas_oito(configs):
    """
    Checa se há problemas com a configuração para o cronogrid
    """

    dica = \
"""
Erro de preenchimento do tipo 8:

Existem duplicações nos campos de texto preenchidos.
"""

    problemas = []

    contagem_turmas = Series(configs["turmas"]).value_counts()
    contagem_turmas_duplicadas = contagem_turmas[contagem_turmas > 1]
    for nm_turma in contagem_turmas_duplicadas.index:
        problemas.append(f"""A turma {nm_turma} foi cadastrada 
                         {contagem_turmas_duplicadas[nm_turma]} vezes. Não é permitido repetições
                         nos nomes das turmas.""")
    
    contagem_momentos = Series(configs["momentos"]).value_counts()
    contagem_momentos_duplicados = contagem_momentos[contagem_momentos > 1]
    for nm_momento in contagem_momentos_duplicados.index:
        problemas.append(f"""O momento {nm_momento} foi cadastrado 
                         {contagem_momentos_duplicados[nm_momento]} vezes. Não é permitido repetições
                         nos nomes dos momentos.""")
        
    contagem_dias = Series(configs["dias"]).value_counts()
    contagem_dias_duplicados = contagem_dias[contagem_dias > 1]
    for nm_dia in contagem_dias_duplicados.index:
        problemas.append(f"""O dia {nm_dia} foi cadastrado 
                         {contagem_dias_duplicados[nm_dia]} vezes. Não é permitido repetições
                         nos nomes dos dias.""")
    
    contagem_materias = Series(configs["materias"]).value_counts()
    contagem_materias_duplicadas = contagem_materias[contagem_materias > 1]
    for nm_materia in contagem_materias_duplicadas.index:
        problemas.append(f"""A matéria {nm_materia} foi cadastrada 
                         {contagem_materias_duplicadas[nm_materia]} vezes. Não é permitido repetições
                         nos nomes das matérias.""")

    contagem_professores = Series(configs["professores"]).value_counts()
    contagem_professores_duplicados = contagem_professores[contagem_professores > 1]
    for nm_professor in contagem_professores_duplicados.index:
        problemas.append(f"""O professor {nm_professor} foi cadastrado 
                         {contagem_professores_duplicados[nm_professor]} vezes. Não é permitido repetições
                         nos nomes dos professores.""")
            
    return problemas, dica