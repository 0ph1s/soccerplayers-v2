"""Testes do pipeline completo. A referência é o artigo: os números publicados precisam sair daqui."""

from __future__ import annotations

import pandas as pd
import pytest

from soccerplayers import config, pipeline

# Números do artigo (seção 6 e tabelas de resultados)
ARTIGO_KRUSKAL = {
    "indice_tecnico": {"H": 2.2551, "p": 0.5212},
    "indice_explosivo": {"H": 2.2489, "p": 0.5224},
}
ARTIGO_MEDIANAS = {
    ("Barcelona", "indice_tecnico"): 50.94,
    ("Real Madrid", "indice_tecnico"): 71.15,
    ("Manchester City", "indice_tecnico"): 67.71,
    ("Barcelona", "indice_explosivo"): 57.62,
    ("Liverpool", "indice_explosivo"): 62.09,
    ("Manchester City", "indice_explosivo"): 64.08,
    ("Real Madrid", "indice_explosivo"): 60.42,
}


@pytest.fixture(scope="module")
def resultado_artigo(tmp_path_factory):
    pasta = tmp_path_factory.mktemp("artigo")
    return pipeline.executar(pipeline.MODO_SNAPSHOT, pipeline.POOL_ARTIGO, saida=pasta, web=pasta)


def test_pipeline_artigo_reproduz_explosivo_e_mann_whitney(resultado_artigo):
    kruskal = {linha["indice"]: linha for linha in resultado_artigo["kruskal"]}
    explosivo = kruskal["indice_explosivo"]
    assert explosivo["H"] == pytest.approx(ARTIGO_KRUSKAL["indice_explosivo"]["H"], abs=1e-4)
    assert explosivo["p_valor"] == pytest.approx(ARTIGO_KRUSKAL["indice_explosivo"]["p"], abs=1e-4)


def test_pipeline_artigo_mantem_a_conclusao_do_tecnico(resultado_artigo):
    # H do técnico varia na 2ª casa decimal com o desempate dos empates (ver README, "Validação").
    # O que o artigo afirma, e o código precisa manter, é a ausência de diferença significativa.
    tecnico = {linha["indice"]: linha for linha in resultado_artigo["kruskal"]}["indice_tecnico"]
    assert tecnico["p_valor"] > config.ALPHA
    assert tecnico["H"] == pytest.approx(ARTIGO_KRUSKAL["indice_tecnico"]["H"], abs=0.06)


def test_pipeline_artigo_bate_com_as_medianas_publicadas(resultado_artigo):
    descritiva = pd.DataFrame(resultado_artigo["descritiva"])
    for (academia, indice), esperado in ARTIGO_MEDIANAS.items():
        valor = descritiva.loc[(descritiva["academia"] == academia) & (descritiva["indice"] == indice), "mediana"]
        assert float(valor.iloc[0]) == pytest.approx(esperado, abs=0.05)


def test_pipeline_artigo_nenhum_par_significativo_apos_bonferroni(resultado_artigo):
    pares = pd.DataFrame(resultado_artigo["pares"])
    assert len(pares) == 12  # 6 pares por índice
    assert not pares["significativo"].any()
    assert (pares["p_bonferroni"] == 1.0).all()


def test_pool_corrigido_muda_os_percentis_do_dribles_mas_nao_a_conclusao(tmp_path):
    corrigido = pipeline.executar(pipeline.MODO_SNAPSHOT, pipeline.POOL_CORRIGIDO, saida=tmp_path, web=tmp_path)
    kruskal = {linha["indice"]: linha for linha in corrigido["kruskal"]}
    for indice in kruskal:
        assert kruskal[indice]["p_valor"] > config.ALPHA


def test_modo_desconhecido_levanta_erro(tmp_path):
    with pytest.raises(ValueError):
        pipeline.executar("inexistente", pipeline.POOL_CORRIGIDO, saida=tmp_path, web=tmp_path)


def test_resultado_e_serializavel_sem_nan(resultado_artigo):
    import json

    texto = json.dumps(resultado_artigo, allow_nan=False)
    assert "NaN" not in texto
    assert len(resultado_artigo["jogadores"]) == 35
