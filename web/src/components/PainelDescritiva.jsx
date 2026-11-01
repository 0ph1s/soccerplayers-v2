// Estatística descritiva: caixa Q1–Q3, linha mín–máx e mediana por academia, com a tabela dos valores.
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { ACADEMIAS, INDICES, linhaDescritiva } from "@/lib/dados";

function Caixa({ linha, clube }) {
  const { t, numero } = useIdioma();
  const { cor, linha: corLinha } = ACADEMIAS[clube];
  if (!linha || linha.n === 0) return <div className="h-10" />;
  const descricao = `${ACADEMIAS[clube].academia}: ${t("descritiva.minimo")} ${numero(linha.minimo, 1)}, ${t("descritiva.q1")} ${numero(linha.q1, 1)}, ${t("descritiva.mediana")} ${numero(linha.mediana, 1)}, ${t("descritiva.q3")} ${numero(linha.q3, 1)}, ${t("descritiva.maximo")} ${numero(linha.maximo, 1)}`;
  return (
    <div className="relative h-10" role="img" aria-label={descricao}>
      <div className="absolute top-1/2 h-px -translate-y-1/2 bg-rule-strong" style={{ left: `${linha.minimo}%`, width: `${linha.maximo - linha.minimo}%` }} />
      <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-rule-strong" style={{ left: `${linha.minimo}%` }} />
      <div className="absolute top-1/2 h-3 w-px -translate-y-1/2 bg-rule-strong" style={{ left: `${linha.maximo}%` }} />
      <div
        className="absolute inset-y-1.5 border"
        style={{
          left: `${linha.q1}%`,
          width: `${linha.q3 - linha.q1}%`,
          borderColor: corLinha,
          background: `color-mix(in oklab, ${cor} 26%, transparent)`,
        }}
      />
      <div className="absolute inset-y-0 w-[3px] -translate-x-1/2 bg-foreground" style={{ left: `${linha.mediana}%` }} />
    </div>
  );
}

function BlocoIndice({ descritiva, academias, indice }) {
  const { t, numero } = useIdioma();
  return (
    <article className="min-w-0 border-t border-rule-strong pt-6">
      <h4 className="display text-2xl font-semibold">{t(`indices.${indice}`)}</h4>

      <div className="mt-6" data-revelar="grafico">
        <div className="grid grid-cols-[minmax(7rem,9rem)_1fr] items-center gap-x-4">
          {academias.map((clube) => (
            <div key={clube} className="contents">
              <span className="flex items-center gap-2 border-b border-rule py-3 text-sm">
                <MarcaAcademia clube={clube} tamanho={12} />
                <span className="truncate">{ACADEMIAS[clube].academia}</span>
              </span>
              <div className="border-b border-rule">
                <Caixa linha={linhaDescritiva(descritiva, clube, indice)} clube={clube} />
              </div>
            </div>
          ))}
          <span />
          <div className="num mt-2 flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>
      </div>

      <div className="tabela-moldura mt-8">
        <table className="tabela tabela-compacta">
          <caption className="sr-only">
            {t("descritiva.titulo")}: {t(`indices.${indice}`)}
          </caption>
          <thead>
            <tr>
              <th scope="col">{t("descritiva.academia")}</th>
              <th scope="col" className="text-right">{t("descritiva.n")}</th>
              <th scope="col" className="text-right">{t("descritiva.mediana")}</th>
              <th scope="col" className="text-right">{t("descritiva.q1")}</th>
              <th scope="col" className="text-right">{t("descritiva.q3")}</th>
              <th scope="col" className="text-right">{t("descritiva.minimo")}</th>
              <th scope="col" className="text-right">{t("descritiva.maximo")}</th>
            </tr>
          </thead>
          <tbody>
            {academias.map((clube) => {
              const linha = linhaDescritiva(descritiva, clube, indice);
              return (
                <tr key={clube}>
                  <th scope="row">{clube}</th>
                  <td className="text-right">{linha?.n ?? "—"}</td>
                  <td className="text-right font-medium">{numero(linha?.mediana, 1)}</td>
                  <td className="text-right">{numero(linha?.q1, 1)}</td>
                  <td className="text-right">{numero(linha?.q3, 1)}</td>
                  <td className="text-right">{numero(linha?.minimo, 1)}</td>
                  <td className="text-right">{numero(linha?.maximo, 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

export function PainelDescritiva({ descritiva, academias }) {
  const { t } = useIdioma();
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <div className="col-span-12 lg:col-span-3">
        <h3 className="display text-3xl font-semibold">{t("descritiva.titulo")}</h3>
        <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("descritiva.descricao")}</p>
        <p className="rotulo mt-4 max-w-[36ch]">{t("descritiva.legenda")}</p>
      </div>
      <div className="col-span-12 grid min-w-0 grid-cols-1 gap-10 lg:col-span-9 xl:grid-cols-2 xl:gap-x-8">
        {INDICES.map((indice) => (
          <BlocoIndice key={indice} descritiva={descritiva} academias={academias} indice={indice} />
        ))}
      </div>
    </div>
  );
}
