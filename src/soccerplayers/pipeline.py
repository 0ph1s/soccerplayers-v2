"""Executa o pipeline do artigo: valores, percentis, índices, testes e saídas.

Dois modos:
- "snapshot": reproduz o projeto original a partir de data/manual/snapshot_valores_v1.csv.
  É a referência para comparar com os números do artigo.
- "raw": recalcula gols, assistências e altura a partir do transfermarkt-datasets baixado
  em data/raw/. As métricas do Sofascore continuam vindo do snapshot, porque não há coleta nova.
"""

from __future__ import annotations

import argparse
import json
import math
from datetime import datetime, timezone

import numpy as np
import pandas as pd

from soccerplayers import config
from soccerplayers.categorias import categoria_posicao
from soccerplayers.estatistica import comparar_pares, descritiva, kruskal_wallis
from soccerplayers.indices import calcular_indices, tabela_de_pesos
from soccerplayers.percentis import calcular_percentis
from soccerplayers.raw import carregar_appearances, carregar_players, metricas_aparicoes

MODO_SNAPSHOT = "snapshot"
MODO_RAW = "raw"
POOL_CORRIGIDO = "corrigido"
POOL_ARTIGO = "artigo"
INDICES_COLUNAS = ("indice_tecnico", "indice_explosivo")


def _variaveis(definicoes: dict) -> pd.DataFrame:
    linhas = []
    for configuracao in definicoes["indices"].values():
        for variavel in configuracao["variaveis"]:
            linhas.append({"metrica": variavel["nome"], "fonte": variavel["fonte"]})
    return pd.DataFrame(linhas).drop_duplicates()


def montar_valores(selecao: pd.DataFrame, modo: str, definicoes: dict) -> pd.DataFrame:
    """Tabela longa com player_id, metrica e valor, só para as variáveis dos índices."""
    if modo not in (MODO_SNAPSHOT, MODO_RAW):
        raise ValueError(f"Modo desconhecido: {modo!r}")

    snapshot = pd.read_csv(config.ARQ_SNAPSHOT)
    variaveis = _variaveis(definicoes)
    ids = set(selecao["player_id"].astype(int))

    if modo == MODO_SNAPSHOT:
        partes = [snapshot[snapshot["metrica"].isin(variaveis["metrica"])]]
    else:
        do_snapshot = variaveis.loc[variaveis["fonte"] == "snapshot", "metrica"]
        partes = [snapshot[snapshot["metrica"].isin(do_snapshot)]]
        minimo = definicoes["regras"]["minimo_minutos_temporada"]
        aparicoes = carregar_appearances(config.ARQ_APPEARANCES, ids)
        partes.append(metricas_aparicoes(aparicoes, minimo))
        jogadores = carregar_players(config.ARQ_PLAYERS, ids)
        altura = jogadores[["player_id", "height_in_cm"]].rename(columns={"height_in_cm": "valor"})
        partes.append(altura.assign(metrica="height_in_cm"))

    valores = pd.concat(partes, ignore_index=True)
    valores = valores[valores["metrica"].isin(variaveis["metrica"])].copy()
    valores["player_id"] = valores["player_id"].astype(int)
    valores["valor"] = pd.to_numeric(valores["valor"], errors="coerce")
    return valores.dropna(subset=["valor"])


def _json_seguro(valor):
    """Converte tipos do pandas/numpy para JSON; NaN e infinito viram null."""
    if isinstance(valor, (np.integer,)):
        return int(valor)
    if isinstance(valor, (np.floating, float)):
        return float(valor) if math.isfinite(valor) else None
    if isinstance(valor, pd.Timestamp):
        return None if pd.isna(valor) else valor.date().isoformat()
    if valor is pd.NaT or (not isinstance(valor, str) and pd.isna(valor)):
        return None
    return valor


def _registros(tabela: pd.DataFrame) -> list[dict]:
    return [{chave: _json_seguro(valor) for chave, valor in linha.items()} for linha in tabela.to_dict("records")]


