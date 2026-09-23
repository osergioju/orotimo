import pulp as plp
from numpy import array, insert, where
from itertools import product
from utils.utils import gera_triplas


def restricao_um(prob, a, b, c, d, vars_, rest):

    """
    Restrição 1: Cada professor deve dar aula em apenas uma turma por dia.

    Argumentos:
    prob -- instancia do objeto LpProblem (pulp)
    a -- objeto range dos professores
    b -- objeto range das turmas
    c -- objeto range dos dias
    d -- objeto range dos momentos
    vars_ -- variáveis do problema no formato de dicionário (pulp)
    rest -- índice da restrição
    """

    # o 'for' abaixo realiza a variação na vertical
    for i, bdc in enumerate(product(b, d, c)):
        cdb_ = array(bdc)

        ks = []
        # o 'for' abaixo realiza a variação na horizontal
        for a_ in a:
            k = insert(cdb_, 1, a_)
            ks.append(k)
        
        prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) <= 1, f"{rest:02}_{i:03}"

def restricao_dois(prob, a, b, c, d, vars_, professores_turmas_materias, professores, turmas, rest):

    """
    Restrição 2: Cada matéria deve ser dada em apenas uma turma por dia.

    Argumentos:
    prob -- instancia do objeto LpProblem (pulp)
    a -- objeto range dos professores
    b -- objeto range das turmas
    c -- objeto range dos dias
    d -- objeto range dos momentos
    vars_ -- variáveis do problema no formato de dicionário (pulp)
    professores_turmas_materias -- dicionário com as matérias que cada professor pode dar em cada turma
    lista_professores -- lista com os nomes dos professores
    turmas -- dicionário com os indices das turmas (chaves) e os nomes das turmas (valores)
    rest -- índice da restrição
    """

    x = 0
    # o 'for' abaixo realiza a variação na vertical
    for i, adc in enumerate(product(a, d, c)):

        adc_ = array(adc)

        indice_professor = adc_[0]
        nm_professor = professores[indice_professor]

        nm_turmas_professor = professores_turmas_materias[nm_professor].keys()
        indices_turmas_professor = [list(turmas.values()).index(nm_turma) for nm_turma in nm_turmas_professor]

        ks = []
        # o 'for' abaixo realiza a variação na horizontal
        for b_ in indices_turmas_professor:
            k = insert(adc_, 0, b_)
            ks.append(k)
            
        prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) <= 1, f"{rest:02}_{x:03}"
        x += 1

def restricao_tres(prob, a, b, c, d, vars_, min_aulas_semana, professores_turmas_materias, professores, turmas, rest):

    """
    Restrição 3: Cada professor deve dar um número mínimo de aulas por semana.

    Argumentos:
    prob -- instancia do objeto LpProblem (pulp)
    a -- objeto range dos professores
    b -- objeto range das turmas
    c -- objeto range dos dias
    d -- objeto range dos momentos
    vars_ -- variáveis do problema no formato de dicionário (pulp)
    min_aulas_semana -- dicionário com o número mínimo de aulas por semana de cada matéria em cada turma
    professores -- dicionario com os indices dos professores (chaves) e os nomes dos professores (valores)
    turmas -- dicionário com os indices das turmas (chaves) e os nomes das turmas (valores)
    professores_turmas_materias -- dicionário com as matérias que cada professor pode dar em cada turma
    rest -- índice da restrição
    """
    
    x = 0
    # o 'for' abaixo realiza a variação na vertical
    for i, ba in enumerate(product(b, a)):
        ba_ = array(ba)

        indice_turma, indice_professor = ba_

        nm_professor = professores[indice_professor]
        nm_turma = turmas[indice_turma]
        
        # se o professor não pode dar aula na turma, pula para a próxima combinação de turma (b) e professor (a)
        if nm_turma not in professores_turmas_materias[nm_professor].keys():
            continue

        ks = []
        # o 'for' abaixo realiza a variação na horizontal
        for j, dc in enumerate(product(d, c)):
            dc_ = array(dc)
            k = insert(ba_, 2, dc_)
            ks.append(k)

        nm_materias_professor = professores_turmas_materias[nm_professor][nm_turma]

        min_aulas_semana_professor = 0
        for nm_materia_professor in nm_materias_professor:
            min_aulas_semana_professor += min_aulas_semana[nm_materia_professor][nm_turma]

        prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) >= min_aulas_semana_professor, f"{rest:02}_{x:03}"
        x += 1

