"""Índices técnico e explosivo: média ponderada dos percentis das métricas de cada índice."""

from __future__ import annotations

import pandas as pd

INDICES = ("tecnico", "explosivo")


def tabela_de_pesos(definicoes: dict) -> pd.DataFrame:
    linhas = []
    for indice, configuracao in definicoes["indices"].items():
        for variavel in configuracao["variaveis"]:
            linhas.append({"indice": indice, "metrica": variavel["nome"], "peso": float(variavel["peso"])})
    return pd.DataFrame(linhas)


def calcular_indices(percentis: pd.DataFrame, definicoes: dict) -> pd.DataFrame:
    """Uma linha por jogador, com índice, cobertura e número de métricas usadas em cada índice.

    Cobertura = métricas com valor / métricas definidas no índice. Um jogador sem nenhuma
    métrica de um índice fica com esse índice vazio (NaN).
    """
    pesos = tabela_de_pesos(definicoes)
    total_por_indice = pesos.groupby("indice")["metrica"].count()

    # No pool do artigo o percentil já vem por índice; no pool corrigido vem por métrica.
    chaves = ["indice", "metrica"] if "indice" in percentis.columns else ["metrica"]
    junto = percentis.merge(pesos, on=chaves, how="inner")
    junto["contribuicao"] = junto["percentil_0_100"] * junto["peso"]
    agregado = junto.groupby(["player_id", "indice"]).agg(
        soma=("contribuicao", "sum"),
        peso_total=("peso", "sum"),
        n_metricas=("metrica", "nunique"),
    )
    agregado["valor"] = agregado["soma"] / agregado["peso_total"]
    agregado["cobertura"] = agregado["n_metricas"] / agregado.index.get_level_values("indice").map(total_por_indice)

    largo = agregado.reset_index()
    saida = pd.DataFrame(index=pd.Index(sorted(percentis["player_id"].unique()), name="player_id"))
    for indice in INDICES:
        parte = largo[largo["indice"] == indice].set_index("player_id")
        # Arredonda para remover ruído de ponto flutuante: sem isso, valores iguais viram diferentes
        # e os empates do Kruskal-Wallis mudam de um ambiente para outro.
        saida[f"indice_{indice}"] = parte["valor"].round(9)
        saida[f"cobertura_{indice}"] = parte["cobertura"]
        saida[f"n_metricas_{indice}"] = parte["n_metricas"]
    return saida.reset_index()
