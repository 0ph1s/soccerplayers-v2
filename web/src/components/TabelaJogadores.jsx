// Base de jogadores: busca, filtros por academia e posição, ordenação por índice ou idade e exportação CSV.
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";
import { useMemo, useState } from "react";

import { MarcaAcademia } from "@/components/MarcaAcademia";
import { Segmentado } from "@/components/Segmentado";
import { Input } from "@/components/ui/input";
import { useIdioma } from "@/i18n";
import { ACADEMIAS, exportarCsv, POSICOES } from "@/lib/dados";
import { cn } from "@/lib/utils";

const COLUNAS_ORDENAVEIS = [
  { chave: "indice_tecnico", rotulo: "tabela.tecnico", casas: 1 },
  { chave: "indice_explosivo", rotulo: "tabela.explosivo", casas: 1 },
  { chave: "idade_estreia", rotulo: "tabela.idade", casas: 1 },
];

function CabecalhoOrdenavel({ coluna, ordem, aoOrdenar }) {
  const { t } = useIdioma();
  const ativa = ordem.chave === coluna.chave;
  const Icone = !ativa ? ArrowUpDown : ordem.direcao === "desc" ? ArrowDown : ArrowUp;
  return (
    <th
      scope="col"
      aria-sort={ativa ? (ordem.direcao === "desc" ? "descending" : "ascending") : "none"}
      className="text-right"
    >
      <button
        type="button"
        onClick={() => aoOrdenar(coluna.chave)}
        aria-label={t("tabela.ordenar", { coluna: t(coluna.rotulo) })}
        className={cn(
          "inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-foreground",
          ativa && "text-foreground",
        )}
      >
        {t(coluna.rotulo)}
        <Icone className="size-3.5" aria-hidden="true" />
      </button>
    </th>
  );
}