def executar(
    modo: str = MODO_SNAPSHOT,
    pool: str = POOL_CORRIGIDO,
    saida=config.DIR_PROCESSED,
    web=config.DIR_WEB_DADOS,
) -> dict:
    if pool not in (POOL_CORRIGIDO, POOL_ARTIGO):
        raise ValueError(f"Pool desconhecido: {pool!r}")
    definicoes = config.carregar_metricas()
    minimo_grupo = definicoes["regras"]["minimo_jogadores_grupo"]
    identificador = f"{modo}_{pool}"

    selecao = pd.read_csv(config.ARQ_SELECAO, encoding="utf-8")
    selecao["player_id"] = selecao["player_id"].astype(int)
    selecao["date_of_birth"] = pd.to_datetime(selecao["date_of_birth"], errors="coerce")
    selecao["estreia"] = pd.to_datetime(selecao["estreia"], errors="coerce")

    valores = montar_valores(selecao, modo, definicoes)
    valores = valores.merge(selecao[["player_id", "clube", "position", "sub_position"]], on="player_id")
    valores["categoria"] = [categoria_posicao(p, s) for p, s in zip(valores["position"], valores["sub_position"])]
    valores = valores.rename(columns={"position": "posicao"})

    pesos = tabela_de_pesos(definicoes) if pool == POOL_ARTIGO else None
    percentis = calcular_percentis(valores, minimo_grupo, pesos=pesos)
    indices = calcular_indices(percentis, definicoes)
    base = selecao.merge(indices, on="player_id", how="left")
    base["idade_estreia"] = (base["estreia"] - base["date_of_birth"]).dt.days / config.DIAS_POR_ANO

    descritivas = []
    kruskal = []
    pares = []
    for indice in INDICES_COLUNAS:
        for academia in config.ACADEMIAS:
            descritivas.append({"academia": academia, "indice": indice,
                                **descritiva(base.loc[base["clube"] == academia, indice])})
        grupos = {a: base.loc[base["clube"] == a, indice].dropna().to_numpy() for a in config.ACADEMIAS}
        kruskal.append({"indice": indice, **kruskal_wallis(grupos, config.ALPHA)})
        pares.append(comparar_pares(grupos, config.ALPHA).assign(indice=indice))

    descritivas = pd.DataFrame(descritivas)
    kruskal = pd.DataFrame(kruskal)
    pares = pd.concat(pares, ignore_index=True)

    saida.mkdir(parents=True, exist_ok=True)
    web.mkdir(parents=True, exist_ok=True)
    base.to_csv(saida / f"jogadores_{identificador}.csv", index=False, encoding="utf-8")
    percentis.to_csv(saida / f"percentis_{identificador}.csv", index=False, encoding="utf-8")
    descritivas.to_csv(saida / f"descritiva_{identificador}.csv", index=False, encoding="utf-8")
    kruskal.to_csv(saida / f"kruskal_wallis_{identificador}.csv", index=False, encoding="utf-8")
    pares.to_csv(saida / f"mann_whitney_{identificador}.csv", index=False, encoding="utf-8")

    colunas_jogador = [
        "player_id", "nome", "clube", "position", "sub_position", "indice_tecnico", "indice_explosivo",
        "cobertura_tecnico", "cobertura_explosivo", "idade_estreia",
    ]
    resultado = {
        "modo": modo,
        "pool": pool,
        "geradoEm": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "academias": config.ACADEMIAS,
        "jogadores": _registros(base[colunas_jogador]),
        "descritiva": _registros(descritivas),
        "kruskal": _registros(kruskal),
        "pares": _registros(pares),
    }
    (web / f"resultados_{identificador}.json").write_text(
        json.dumps(resultado, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    return resultado


def main(argv: list[str] | None = None) -> None:
    parser = argparse.ArgumentParser(description="Pipeline do artigo: academias x índices técnico e explosivo.")
    parser.add_argument("--modo", choices=[MODO_SNAPSHOT, MODO_RAW], default=MODO_SNAPSHOT)
    parser.add_argument("--pool", choices=[POOL_CORRIGIDO, POOL_ARTIGO], default=POOL_CORRIGIDO)
    args = parser.parse_args(argv)
    resultado = executar(args.modo, args.pool)
    print(f"Modo {resultado['modo']} / pool {resultado['pool']}: {len(resultado['jogadores'])} jogadores.")
    for linha in resultado["kruskal"]:
        print(f"Kruskal-Wallis {linha['indice']}: H={linha['H']:.4f}, p={linha['p_valor']:.4f}")


if __name__ == "__main__":
    main()
