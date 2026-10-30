// Análise em pares (Mann-Whitney com Bonferroni): p bruto, p ajustado, diferença de medianas e rank-biserial.
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { INDICES } from "@/lib/dados";
import { cn } from "@/lib/utils";

function BarraEfeito({ valor }) {
  // Barra divergente de −1 a 1, centrada no zero.
  const largura = Math.min(Math.abs(valor), 1) * 50;
  return (
    <div className="relative h-3 w-24" aria-hidden="true">
      <div className="absolute inset-y-0 left-1/2 w-px bg-rule-strong" />
      <div
        className="absolute inset-y-0.5 bg-foreground"
        style={valor < 0 ? { right: "50%", width: `${largura}%` } : { left: "50%", width: `${largura}%` }}
      />
    </div>
  );
}

export function PainelTestes({ pares }) {
  const { t, numero, pValor } = useIdioma();
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <div className="col-span-12 lg:col-span-3">
        <h3 className="display text-3xl font-semibold">{t("pares.titulo")}</h3>
        <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("pares.descricao")}</p>
        <p className="rotulo mt-4 max-w-[36ch]">{t("pares.leituraEfeito")}</p>
      </div>

      <div className="col-span-12 flex flex-col gap-10 lg:col-span-9">
        {INDICES.map((indice) => (
          <div key={indice} className="overflow-x-auto" data-revelar="bloco">
            <table className="w-full min-w-[640px] text-sm">
              <caption className="display mb-3 text-left text-2xl font-semibold">{t(`indices.${indice}`)}</caption>
              <thead>
                <tr className="border-y border-rule-strong text-left text-muted-foreground">
                  <th scope="col" className="py-2 pr-4 font-normal">{t("pares.par")}</th>
                  <th scope="col" className="py-2 pr-4 text-right font-normal">{t("pares.pBruto")}</th>
                  <th scope="col" className="py-2 pr-4 text-right font-normal">{t("pares.pAjustado")}</th>
                  <th scope="col" className="py-2 pr-4 text-right font-normal">{t("pares.difMedianas")}</th>
                  <th scope="col" className="py-2 text-right font-normal" colSpan={2}>{t("pares.rankBiserial")}</th>
                </tr>
              </thead>
              <tbody>
                {pares
                  .filter((par) => par.indice === indice)
                  .map((par) => (
                    <tr
                      key={`${par.grupo_a}-${par.grupo_b}`}
                      className={cn("border-b border-rule", par.significativo && "bg-lime/40")}
                    >
                      <th scope="row" className="py-2.5 pr-4 text-left font-normal">
                        <span className="inline-flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="inline-flex items-center gap-1.5">
                            <MarcaAcademia clube={par.grupo_a} tamanho={10} />
                            {par.grupo_a}
                          </span>
                          <span className="text-muted-foreground" aria-hidden="true">×</span>
                          <span className="inline-flex items-center gap-1.5">
                            <MarcaAcademia clube={par.grupo_b} tamanho={10} />
                            {par.grupo_b}
                          </span>
                        </span>
                      </th>
                      <td className="num py-2.5 pr-4 text-right">{pValor(par.p_valor)}</td>
                      <td className="num py-2.5 pr-4 text-right">{pValor(par.p_bonferroni)}</td>
                      <td className="num py-2.5 pr-4 text-right">{numero(par.diferenca_medianas, 2)}</td>
                      <td className="num py-2.5 pr-3 text-right">{numero(par.rank_biserial, 2)}</td>
                      <td className="py-2.5">
                        <BarraEfeito valor={par.rank_biserial} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ))}
      </div>
    </div>
  );
}
