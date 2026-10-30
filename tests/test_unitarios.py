"""Testes das funções puras: categorias, percentis, índices, estatística e cálculo a partir do bruto."""

from __future__ import annotations

import numpy as np
import pandas as pd
import pytest
from scipy import stats

from soccerplayers import config
from soccerplayers.categorias import categoria_posicao
from soccerplayers.estatistica import comparar_pares, descritiva, kruskal_wallis
from soccerplayers.indices import calcular_indices, tabela_de_pesos
from soccerplayers.percentis import calcular_percentis
from soccerplayers.raw import metricas_aparicoes, temporada_de

DEFINICOES = {
    "indices": {
        "tecnico": {"variaveis": [{"nome": "a", "fonte": "snapshot", "peso": 1.0},
                                  {"nome": "b", "fonte": "snapshot", "peso": 3.0}]},
        "explosivo": {"variaveis": [{"nome": "b", "fonte": "snapshot", "peso": 1.0}]},
    },
    "regras": {"minimo_minutos_temporada": 450, "minimo_jogadores_grupo": 2},
}


# ---------------------------------------------------------------- categorias

@pytest.mark.parametrize(
    ("posicao", "sub", "esperado"),
    [
        ("Goalkeeper", "Goalkeeper", "goleiro"),
        ("Defender", "Centre-Back", "zagueiro"),
        ("Defender", "Left-Back", "lateral"),
        ("Defender", "", "lateral"),
        ("Midfield", "Central Midfield", "meio_campista_defensivo_central"),
        ("Midfield", "Attacking Midfield", "meia_ofensivo_ponta"),
        ("Attack", "Left Winger", "meia_ofensivo_ponta"),
        ("Attack", "Centre-Forward", "centroavante"),
    ],
)
def test_categoria_resolve_sub_posicao_e_posicao(posicao, sub, esperado):
    assert categoria_posicao(posicao, sub) == esperado


def test_categoria_desconhecida_levanta_erro():
    with pytest.raises(ValueError):
        categoria_posicao("Desconhecida", "")


# ---------------------------------------------------------------- percentis

def _valores(linhas):
    return pd.DataFrame(linhas, columns=["player_id", "categoria", "posicao", "metrica", "valor"])


def test_percentil_fica_entre_0_e_100_e_respeita_a_ordem():
    valores = _valores([
        (1, "lateral", "Defender", "a", 1.0),
        (2, "lateral", "Defender", "a", 2.0),
        (3, "lateral", "Defender", "a", 3.0),
        (4, "lateral", "Defender", "a", 4.0),
        (5, "lateral", "Defender", "a", 5.0),
    ])
    p = calcular_percentis(valores, minimo_grupo=2).set_index("player_id")["percentil_0_100"]
    assert p.between(0, 100).all()
    assert p.is_monotonic_increasing
    assert p.loc[5] == 100


def test_grupo_pequeno_cai_para_posicao_ampla():
    valores = _valores([
        (1, "goleiro", "Goalkeeper", "a", 1.0),
        (2, "lateral", "Defender", "a", 2.0),
        (3, "lateral", "Defender", "a", 3.0),
    ])
    saida = calcular_percentis(valores, minimo_grupo=2).set_index("player_id")
    assert saida.loc[1, "grupo_percentil"] == "amplo:Goalkeeper"
    assert saida.loc[2, "grupo_percentil"] == "lateral"


def test_pool_do_artigo_repete_a_metrica_por_indice():
    valores = _valores([
        (1, "lateral", "Defender", "b", 1.0),
        (2, "lateral", "Defender", "b", 2.0),
    ])
    pesos = tabela_de_pesos(DEFINICOES)
    saida = calcular_percentis(valores, minimo_grupo=2, pesos=pesos)
    assert len(saida) == 4  # 2 jogadores x 2 índices que usam 'b'
    assert set(saida["indice"]) == {"tecnico", "explosivo"}


def test_valores_ausentes_nao_entram_no_percentil():
    valores = _valores([
        (1, "lateral", "Defender", "a", np.nan),
        (2, "lateral", "Defender", "a", 2.0),
    ])
    saida = calcular_percentis(valores, minimo_grupo=1)
    assert list(saida["player_id"]) == [2]


# ---------------------------------------------------------------- índices

