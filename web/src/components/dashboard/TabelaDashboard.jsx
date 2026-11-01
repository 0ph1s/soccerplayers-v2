// Tabela compacta de jogadores: filtrada pela busca da barra lateral, com ordenação e exportação CSV.
import { ArrowDown, ArrowUp, ArrowUpDown, Download } from "lucide-react";
import { useMemo, useState } from "react";

import { Cartao } from "@/components/dashboard/Cartoes";
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { ACADEMIAS, exportarCsv } from "@/lib/dados";
import { cn } from "@/lib/utils";

const COLUNAS = [
  { chave: "indice_tecnico", rotulo: "tabela.tecnico" },
  { chave: "indice_explosivo", rotulo: "tabela.explosivo" },
  { chave: "idade_estreia", rotulo: "tabela.idade" },
];

function normalizar(texto) {
  return texto.toLocaleLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

export function TabelaDashboard({ id, jogadores, busca, modo, pool }) {
  const { t, numero } = useIdioma();
  const [ordem, setOrdem] = useState({ chave: "indice_tecnico", direcao: "desc" });

  const linhas = useMemo(() => {
    const termo = normalizar(busca.trim());
    const fator = ordem.direcao === "desc" ? -1 : 1;
    return jogadores
      .filter((j) => !termo || normalizar(j.nome).includes(termo))
      .sort((a, b) => ((a[ordem.chave] ?? -Infinity) - (b[ordem.chave] ?? -Infinity)) * fator);
  }, [jogadores, busca, ordem]);

  const ordenar = (chave) =>
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
        { rotulo: t("tabela.posicao"), valor: (j) => t(`posicoes.${j.position}`) },
        { rotulo: t("tabela.idade"), valor: (j) => j.idade_estreia },
        { rotulo: t("tabela.tecnico"), valor: (j) => j.indice_tecnico },
        { rotulo: t("tabela.explosivo"), valor: (j) => j.indice_explosivo },
      ],
      `soccer-analytics_${modo}_${pool}.csv`,
    );

  return (
    <Cartao
      id={id}
      titulo={
        <>
          {t("painel.tabelaTitulo")}
          <span className="tabular-nums">· {t("painel.resultados", { n: linhas.length, total: jogadores.length })}</span>
        </>
      }
      acao={
        <button
          type="button"
          onClick={exportar}
          disabled={linhas.length === 0}
          className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs transition-colors duration-300 hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Download className="size-3.5" aria-hidden="true" />
          {t("tabela.exportar")}
        </button>
      }
    >
      <div className="tabela-moldura max-h-[440px]" tabIndex={0} aria-label={t("painel.tabelaTitulo")}>
        <table className="tabela tabela-compacta">
          <thead>
            <tr>
              <th scope="col" className="coluna-fixa">{t("tabela.jogador")}</th>
              <th scope="col">{t("tabela.academia")}</th>
              <th scope="col">{t("tabela.posicao")}</th>
              {COLUNAS.map((coluna) => {
                const ativa = ordem.chave === coluna.chave;
                const Icone = !ativa ? ArrowUpDown : ordem.direcao === "desc" ? ArrowDown : ArrowUp;
                return (
                  <th
                    key={coluna.chave}
                    scope="col"
                    aria-sort={ativa ? (ordem.direcao === "desc" ? "descending" : "ascending") : "none"}
                    className="text-right"
                  >
                    <button
                      type="button"
                      onClick={() => ordenar(coluna.chave)}
                      aria-label={t("tabela.ordenar", { coluna: t(coluna.rotulo) })}
                      className={cn("inline-flex cursor-pointer items-center gap-1 hover:text-foreground", ativa && "text-foreground")}
                    >
                      {t(coluna.rotulo)}
                      <Icone className="size-3" aria-hidden="true" />
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {linhas.map((j) => (
              <tr key={j.player_id}>
                <th scope="row" className="coluna-fixa">{j.nome}</th>
                <td>
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <MarcaAcademia clube={j.clube} tamanho={10} />
                    {ACADEMIAS[j.clube]?.academia}
                  </span>
                </td>
                <td className="text-muted-foreground">{t(`posicoes.${j.position}`)}</td>
                <td className="text-right">{numero(j.indice_tecnico, 1)}</td>
                <td className="text-right">{numero(j.indice_explosivo, 1)}</td>
                <td className="text-right">{numero(j.idade_estreia, 1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {linhas.length === 0 && (
          <p className="px-3 py-10 text-center text-sm text-muted-foreground">{t("painel.semResultado", { busca })}</p>
        )}
      </div>
    </Cartao>
  );
}
