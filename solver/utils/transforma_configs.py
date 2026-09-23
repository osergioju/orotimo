from utils.connector import Connector
from pandas import DataFrame
from tabulate import tabulate

def transforma_configuracoes(id_configuracao: int) -> dict:

    con_class = Connector()

    transformacoes = [transforma_turmas, transforma_momentos, transforma_dias, transforma_materias,
                        transforma_restricoes_materias, transforma_professores, transforma_atribuicoes,
                        formata_disponibilidades_profs, formata_disponibilidade_turmas,
                        informacoes_rodada]
    
    configuracoes = {}
    for transformacao in transformacoes:
        configuracoes = transformacao(con_class, configuracoes, id_configuracao)

    con_class.fechar_conexao()

    return configuracoes

def transforma_turmas(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas = ["Id_Turma", "Nome_Turma", "Id_Configuracao"]
    query = f"SELECT {', '.join(colunas)} FROM Turmas WHERE Id_Configuracao = {id_configuracao}"
    turmas = con_class.executar_query(query)
    turmas = DataFrame(turmas, columns=colunas)
    turmas = {id_turma: nm_turma for id_turma, nm_turma in enumerate(turmas["Nome_Turma"])}
    B = len(turmas)

    configuracoes.update({"turmas": turmas, "B": B})
    return configuracoes

def transforma_momentos(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas = ["Id_Momento", "Id_Configuracao", "Nome_Momento"]
    query = f"SELECT {', '.join(colunas)} FROM Momentos WHERE Id_Configuracao = {id_configuracao}"
    momentos = con_class.executar_query(query)
    momentos = DataFrame(momentos, columns=colunas)
    momentos = {id_momento: nm_momento for id_momento, nm_momento in enumerate(momentos["Nome_Momento"])}
    C = len(momentos)

    configuracoes.update({"momentos": momentos, "C": C})
    return configuracoes

def transforma_dias(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas = ["Id_Dia", "Id_Configuracao", "Nome_Dia"]
    query = f"SELECT {', '.join(colunas)} FROM Dias WHERE Id_Configuracao = {id_configuracao}"
    dias = con_class.executar_query(query)
    dias = DataFrame(dias, columns=colunas)
    dias = {id_dia: nm_dia for id_dia, nm_dia in enumerate(dias["Nome_Dia"])}
    D = len(dias)

    configuracoes.update({"dias": dias, "D": D})
    return configuracoes


def transforma_materias(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas = ["Id_Materia", "Id_Configuracao", "Nome_Materia", "Preferencia"]
    query = f"SELECT {', '.join(colunas)} FROM Materias WHERE Id_Configuracao = {id_configuracao}"
    materias = con_class.executar_query(query)
    materias = DataFrame(materias, columns=colunas)
    preferencias_materia = {nm_materia: preferencia 
                            for nm_materia, preferencia in zip(materias["Nome_Materia"], materias["Preferencia"])}

    materias = {id_materia: nm_materia for id_materia, nm_materia in enumerate(materias["Nome_Materia"])}
    E = len(materias)

    configuracoes.update({"materias": materias, "E": E, "preferencias_materia": preferencias_materia})
    return configuracoes

def transforma_restricoes_materias(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas_materias = ["Id_Materia", "Id_Configuracao", "Nome_Materia"]
    materias = con_class.executar_query(f"""
                                        SELECT {', '.join(colunas_materias)} 
                                        FROM Materias 
                                        WHERE Id_Configuracao = '{id_configuracao}'""")
    df_materias = DataFrame(materias, columns=colunas_materias)

    colunas_turmas = ["Id_Turma", "Id_Configuracao", "Nome_Turma"]
    turmas = con_class.executar_query(f"""
                                        SELECT {', '.join(colunas_turmas)}
                                        FROM Turmas
                                        WHERE Id_Configuracao = '{id_configuracao}'""")
    df_turmas = DataFrame(turmas, columns=colunas_turmas)

    colunas_restricoes_materias = \
        ["Id_Turma", "Id_Materia", "Id_Configuracao", "Qtd_Minima_Semanal", "Qtd_Maxima_Diaria"]
    
    query = f"""SELECT {', '.join(colunas_restricoes_materias)} 
    FROM Restricoes_Materias 
    WHERE Id_Configuracao = {id_configuracao}"""

    restricoes_materias = con_class.executar_query(query)
    df_restricoes_materias = DataFrame(restricoes_materias, columns=colunas_restricoes_materias)

    grouped = df_restricoes_materias.groupby("Id_Materia")

    aulas_minimas_semanais = {}
    aulas_maximas_diarias = {}
    for id_materia, group in grouped:
        # nm_materia = df_materias.loc[df_materias["Id_Materia"] == Id_materia, "Nome_Materia"].values[0]
        nm_materia = df_materias.loc[df_materias["Id_Materia"] == id_materia, "Nome_Materia"].values[0]

        aulas_minimas_semanais[nm_materia] = {}
        aulas_maximas_diarias[nm_materia] = {}
        for _, row in group.iterrows():
            # nm_turma = df_turmas.loc[df_turmas["Id_Turma"] == row["Id_Turma"], "Nome_Turma"].values[0]
            nm_turma = df_turmas.loc[df_turmas["Id_Turma"] == row["Id_Turma"], "Nome_Turma"].values[0]

            aulas_minimas_semanais[nm_materia][nm_turma] = row["Qtd_Minima_Semanal"]
            aulas_maximas_diarias[nm_materia][nm_turma] = row["Qtd_Maxima_Diaria"]
    
    configuracoes.update({"aulas_minimas_semanais": aulas_minimas_semanais, 
                          "aulas_maximas_diarias": aulas_maximas_diarias})

    return configuracoes

def transforma_professores(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas = ["Id_Professor", "Nome_Professor", "Id_Configuracao"]
    query = f"SELECT {', '.join(colunas)} FROM Professores WHERE Id_Configuracao = {id_configuracao}"
    professores = con_class.executar_query(query)
    professores = DataFrame(professores, columns=colunas)
    professores = {id_professor: nm_professor for id_professor, nm_professor in enumerate(professores["Nome_Professor"])}
    A = len(professores)

    configuracoes.update({"professores": professores, "A": A})
    return configuracoes

def transforma_atribuicoes(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:

    colunas_professores = ["Id_Professor", "Nome_Professor", "Id_Configuracao"]
    professores = con_class.executar_query(f"""SELECT {', '.join(colunas_professores)} 
                                           FROM Professores 
                                           WHERE Id_Configuracao = {id_configuracao}""")
    df_professores = DataFrame(professores, columns=colunas_professores)

    # --------------------------------------------------------------------------------------------

    colunas_turmas = ["Id_Turma", "Nome_Turma", "Id_Configuracao"]
    turmas = con_class.executar_query(f"""SELECT {', '.join(colunas_turmas)}
                                        FROM Turmas
                                        WHERE Id_Configuracao = '{id_configuracao}'""")
    df_turmas = DataFrame(turmas, columns=colunas_turmas)

    # --------------------------------------------------------------------------------------------

    colunas_materias = ["Id_Materia", "Nome_Materia", "Id_Configuracao"]
    materias = con_class.executar_query(f"""SELECT {', '.join(colunas_materias)}
                                            FROM Materias
                                            WHERE Id_Configuracao = '{id_configuracao}'""")
    df_materias = DataFrame(materias, columns=colunas_materias)

    # --------------------------------------------------------------------------------------------

    colunas_atribuicoes = ["Id_Atribuicao", "Id_Professor", "Id_Configuracao", "Id_Materia", 
                           "Id_Turma", "Preferencia", "Qnt_Maxima_Diaria"]
    
    query = f"""SELECT {', '.join(colunas_atribuicoes)} 
    FROM Atribuicoes_Professores 
    WHERE Id_Configuracao = {id_configuracao}"""
    
    atribuicoes = con_class.executar_query(query)
    df_atribuicoes = DataFrame(atribuicoes, columns=colunas_atribuicoes)

    professores_turmas_materias = {}
    aulas_maximas_diarias = {}
    grouped_professor = df_atribuicoes.groupby("Id_Professor")
    for id_professor, group_professor in grouped_professor:
        nm_professor = df_professores.loc[df_professores["Id_Professor"] == id_professor, "Nome_Professor"].values[0]
        professores_turmas_materias[nm_professor] = {}
        aulas_maximas_diarias[nm_professor] = {}

        grouped_turma = group_professor.groupby("Id_Turma")
        for id_turma, group_turma in grouped_turma:
            nm_turma = df_turmas.loc[df_turmas["Id_Turma"] == id_turma, "Nome_Turma"].values[0]
            professores_turmas_materias[nm_professor][nm_turma] = []

            aulas_maximas_diarias[nm_professor][nm_turma] = \
                group_turma.iloc[0]["Qnt_Maxima_Diaria"]

            for id_materia in group_turma["Id_Materia"].drop_duplicates():
                nm_materia = \
                    df_materias.loc[df_materias["Id_Materia"] == id_materia, "Nome_Materia"].values[0]
                
                professores_turmas_materias[nm_professor][nm_turma].append(nm_materia)

    df_atribuicoes["Nome_Professor"] = \
        df_atribuicoes["Id_Professor"].apply(
        lambda id_prof: 
        df_professores.loc[df_professores["Id_Professor"] == id_prof, "Nome_Professor"].values[0])
    
    preferencias_professor = \
        df_atribuicoes[["Nome_Professor", "Preferencia"]].drop_duplicates(). \
            set_index("Nome_Professor").to_dict()["Preferencia"]

    configuracoes.update({"professores_turmas_materias": professores_turmas_materias, 
                          "preferencias_professor": preferencias_professor,
                          "aulas_maximas_diarias": aulas_maximas_diarias})

    return configuracoes

def formata_disponibilidades_profs(con_class: Connector, configuracoes: dict, id_configuracao: int):

    colunas = ["Id_Professor", "Id_Dia", "Id_Momento", "Disponivel"]
    linhas = con_class.executar_query(f"SELECT {', '.join(colunas)} FROM Disponibilidades_Professores WHERE Id_Configuracao = {id_configuracao}")
    df_linhas = DataFrame(linhas, columns=colunas)
    df_disp_profs = df_linhas.pivot_table(index=["Id_Professor", "Id_Momento"], columns=["Id_Dia"], values="Disponivel").reset_index(level=1).rename_axis(None, axis=1).reset_index()

    colunas_profs = ["Id_Professor", "Nome_Professor"]
    professores = con_class.executar_query(f"SELECT {', '.join(colunas_profs)} FROM Professores WHERE Id_Configuracao = {id_configuracao}")
    df_professores = DataFrame(professores, columns=colunas_profs)

    colunas_dias = ["Id_Dia", "Nome_Dia"]
    dias = con_class.executar_query(f"SELECT {', '.join(colunas_dias)} FROM Dias WHERE Id_Configuracao = {id_configuracao}")
    df_dias = DataFrame(dias, columns=colunas_dias)

    colunas_momentos = ["Id_Momento", "Nome_Momento"]
    momentos = con_class.executar_query(f"SELECT {', '.join(colunas_momentos)} FROM Momentos WHERE Id_Configuracao = {id_configuracao}")
    df_momentos = DataFrame(momentos, columns=colunas_momentos)

    df_disp_profs = df_disp_profs.merge(df_professores, on="Id_Professor").merge(df_momentos, on="Id_Momento")

    df_disp_profs.sort_values(by=["Id_Professor", "Id_Momento"], inplace=True)

    df_disp_profs = df_disp_profs[["Nome_Professor", "Nome_Momento"] + list(df_dias["Id_Dia"])]

    df_disp_profs.columns = ["professor", "momento"] + list(df_dias["Nome_Dia"])

    df_disp_profs.reset_index(drop=True, inplace=True)

    for nm_col in df_disp_profs.columns[2:]:
        df_disp_profs[nm_col] = df_disp_profs[nm_col].astype(int)

    configuracoes.update({"df_disponibilidades": df_disp_profs})

    return configuracoes

def formata_disponibilidade_turmas(con_class: Connector, configuracoes: dict, id_configuracao: int):
    colunas = ["Id_Turma", "Id_Dia", "Id_Momento", "Disponivel"]
    linhas = con_class.executar_query(f"SELECT {', '.join(colunas)} FROM Disponibilidades_Turmas WHERE Id_Configuracao = {id_configuracao}")
    df_linhas = DataFrame(linhas, columns=colunas)
    df_disp_turmas = df_linhas.pivot_table(index=["Id_Turma", "Id_Dia"], columns=["Id_Momento"], values="Disponivel").reset_index(level=1).rename_axis(None, axis=1).reset_index()
    
    colunas_turmas = ["Id_Turma", "Nome_Turma"]
    turmas = con_class.executar_query(f"SELECT {', '.join(colunas_turmas)} FROM Turmas WHERE Id_Configuracao = {id_configuracao}")
    df_turmas = DataFrame(turmas, columns=colunas_turmas)

    colunas_dias = ["Id_Dia", "Nome_Dia"]
    dias = con_class.executar_query(f"SELECT {', '.join(colunas_dias)} FROM Dias WHERE Id_Configuracao = {id_configuracao}")
    df_dias = DataFrame(dias, columns=colunas_dias)

    colunas_momentos = ["Id_Momento", "Nome_Momento"]
    momentos = con_class.executar_query(f"SELECT {', '.join(colunas_momentos)} FROM Momentos WHERE Id_Configuracao = {id_configuracao}")
    df_momentos = DataFrame(momentos, columns=colunas_momentos)

    df_disp_turmas = df_disp_turmas.merge(df_turmas, on="Id_Turma").merge(df_dias, on="Id_Dia")
    df_disp_turmas.sort_values(by=["Id_Turma", "Id_Dia"], inplace=True)
    df_disp_turmas = df_disp_turmas[["Nome_Turma", "Nome_Dia"] + list(df_momentos["Id_Momento"])]

    df_disp_turmas.columns = ["turma", "dia"] + list(df_momentos["Nome_Momento"])

    dict_disponibilidades_aulas = {}
    for nm_turma in df_disp_turmas["turma"].unique():
        df_filtrado = df_disp_turmas[df_disp_turmas["turma"] == nm_turma].reset_index(drop=True)

        df_final = df_filtrado.set_index("dia").drop("turma", axis=1).T
        for nm_col in df_final.columns:
            df_final[nm_col] = df_final[nm_col].astype(int)

        dict_disponibilidades_aulas[nm_turma] = df_final
    
    configuracoes.update({"dict_disponibilidades_aulas": dict_disponibilidades_aulas})

    return configuracoes

def informacoes_rodada(con_class: Connector, configuracoes: dict, id_configuracao: int) -> dict:
    
        id_escola, id_unidade, id_periodo = \
            con_class.executar_query(f"""
                                     SELECT Id_Escola, Id_Unidade, Id_Periodo 
                                     FROM Configuracoes 
                                     WHERE Id_Configuracao = {id_configuracao}""")[0]

        nm_escola = con_class.get_nm_escola(id_escola)[0]
        nm_unidade = con_class.get_nm_unidade(id_unidade)[0]
        nm_periodo = con_class.get_nm_periodo(id_periodo)[0]

        configuracoes.update({"nm_escola": nm_escola,
                              "nm_unidade": nm_unidade,
                              "nm_periodo": nm_periodo})

        return configuracoes
