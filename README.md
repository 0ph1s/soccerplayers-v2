# soccerplayers-v2

Reconstrução do projeto de análise comparativa de academias de formação de jogadores, feita a partir do artigo
`artigo academia de futebol.docx` (FATEC Baixada Santista, Ciência de Dados, 2026).

Escopo: quatro academias (La Masia, La Fábrica, City Football Academy e The Academy), índices técnico e explosivo,
Kruskal-Wallis, Mann-Whitney com correção de Bonferroni e tamanho de efeito. O resultado indica **associação, não causa**.

## Como executar

Requisitos: Python 3.11+, [uv](https://docs.astral.sh/uv/) e Node.js 20+.

```bash
uv sync
uv run python -m soccerplayers executar --modo snapshot --pool artigo
uv run python -m soccerplayers executar --modo snapshot --pool corrigido
uv run pytest
```

Dados brutos (opcional, para o modo `raw`): baixar `players.csv.gz`, `appearances.csv.gz` e `transfers.csv.gz`
do [transfermarkt-datasets](https://github.com/dcaribou/transfermarkt-datasets) e colocar em `data/raw/`.
Depois:

```bash
uv run python -m soccerplayers auditar            # confere os critérios de inclusão do artigo
uv run python -m soccerplayers executar --modo raw --pool artigo
```

Dashboard:

```bash
cd web
npm install
npm run dev        # abre em http://localhost:5173
npm run build      # gera web/dist
```

O dashboard lê `web/public/dados/resultados_<modo>_<pool>.json`, gerado pelo comando `executar`.

## Estrutura

```
config/              metricas.yaml (índices e pesos), categorias.yaml (posição -> categoria)
data/manual/         selecao_formados.csv (35 jogadores validados à mão), snapshot_valores_v1.csv
data/raw/            dados brutos do transfermarkt-datasets (não versionados)
data/processed/      tabelas geradas pelo pipeline (não versionadas)
src/soccerplayers/   pipeline: categorias, percentis, indices, estatistica, raw, selecao, pipeline
tests/               testes unitários e do pipeline (inclui os números do artigo)
web/                 dashboard em React + Vite + JavaScript, com shadcn/ui
```

## Fontes e proveniência

- **Seleção de jogadores** (`data/manual/selecao_formados.csv`): lista validada à mão no projeto original. A formação
  de cada jogador foi confirmada em registros de clube e Wikipédia, então ela é entrada, não resultado do código.
- **Valores do Sofascore** (`data/manual/snapshot_valores_v1.csv`): copiados do `percentis_metricas.csv` do projeto
  original. Não há coleta nova do Sofascore neste projeto, então essas métricas são fixas.
- **Gols, assistências e altura**: no modo `snapshot` vêm do projeto original; no modo `raw` são recalculados a
  partir do transfermarkt-datasets baixado. A versão baixada tem dados até julho de 2026, então pode diferir do
  snapshot.

## Método

1. Valores por 90 minutos (gols e assistências) e altura. Temporada esportiva de julho a junho; temporadas com menos
   de 450 minutos não entram na taxa.
2. Percentil de cada métrica dentro da categoria posicional (seis categorias). Categoria com menos de 5 jogadores
   usa a posição geral como grupo.
3. Índice = média ponderada dos percentis (pesos em `config/metricas.yaml`), entre 0 e 100.
4. Kruskal-Wallis entre as quatro academias; Mann-Whitney em cada par, com p ajustado = p × 6, limitado a 1;
   rank-biserial e diferença de medianas como tamanho de efeito.

## Validação contra o artigo

Comparação com os números publicados, usando o snapshot:

| Resultado | Artigo | Este projeto (`artigo`) | Situação |
|---|---|---|---|
| Índice explosivo: Kruskal-Wallis H / p | 2,2489 / 0,5224 | 2,2489 / 0,5224 | igual |
| Índice técnico: Kruskal-Wallis H / p | 2,2551 / 0,5212 | 2,2058 / 0,5308 | difere (ver abaixo) |
| Mann-Whitney, p bruto do técnico (faixa) | 0,192 a 0,638 | 0,204 a 0,723 | difere, pelo mesmo desempate |
| Mann-Whitney, p bruto do explosivo (faixa) | 0,210 a 0,943 | 0,210 a 0,943 | igual |
| Medianas (exceto Liverpool técnico) | conforme o artigo | conforme o artigo | igual, em 0,05 |
| Mediana técnica do Liverpool | 67 | 62,6 | difere; o artigo deve ter erro, e o CSV do projeto original dá 62,6 |
| Idade média na estreia (Barcelona, Liverpool, City, Real Madrid) | 19,0; 19,3; 19,3; 21,0 | 19,0; 19,3; 19,3; 21,0 | igual |
| Mann-Whitney com Bonferroni | nenhum par significativo | nenhum par significativo | igual |

**Por que a H do técnico difere.** Os percentis são frações com denominadores pequenos, então muitos valores são
matematicamente iguais. O cálculo original deixava essa igualdade a cargo do ponto flutuante, e a ordem das somas
decidia qual valor ficava "maior". Este projeto arredonda os índices em 9 casas, para que empates sejam empates.
Sem o arredondamento, a mesma fórmula dá H = 2,2551 ou 2,2055 conforme a ordem das operações. Com o arredondamento,
o resultado não depende da plataforma. A conclusão é a mesma nos dois casos: nenhuma diferença significativa.

**Pool do percentil.** No projeto original, dribles bem-sucedidos aparecem nos dois índices, e o percentil dessa
métrica era calculado num conjunto em que cada jogador entra duas vezes. O modo `--pool artigo` mantém esse método
para reproduzir o artigo. O modo `--pool corrigido` calcula o percentil uma vez por jogador. Com ele, a H explosiva
passa a 2,4820 (p = 0,479) e a técnica a 2,2063 (p = 0,531). Nenhum resultado fica significativo nos dois modos.

## Decisão sobre a amostra

Mantemos os 35 jogadores validados como amostra principal, sem expandir.

- **Por quê não expandir agora.** A regra automática (900 minutos pelo clube, estreia desde 2016, sinal de promoção
  da base nas transferências) gera 40 candidatos, e todos os 35 validados estão entre eles. Os 5 restantes não entram:
  2 do Barcelona, provavelmente pelo teto de 15 por clube, e 3 do Liverpool e Real Madrid, sem motivo registrado.
  Para incluí-los seria preciso confirmar a formação de cada um, e a validação manual não é possível neste momento.
- **Bloqueio do Sofascore.** A API respondeu `403` a partir deste ambiente. Sem as métricas do Sofascore, novos
  jogadores não têm índice técnico nem explosivo.
- **Efeito sobre a análise.** Com n = 35, o teste tem pouco poder para diferenças pequenas. Os resultados continuam
  sendo não significativos, mas isso não prova ausência de diferença (ver Limitações).
- **Como reabrir.** Quando houver validação de formação e acesso às métricas, rodar a regra automática e comparar a
  amostra expandida com a atual, como análise de sensibilidade.

## Decisões em aberto

- **Escopo de seleções nacionais.** A introdução e a seção 5 do artigo falam de seleções, mas a metodologia não as
  analisa. Este projeto cobre só academias × índices.
- **Faixa etária de 12 a 23 anos** (seção 4 do artigo). A auditoria (`auditar`) mostra que dois jogadores têm idade
  na estreia acima de 23 anos (Iñaki Peña, 23,7; Mariano Díaz, 23,1). Eles não foram removidos, porque a lista foi
  validada à mão. A decisão é sua.
- **Percentil por liga e temporada** (artigo: "quando possível"). Não implementado.
- **Pesos.** O artigo fala em média simples dos percentis; o código usa pesos definidos em `config/metricas.yaml`.

## Limitações

- Associação, não causa. Amostra pequena (5 a 15 por academia) e intencional.
- Explosivo é um proxy: altura, duelos e dribles, sem velocidade ou força medidas diretamente.
- Sofascore não é recoletado; valores fixos do projeto original.