def restricao_quatro(prob, a, b, c, d, vars_, max_aulas_dia, professores_turmas_materias, professores, turmas, rest):

    """
    Restrição 4: Cada professor deve dar um número mínimo e máximo de aulas por dia.

    Argumentos:
    prob -- instancia do objeto LpProblem (pulp)
    a -- objeto range dos professores
    b -- objeto range das turmas
    c -- objeto range dos dias
    d -- objeto range dos momentos
    vars_ -- variáveis do problema no formato de dicionário (pulp)
    professores_turmas_materias -- dicionário com as matérias que cada professor pode dar em cada turma
    min_max_aulas_dia -- dicionário com o número mínimo e máximo de aulas por dia de cada matéria em cada turma
    professores -- dicionario com os indices dos professores (chaves) e os nomes dos professores (valores)
    turmas -- dicionário com os indices das turmas (chaves) e os nomes das turmas (valores)
    rest -- índice da restrição
    """

    x = 0
    # o 'for' abaixo realiza a variação na vertical
    for i, bad in enumerate(product(b, a, d)):
        bad_ = array(bad)

        indice_turma, indice_professor, indice_dia = bad_

        nm_professor = professores[indice_professor]
        nm_turma = turmas[indice_turma]
        
        # se o professor não pode dar aula na turma, pula para a próxima combinação de turma (b) e professor (a)
        if nm_turma not in professores_turmas_materias[nm_professor].keys():
            continue

        ks = []
        # o 'for' abaixo realiza a variação na horizontal
        for j, c_ in enumerate(c):
            k = insert(bad_, 3, c_)
            ks.append(k)
        
        # materias_professor = [nm_materia for nm_materia in professores_turmas_materias[nm_professor][nm_turma]]
        # qtd_max_aulas_dia_prof = 0
        # for nm_materia in materias_professor:
        #     qtd_max_aulas_dia_prof += min_max_aulas_dia[nm_materia][nm_turma]

        # prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) >= 0, f"{rest:02}_{2 * x + 1:03}"
        # prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) <= qtd_max_aulas_dia_prof, f"{rest:02}_{x:03}" # f"{rest:02}_{2 * x:03}"
        qtd_max = max_aulas_dia[nm_professor][nm_turma]
        prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) <= qtd_max, f"{rest:02}_{x:03}.0" # f"{rest:02}_{2 * x:03}"

        if qtd_max > 2:
            triplas_ks = gera_triplas(ks)
            for z, tripla_ks in enumerate(triplas_ks, 1):
                lista_somar = [vars_[str(tuple(k))] for k in tripla_ks]
                prob += plp.lpSum(lista_somar) <= 2, f"{rest:02}_{x:03}.{z}"

        x += 1

def restricao_cinco(prob, a, b, vars_, df_disponibilidade_professores, professores_turmas_materias, 
                    professores, turmas, dias, rest):

    """
    Restrição 5: Cada professor deve dar aula apenas nos momentos que ele está disponível.

    Argumentos:
    prob -- instancia do objeto LpProblem (pulp)
    a -- objeto range dos professores
    b -- objeto range das turmas
    vars_ -- variáveis do problema no formato de dicionário (pulp)
    df_disponibilidade_professores -- dataframe com a disponibilidade dos professores com as colunas (professor, dia e momentos) com valores zero ou um
    professores -- dicionario com os indices dos professores (chaves) e os nomes dos professores (valores)
    turmas -- dicionário com os indices das turmas (chaves) e os nomes das turmas (valores)
    lista_momentos -- lista com os momentos
    professores_turmas_materias -- dicionário com as matérias que cada professor pode dar em cada turma
    rest -- índice da restrição
    """

    x = 0
    # o 'for' abaixo realiza a variação na vertical
    for i, ba in enumerate(product(b, a)):

        ba_ = array(ba)

        indice_turma, indice_professor = ba_

        nm_professor = professores[indice_professor]
        nm_turma = turmas[indice_turma]

        # se o professor não dá aula na turma, pula para a próxima combinação de turma (b) e professor (a)
        if nm_turma not in professores_turmas_materias[nm_professor].keys():
            continue

        df_possibilidades = df_disponibilidade_professores.loc[df_disponibilidade_professores["professor"] == nm_professor, 
                                                            dias.values()].values
        posicoes = where(df_possibilidades == 0)

        # for indice_dia, indice_momento in zip(*posicoes):
        for indice_momento, indice_dia in zip(*posicoes):
            prob += vars_[str((indice_turma, indice_professor, indice_dia, indice_momento))] == 0, f"{rest:02}_{x:03d}"
            x += 1

def restricao_seis(prob, vars_, a, b, c, d, turmas, dias, momentos, dict_disponibilidades_aulas, rest):

    """
    Restrição 6: Garantir que alguma turma que não possa ter aula num determinado dia e momento não tenha aula nesse dia e momento.

    Argumentos:
    prob -- instancia do objeto LpProblem (pulp)
    vars_ -- variáveis do problema no formato de dicionário (pulp)
    a -- objeto range dos professores
    b -- objeto range das turmas
    c -- objeto range dos dias
    d -- objeto range dos momentos
    dias -- dicionário com os indices dos dias (chaves) e os nomes dos dias (valores)
    momentos -- dicionário com os indices dos momentos (chaves) e os nomes dos momentos (valores)
    dict_disponibilidades_aulas -- dicionario de dataframes com a disponibilidade das turmas com as colunas em dias e 
        indices em momentos com valores zero ou um para cada turma
    rest -- índice da restrição
    """

    x = 0
    for i, dc in enumerate(product(d, c)):
        dc_ = array(dc)

        indice_dia, indice_momento = dc_
        nm_dia, nm_momento = dias[indice_dia], momentos[indice_momento]

        for indice_turma in b:

            nm_turma = turmas[indice_turma]

            if dict_disponibilidades_aulas[nm_turma].loc[nm_momento, nm_dia] == 0:
                ks = []
                for indice_professor in a:
                    k = insert(dc_, 0, indice_turma)
                    k = insert(k, 1, indice_professor)
                    ks.append(k)

                # print(ks)
                prob += plp.lpSum([vars_[str(tuple(k))] for k in ks]) == 0, f"{rest:02}_{x:03d}"
                x += 1