export function TabelaJogadores({ jogadores, academias, modo, pool }) {
  const { t, numero } = useIdioma();
  const [busca, setBusca] = useState("");
  const [academia, setAcademia] = useState("todas");
  const [posicao, setPosicao] = useState("todas");
  const [ordem, setOrdem] = useState({ chave: "indice_tecnico", direcao: "desc" });

  const linhas = useMemo(() => {
    const termo = busca
      .trim()
      .toLocaleLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
    const fator = ordem.direcao === "desc" ? -1 : 1;
    return jogadores
      .filter((j) => academia === "todas" || j.clube === academia)
      .filter((j) => posicao === "todas" || j.position === posicao)
      .filter(
        (j) =>
          !termo ||
          j.nome
            .toLocaleLowerCase()
            .normalize("NFD")
            .replace(/\p{Diacritic}/gu, "")
            .includes(termo),
      )
      .sort((a, b) => {
        const va = a[ordem.chave];
        const vb = b[ordem.chave];
        if (va == null && vb == null) return 0;
        if (va == null) return 1;
        if (vb == null) return -1;
        return (va - vb) * fator;
      });
  }, [jogadores, academia, posicao, busca, ordem]);

  const aoOrdenar = (chave) =>
    setOrdem((atual) =>
      atual.chave === chave ? { chave, direcao: atual.direcao === "desc" ? "asc" : "desc" } : { chave, direcao: "desc" },
    );

  const exportar = () =>
    exportarCsv(
      linhas,
      [
        { rotulo: "player_id", valor: (j) => j.player_id },
        { rotulo: t("tabela.jogador"), valor: (j) => j.nome },
        { rotulo: t("tabela.academia"), valor: (j) => ACADEMIAS[j.clube]?.academia ?? j.clube },
        { rotulo: "club", valor: (j) => j.clube },
        { rotulo: t("tabela.posicao"), valor: (j) => t(`posicoes.${j.position}`) },
        { rotulo: t("tabela.idade"), valor: (j) => j.idade_estreia },
        { rotulo: t("tabela.tecnico"), valor: (j) => j.indice_tecnico },
        { rotulo: t("tabela.explosivo"), valor: (j) => j.indice_explosivo },
      ],
      `soccer-analytics_${modo}_${pool}.csv`,
    );

  const opcoesAcademia = [
    { valor: "todas", rotulo: t("tabela.todas") },
    ...academias.map((clube) => ({ valor: clube, rotulo: clube })),
  ];
  const opcoesPosicao = [
    { valor: "todas", rotulo: t("tabela.todas") },
    ...POSICOES.map((p) => ({ valor: p, rotulo: t(`posicoes.${p}`) })),
  ];

  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-8">
      <div className="col-span-12 lg:col-span-3">
        <h3 className="display text-3xl font-semibold">{t("tabela.titulo")}</h3>
        <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">
          {t("tabela.descricao", { total: jogadores.length })}
        </p>
      </div>

      <div className="col-span-12 lg:col-span-9">
        <div className="flex flex-col gap-5 border-t border-rule-strong pt-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <label className="flex w-full flex-col gap-2 md:max-w-xs">
              <span className="rotulo">{t("tabela.buscar")}</span>
              <Input
                type="search"
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
                className="h-10 rounded-none border-rule-strong bg-transparent"
              />
            </label>
            <button
              type="button"
              onClick={exportar}
              disabled={linhas.length === 0}
              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-lime hover:text-lime-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Download className="size-4" aria-hidden="true" />
              {t("tabela.exportar")}
            </button>
          </div>
          <div className="flex flex-col gap-4 xl:flex-row xl:gap-8">
            <Segmentado rotulo={t("tabela.academia")} opcoes={opcoesAcademia} valor={academia} aoMudar={setAcademia} tamanho="sm" />
            <Segmentado rotulo={t("tabela.posicao")} opcoes={opcoesPosicao} valor={posicao} aoMudar={setPosicao} tamanho="sm" />
          </div>
          <p className="num text-sm text-muted-foreground" aria-live="polite">
            {t("tabela.contagem", { n: linhas.length, total: jogadores.length })}
          </p>
        </div>

        <div className="tabela-moldura mt-4 max-h-[640px]" tabIndex={0} aria-label={t("tabela.titulo")}>
          <table className="tabela">
            <thead>
              <tr>
                <th scope="col" className="coluna-fixa">{t("tabela.jogador")}</th>
                <th scope="col">{t("tabela.academia")}</th>
                <th scope="col">{t("tabela.posicao")}</th>
                <CabecalhoOrdenavel coluna={COLUNAS_ORDENAVEIS[2]} ordem={ordem} aoOrdenar={aoOrdenar} />
                <CabecalhoOrdenavel coluna={COLUNAS_ORDENAVEIS[0]} ordem={ordem} aoOrdenar={aoOrdenar} />
                <CabecalhoOrdenavel coluna={COLUNAS_ORDENAVEIS[1]} ordem={ordem} aoOrdenar={aoOrdenar} />
              </tr>
            </thead>
            <tbody>
              {linhas.map((jogador) => (
                <tr key={jogador.player_id}>
                  <th scope="row" className="coluna-fixa">{jogador.nome}</th>
                  <td>
                    <span className="inline-flex items-center gap-2">
                      <MarcaAcademia clube={jogador.clube} tamanho={10} />
                      {ACADEMIAS[jogador.clube]?.academia ?? jogador.clube}
                    </span>
                  </td>
                  <td className="text-muted-foreground">{t(`posicoes.${jogador.position}`)}</td>
                  <td className="text-right">{numero(jogador.idade_estreia, 1)}</td>
                  <td className="text-right">{numero(jogador.indice_tecnico, 1)}</td>
                  <td className="text-right">{numero(jogador.indice_explosivo, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {linhas.length === 0 && <p className="py-10 text-center text-sm text-muted-foreground">{t("tabela.vazio")}</p>}
        </div>
      </div>
    </div>
  );
}
