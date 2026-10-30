"""Caminhos e critérios do estudo. Valores que mudam ficam aqui, não espalhados pelo código."""

from __future__ import annotations

from pathlib import Path

import yaml

RAIZ = Path(__file__).resolve().parents[2]
DIR_CONFIG = RAIZ / "config"
DIR_RAW = RAIZ / "data" / "raw"
DIR_MANUAL = RAIZ / "data" / "manual"
DIR_PROCESSED = RAIZ / "data" / "processed"
DIR_WEB_DADOS = RAIZ / "web" / "public" / "dados"

ARQ_PLAYERS = DIR_RAW / "players.csv.gz"
ARQ_APPEARANCES = DIR_RAW / "appearances.csv.gz"
ARQ_SELECAO = DIR_MANUAL / "selecao_formados.csv"
ARQ_SNAPSHOT = DIR_MANUAL / "snapshot_valores_v1.csv"

# IDs de clube no Transfermarkt (campo player_club_id de appearances)
CLUBES_TM = {
    131: "Barcelona",
    418: "Real Madrid",
    281: "Manchester City",
    31: "Liverpool",
}
ACADEMIAS = list(CLUBES_TM.values())

# Critérios do artigo (seção 4)
ESTREIA_DESDE = "2016-01-01"
MIN_MINUTOS_CLUBE = 900
MAX_POR_CLUBE = 15
IDADE_MIN = 12
IDADE_MAX = 23

ALPHA = 0.05
DIAS_POR_ANO = 365.2425


def carregar_yaml(caminho: Path) -> dict:
    with caminho.open(encoding="utf-8") as arquivo:
        return yaml.safe_load(arquivo) or {}


def carregar_metricas() -> dict:
    return carregar_yaml(DIR_CONFIG / "metricas.yaml")


def carregar_categorias() -> dict:
    return carregar_yaml(DIR_CONFIG / "categorias.yaml")