def test_indice_e_media_ponderada_e_cobertura():
    percentis = pd.DataFrame({
        "player_id": [1, 1],
        "metrica": ["a", "b"],
        "percentil_0_100": [40.0, 80.0],
    })
    saida = calcular_indices(percentis, DEFINICOES).set_index("player_id")
    # técnico: (40*1 + 80*3) / (1+3) = 70; cobertura 2 de 2
    assert saida.loc[1, "indice_tecnico"] == pytest.approx(70.0)
    assert saida.loc[1, "cobertura_tecnico"] == pytest.approx(1.0)
    # explosivo só usa 'b': 80; cobertura 1 de 1
    assert saida.loc[1, "indice_explosivo"] == pytest.approx(80.0)


def test_indice_vazio_quando_nenhuma_metrica_do_indice_existe():
    percentis = pd.DataFrame({"player_id": [1], "metrica": ["a"], "percentil_0_100": [50.0]})
    saida = calcular_indices(percentis, DEFINICOES).set_index("player_id")
    assert np.isnan(saida.loc[1, "indice_explosivo"])
    assert saida.loc[1, "indice_tecnico"] == pytest.approx(50.0)


# ---------------------------------------------------------------- estatística

def test_kruskal_wallis_bate_com_scipy():
    grupos = {"A": np.array([1.0, 2, 3, 4]), "B": np.array([5.0, 6, 7]), "C": np.array([2.5, 8, 9])}
    resultado = kruskal_wallis(grupos, alpha=0.05)
    h, p = stats.kruskal(*grupos.values())
    assert resultado["H"] == pytest.approx(h)
    assert resultado["p_valor"] == pytest.approx(p)
    assert resultado["significativo"] is bool(p < 0.05)


def test_mann_whitney_ajusta_bonferroni_e_limita_em_um():
    grupos = {"A": np.array([1.0, 2, 3]), "B": np.array([1.5, 2.5, 3.5]), "C": np.array([10.0, 11, 12])}
    pares = comparar_pares(grupos, alpha=0.05)
    assert len(pares) == 3
    assert (pares["p_bonferroni"] <= 1.0).all()
    assert (pares["p_bonferroni"] >= pares["p_valor"]).all()
    assert pares["rank_biserial"].between(-1, 1).all()


def test_descritiva_conta_ausentes_separadamente():
    resumo = descritiva(pd.Series([1.0, 2.0, np.nan, 4.0]))
    assert resumo["n"] == 3
    assert resumo["n_ausentes"] == 1
    assert resumo["mediana"] == pytest.approx(2.0)


# ---------------------------------------------------------------- dados brutos

def test_temporada_comeca_em_julho():
    datas = pd.Series(pd.to_datetime(["2024-06-30", "2024-07-01", "2024-03-10"]))
    assert list(temporada_de(datas)) == ["2023/24", "2024/25", "2023/24"]


def test_temporada_com_minutos_insuficientes_nao_entra_na_taxa():
    aparicoes = pd.DataFrame({
        "player_id": [1, 1, 1],
        "date": pd.to_datetime(["2023-08-01", "2023-08-10", "2024-09-01"]),
        "minutes_played": [30.0, 40.0, 90.0],
        "goals": [1.0, 0.0, 1.0],
        "assists": [0.0, 0.0, 0.0],
    })
    metricas = metricas_aparicoes(aparicoes, minimo_temporada=450).set_index(["player_id", "metrica"])
    # nenhuma temporada chega a 450 minutos (são 70 e 90), então o jogador não tem taxa
    assert (1, "goals") not in metricas.index


def test_taxa_por_90_soma_temporadas_validas():
    aparicoes = pd.DataFrame({
        "player_id": [1] * 6,
        "date": pd.to_datetime(["2023-08-01"] * 3 + ["2024-08-01"] * 3),
        "minutes_played": [150.0, 150.0, 150.0, 100.0, 100.0, 100.0],
        "goals": [1.0, 0.0, 2.0, 0.0, 0.0, 0.0],
        "assists": [0.0] * 6,
    })
    metricas = metricas_aparicoes(aparicoes, minimo_temporada=450).set_index(["player_id", "metrica"])
    # 2023/24: 450 min e 3 gols -> 3/450*90 = 0.6
    assert metricas.loc[(1, "goals"), "valor"] == pytest.approx(0.6)


# ---------------------------------------------------------------- configuração

def test_selecao_tem_35_jogadores_nos_quatro_clubes():
    selecao = pd.read_csv(config.ARQ_SELECAO)
    assert len(selecao) == 35
    assert selecao["clube"].value_counts().to_dict() == {
        "Barcelona": 15, "Liverpool": 8, "Manchester City": 7, "Real Madrid": 5,
    }
    assert set(selecao["formado_confirmado"]) == {"sim"}
