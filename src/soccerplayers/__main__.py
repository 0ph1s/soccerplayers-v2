"""Ponto de entrada: `python -m soccerplayers <comando>`."""

from __future__ import annotations

import argparse
import sys

import pandas as pd

from soccerplayers import config, pipeline
from soccerplayers.raw import carregar_appearances, carregar_players
from soccerplayers.selecao import auditar


def _auditoria() -> int:
    selecao = pd.read_csv(config.ARQ_SELECAO, encoding="utf-8")
    ids = set(selecao["player_id"].astype(int))
    players = carregar_players(config.ARQ_PLAYERS, ids)
    aparicoes = carregar_appearances(config.ARQ_APPEARANCES, ids)
    tabela = auditar(selecao, players, aparicoes)
    config.DIR_PROCESSED.mkdir(parents=True, exist_ok=True)
    tabela.to_csv(config.DIR_PROCESSED / "auditoria_selecao.csv", index=False, encoding="utf-8")
    reprovados = tabela[~tabela["aprovado"]]
    print(f"{len(tabela) - len(reprovados)}/{len(tabela)} jogadores aprovados nos critérios.")
    if not reprovados.empty:
        print(reprovados[["nome", "clube", "estreia", "minutos_clube", "idade_estreia"]].to_string(index=False))
    return 0


def main(argv: list[str] | None = None) -> int:
    # Terminais do Windows usam code page antiga; sem isso, acentos de nomes saem quebrados.
    sys.stdout.reconfigure(encoding="utf-8")
    parser = argparse.ArgumentParser(prog="soccerplayers")
    sub = parser.add_subparsers(dest="comando", required=True)
    sub.add_parser("auditar", help="Confere os critérios do artigo com os dados brutos.")
    executar = sub.add_parser("executar", help="Roda o pipeline e grava os resultados.")
    executar.add_argument("--modo", choices=[pipeline.MODO_SNAPSHOT, pipeline.MODO_RAW],
                          default=pipeline.MODO_SNAPSHOT)
    args = parser.parse_args(argv)
    if args.comando == "auditar":
        return _auditoria()
    pipeline.main(["--modo", args.modo])
    return 0


if __name__ == "__main__":
    sys.exit(main())
