"""Categoria posicional de cada jogador, usada como grupo de comparação dos percentis."""

from __future__ import annotations

from functools import lru_cache

from soccerplayers.config import carregar_categorias


@lru_cache(maxsize=1)
def _regras() -> dict:
    return carregar_categorias()


def categoria_posicao(posicao: str | None, sub_posicao: str | None = None) -> str:
    """Resolve a categoria pela sub-posição; sem ela, usa a posição geral.

    Lança ValueError para posições desconhecidas, em vez de atribuir uma categoria em silêncio.
    """
    regras = _regras()
    sub = (sub_posicao or "").strip()
    pos = (posicao or "").strip()

    if sub in regras["sub_posicoes"]:
        return regras["sub_posicoes"][sub]
    if pos == "Defender" and not sub:
        return "lateral"
    if pos in regras["posicoes"]:
        return regras["posicoes"][pos]
    raise ValueError(f"Posição sem categoria definida: posicao={posicao!r}, sub_posicao={sub_posicao!r}")


def ordem_categorias() -> list[str]:
    return list(_regras()["ordem"])
