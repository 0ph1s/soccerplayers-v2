"""Auditoria dos critérios de inclusão do artigo, aplicada à lista de jogadores formados."""

from __future__ import annotations

import pandas as pd

from soccerplayers import config
from soccerplayers.raw import estreia_e_minutos_no_clube, idade_em_anos


def auditar(selecao: pd.DataFrame, players: pd.DataFrame, aparicoes: pd.DataFrame) -> pd.DataFrame:
    """Uma linha por jogador, com cada critério e um indicador de aprovação.

    A auditoria não remove ninguém: a lista validada à mão é a base. Os reprovados
    aparecem para revisão.
    """
    nome_para_id = {nome: tm_id for tm_id, nome in config.CLUBES_TM.items()}
    saidas = []
    for _, jogador in selecao.iterrows():
        tm_id = nome_para_id[jogador["clube"]]
        pid = int(jogador["player_id"])
        estreia = estreia_e_minutos_no_clube(aparicoes[aparicoes["player_id"] == pid], tm_id)
        dados = players[players["player_id"] == pid]
        nascimento = dados["date_of_birth"].iloc[0] if not dados.empty else pd.to_datetime(jogador["date_of_birth"])
        data_estreia = estreia["estreia"].iloc[0] if not estreia.empty else pd.NaT
        minutos = float(estreia["minutos_clube"].iloc[0]) if not estreia.empty else 0.0
        idade = idade_em_anos(pd.Series([nascimento]), pd.Series([data_estreia])).iloc[0]

        saidas.append(
            {
                "player_id": pid,
                "nome": jogador["nome"],
                "clube": jogador["clube"],
                "estreia": data_estreia,
                "minutos_clube": minutos,
                "idade_estreia": idade,
                "ok_estreia": bool(pd.notna(data_estreia) and data_estreia >= pd.Timestamp(config.ESTREIA_DESDE)),
                "ok_minutos": minutos >= config.MIN_MINUTOS_CLUBE,
                "ok_idade": bool(pd.notna(idade) and config.IDADE_MIN <= idade <= config.IDADE_MAX),
            }
        )
    tabela = pd.DataFrame(saidas)
    tabela["aprovado"] = tabela[["ok_estreia", "ok_minutos", "ok_idade"]].all(axis=1)
    return tabela
