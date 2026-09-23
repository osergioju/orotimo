"""
Ponte entre o backend Node/Prisma e o modelo de otimização legado.

Uso: venv/bin/python3 bridge.py <entrada.json> <saida.json>

<entrada.json> é o payload montado por
backend/src/services/solverPayload.service.ts, já no formato do dicionário
`configuracoes` esperado por modelo/cronogrid.py — exceto pelas tabelas que
viram DataFrame (df_disponibilidades / dict_disponibilidades_aulas) e pelas
chaves numéricas (JSON só tem chaves string).
"""

import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from pandas import DataFrame  # noqa: E402

from utils.utils import retorna_mensagens  # noqa: E402
from modelo.cronogrid import cronogrid  # noqa: E402


def _int_keys(d):
    return {int(k): v for k, v in d.items()}


def build_configuracoes(raw):
    return {
        "A": raw["A"],
        "B": raw["B"],
        "C": raw["C"],
        "D": raw["D"],
        "turmas": _int_keys(raw["turmas"]),
        "professores": _int_keys(raw["professores"]),
        "dias": _int_keys(raw["dias"]),
        "momentos": _int_keys(raw["momentos"]),
        "materias": _int_keys(raw["materias"]),
        "preferencias_materia": raw["preferencias_materia"],
        "preferencias_professor": raw["preferencias_professor"],
        "aulas_minimas_semanais": raw["aulas_minimas_semanais"],
        "aulas_maximas_diarias": raw["aulas_maximas_diarias"],
        "professores_turmas_materias": raw["professores_turmas_materias"],
        "df_disponibilidades": DataFrame(raw["df_disponibilidades"]),
        "dict_disponibilidades_aulas": {
            turma: DataFrame(records).set_index("momento")
            for turma, records in raw["dict_disponibilidades_aulas"].items()
        },
    }


def solution_to_json(solucao):
    return {
        "datetime": solucao["datetime"],
        "objective_value": solucao["prob"].objective.value(),
        "visualizacao_escola": solucao["df_visualizacao_escola"].to_dict(orient="records"),
        "visualizacao_professores": solucao["df_visualizacao_professores"].to_dict(orient="records"),
        "visualizacao_janelas": solucao["df_visualizacao_janelas"].to_dict(orient="records"),
        "resumo_janelas": solucao["df_resumo_janelas"].to_dict(orient="records"),
    }


def main():
    input_path, output_path = sys.argv[1], sys.argv[2]

    with open(input_path, "r", encoding="utf-8") as f:
        raw = json.load(f)

    result = {"status": "error", "messages": [], "solutions": []}

    try:
        configuracoes = build_configuracoes(raw)

        problemas = retorna_mensagens(configuracoes)
        if problemas:
            result["status"] = "infeasible"
            result["messages"] = [{"mensagens": mensagens, "dica": dica} for mensagens, dica in problemas]
        else:
            solucoes = cronogrid(configuracoes)

            if isinstance(solucoes, str):
                result["status"] = "infeasible"
                result["messages"] = [
                    {
                        "mensagens": [f"O solver não encontrou uma solução viável (status: {solucoes})."],
                        "dica": "Revise disponibilidades e atribuições — a demanda pode exceder a capacidade disponível.",
                    }
                ]
            else:
                result["status"] = "success"
                result["solutions"] = [solution_to_json(solucao) for solucao in solucoes]
    except Exception as exc:  # bridge script: always emit JSON, never a bare traceback to stdout
        result["status"] = "error"
        result["messages"] = [{"mensagens": [str(exc)], "dica": ""}]

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False)


if __name__ == "__main__":
    main()
