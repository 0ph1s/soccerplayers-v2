"""Percentis de cada métrica dentro do grupo de comparação do jogador."""

from __future__ import annotations

import pandas as pd

COLUNAS_ENTRADA = ["player_id", "categoria", "posicao", "metrica", "valor"]


def calcular_percentis(
    valores: pd.DataFrame,
    minimo_grupo: int,
    pesos: pd.DataFrame | None = None,
) -> pd.DataFrame:
    """Calcula o percentil 0 a 100 de cada valor dentro do seu grupo.

    O grupo é a categoria posicional. Quando a categoria tem menos de `minimo_grupo`
    jogadores com valor na métrica, a comparação cai para a posição geral
    (grupo "amplo:<posicao>"), como no projeto original.

    `pesos` (colunas indice e metrica) ativa o pool do artigo: cada valor é repetido uma vez
    por índice que usa a métrica, e o percentil é calculado nesse conjunto repetido.
    Isso reproduz os números publicados e altera o percentil das métricas usadas nos dois
    índices (hoje, só dribles bem-sucedidos). Sem `pesos`, cada valor entra uma vez.
    """
    faltantes = set(COLUNAS_ENTRADA) - set(valores.columns)
    if faltantes:
        raise KeyError(f"Colunas ausentes em valores: {sorted(faltantes)}")

    if pesos is not None:
        valores = valores.merge(pesos[["indice", "metrica"]], on="metrica", how="inner")

    partes = []
    for _, grupo in valores.dropna(subset=["valor"]).groupby("metrica", sort=False):
        grupo = grupo.copy()
        contagem = grupo.groupby("categoria")["player_id"].transform("count")
        grupo["grupo_percentil"] = grupo["categoria"]
        amplo = contagem < minimo_grupo
        grupo.loc[amplo, "grupo_percentil"] = "amplo:" + grupo.loc[amplo, "posicao"].astype(str)
        grupo["percentil_0_100"] = grupo.groupby("grupo_percentil")["valor"].rank(method="average", pct=True) * 100
        partes.append(grupo)

    if not partes:
        return pd.DataFrame(columns=[*COLUNAS_ENTRADA, "grupo_percentil", "percentil_0_100"])
    return pd.concat(partes, ignore_index=True)
