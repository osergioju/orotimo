from checagens.checar_dados import (checa_problemas_um, checa_problemas_dois, 
                                    checa_problemas_tres, checa_problemas_quatro,
                                    checa_problemas_cinco, checa_problemas_seis,
                                    checa_problemas_sete)
from pandas import DataFrame

checagens = [
    checa_problemas_um,
    checa_problemas_dois,
    checa_problemas_tres,
    checa_problemas_quatro,
    checa_problemas_cinco,
    checa_problemas_seis,
    checa_problemas_sete,
    ]


def somar_janelas(df_visualizacao_janelas, dias):
    janelas_dia = {dia: 0 for dia in dias.values()}
    janelas_total = 0

    for ind, row in df_visualizacao_janelas.iloc[1:].iterrows():
        dia_anterior = df_visualizacao_janelas.loc[ind - 1, "dia"]
        dia_atual = row["dia"]

        if dia_anterior != dia_atual:
            continue

        momento_anterior = int(df_visualizacao_janelas.loc[ind - 1, "momento_formatado"].split(" ")[-1])
        momento_atual = int(row["momento_formatado"].split(" ")[-1])

        janelas_dia[dia_atual] += momento_atual - momento_anterior - 1
        janelas_total += momento_atual - momento_anterior - 1
    
    return janelas_dia, janelas_total

def contar_janelas(df_visualizacao_janelas, dias, professores):

    df_visualizacao_janelas.sort_values(by=["professor", "dia", "momento_formatado"], 
                                        inplace=True)
    df_visualizacao_janelas.reset_index(drop=True, inplace=True)
    
    janelas_total = 0
    janelas = {}
    for nm_professor in professores.values():
        janelas[nm_professor] = {dia: 0 for dia in dias.values()}
        df_filtrado = df_visualizacao_janelas[df_visualizacao_janelas["professor"] == nm_professor]
        df_filtrado = df_filtrado.sort_values(by=["dia", "momento_formatado"]).reset_index(drop=True)

        janelas_dia_prof, _ = somar_janelas(df_visualizacao_janelas=df_filtrado, 
                                            dias=dias)

        for dia in dias.values():
            janelas[nm_professor][dia] = janelas_dia_prof[dia]
            # janelas_total += janelas_dia_prof[dia]
    
    df_resumo_janelas = DataFrame(janelas).reset_index(names=["dia"])

    df_resumo_janelas = df_resumo_janelas.melt(id_vars="dia", 
              value_vars=professores.values(),
              var_name="professor", value_name="janelas")

    return df_resumo_janelas# , janelas_total

def retorna_mensagens(configuracoes):

    problemas = []

    try:
        for i, checagem in enumerate(checagens):
        
            mensagens, dica = checagem(configuracoes)
    
            if len(mensagens) > 0:
                problemas.append((mensagens, dica))
    
    except Exception as e:
        mensagens, dica = [f"Houve um problema na checagem {i + 1}"], "Verifique se os dados foram inseridos estão corretamente ou entre em contato com o suporte."
        print(e)
        problemas.append((mensagens, dica))
    
    return problemas

def gera_triplas(sequencia):
    return [sequencia[i:i + 3] for i in range(0, len(sequencia) - 2, 1)]