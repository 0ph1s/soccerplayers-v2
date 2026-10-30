"""Testes não paramétricos entre academias: Kruskal-Wallis, Mann-Whitney com Bonferroni e tamanho de efeito."""

from __future__ import annotations

from itertools import combinations

import numpy as np
import pandas as pd
from scipy import stats


def kruskal_wallis(grupos: dict[str, np.ndarray], alpha: float) -> dict:
    """Compara todos os grupos de uma vez. H0: os grupos têm a mesma distribuição."""
    amostras = [np.asarray(v, dtype=float) for v in grupos.values()]
    if len(amostras) < 2:
        raise ValueError("Kruskal-Wallis precisa de pelo menos dois grupos.")
    h, p = stats.kruskal(*amostras)
    return {
        "H": float(h),
        "p_valor": float(p),
        "significativo": bool(p < alpha),
        "k_grupos": len(amostras),
        "n_total": int(sum(len(a) for a in amostras)),
        "alpha": float(alpha),
    }


def comparar_pares(grupos: dict[str, np.ndarray], alpha: float) -> pd.DataFrame:
    """Mann-Whitney U para cada par, com p ajustado por Bonferroni (p × número de comparações).

    rank_biserial vai de -1 a 1; o sinal segue a ordem do par (grupo_a em relação a grupo_b).
    """
    pares = list(combinations(sorted(grupos), 2))
    m = len(pares)
    linhas = []
    for a, b in pares:
        x = np.asarray(grupos[a], dtype=float)
        y = np.asarray(grupos[b], dtype=float)
        u, p = stats.mannwhitneyu(x, y, alternative="two-sided")
        p_bonf = min(1.0, p * m)
        linhas.append(
            {
                "grupo_a": a,
                "grupo_b": b,
                "U": float(u),
                "p_valor": float(p),
                "p_bonferroni": float(p_bonf),
                "significativo": bool(p_bonf < alpha),
                "diferenca_medianas": float(np.median(x) - np.median(y)),
                "rank_biserial": float(2 * u / (len(x) * len(y)) - 1),
            }
        )
    return pd.DataFrame(linhas)


def descritiva(valores: pd.Series) -> dict:
    """Resumo de uma amostra; valores ausentes são contados à parte."""
    validos = pd.to_numeric(valores, errors="coerce")
    ausentes = int(validos.isna().sum())
    validos = validos.dropna()
    if validos.empty:
        return {"n": 0, "n_ausentes": ausentes, "mediana": None, "q1": None, "q3": None, "minimo": None, "maximo": None}
    return {
        "n": int(validos.size),
        "n_ausentes": ausentes,
        "mediana": float(validos.median()),
        "q1": float(validos.quantile(0.25)),
        "q3": float(validos.quantile(0.75)),
        "minimo": float(validos.min()),
        "maximo": float(validos.max()),
    }
