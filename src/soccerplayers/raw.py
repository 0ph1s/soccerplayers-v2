"""Leitura e cálculo a partir das tabelas brutas do transfermarkt-datasets (players e appearances)."""

from __future__ import annotations

from pathlib import Path

import pandas as pd

from soccerplayers.config import DIAS_POR_ANO


def temporada_de(data: pd.Series) -> pd.Series:
    """Temporada esportiva de julho a junho: 2024-03-10 -> '2023/24'."""
    datas = pd.to_datetime(data)
    inicio = datas.dt.year.where(datas.dt.month >= 7, datas.dt.year - 1)
    return inicio.astype(str) + "/" + (inicio + 1).mod(100).astype(str).str.zfill(2)


def carregar_players(caminho: Path, ids: set[int]) -> pd.DataFrame:
    colunas = ["player_id", "name", "position", "sub_position", "date_of_birth", "height_in_cm"]
    jogadores = pd.read_csv(caminho, usecols=colunas, compression="gzip")
    jogadores = jogadores[jogadores["player_id"].isin(ids)].copy()
    jogadores["date_of_birth"] = pd.to_datetime(jogadores["date_of_birth"], errors="coerce")
    return jogadores


def carregar_appearances(caminho: Path, ids: set[int]) -> pd.DataFrame:
    colunas = ["player_id", "player_club_id", "date", "minutes_played", "goals", "assists"]
    partes = []
    for bloco in pd.read_csv(caminho, usecols=colunas, compression="gzip", chunksize=500_000):
        partes.append(bloco[bloco["player_id"].isin(ids)])
    aparicoes = pd.concat(partes, ignore_index=True)
    aparicoes["date"] = pd.to_datetime(aparicoes["date"], errors="coerce")
    for coluna in ("minutes_played", "goals", "assists"):
        aparicoes[coluna] = pd.to_numeric(aparicoes[coluna], errors="coerce")
    return aparicoes


def metricas_aparicoes(aparicoes: pd.DataFrame, minimo_temporada: int) -> pd.DataFrame:
    """Gols e assistências por 90 minutos, somando só as temporadas com minutos suficientes.

    Igual ao projeto original: a temporada entra se tiver pelo menos `minimo_temporada` minutos,
    e a taxa do jogador é a soma das contagens sobre a soma dos minutos, × 90.
    """
    dados = aparicoes.dropna(subset=["date", "minutes_played"]).copy()
    dados["temporada"] = temporada_de(dados["date"])
    por_temporada = dados.groupby(["player_id", "temporada"], as_index=False).agg(
        minutos=("minutes_played", "sum"),
        gols=("goals", "sum"),
        assistencias=("assists", "sum"),
    )
    validas = por_temporada[por_temporada["minutos"] >= minimo_temporada]
    total = validas.groupby("player_id", as_index=False)[["minutos", "gols", "assistencias"]].sum()

    linhas = []
    for metrica, coluna in (("goals", "gols"), ("assists", "assistencias")):
        taxa = total[coluna] / total["minutos"] * 90
        linhas.append(pd.DataFrame({"player_id": total["player_id"], "metrica": metrica, "valor": taxa}))
    return pd.concat(linhas, ignore_index=True)


def estreia_e_minutos_no_clube(aparicoes: pd.DataFrame, clube_tm_id: int) -> pd.DataFrame:
    """Primeira partida e minutos somados de cada jogador pelo clube formador."""
    no_clube = aparicoes[aparicoes["player_club_id"] == clube_tm_id]
    return no_clube.groupby("player_id", as_index=False).agg(
        estreia=("date", "min"),
        minutos_clube=("minutes_played", "sum"),
    )


def idade_em_anos(nascimento: pd.Series, data: pd.Series) -> pd.Series:
    return (data - nascimento).dt.days / DIAS_POR_ANO
