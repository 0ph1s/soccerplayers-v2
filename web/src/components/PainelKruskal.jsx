// Kruskal-Wallis por índice: H, p, α, veredito e onde o p cai na escala de 0 a 1.
import { useIdioma } from "@/i18n";
import { cn } from "@/lib/utils";

function EscalaP({ p, alpha }) {
  const { t, numero } = useIdioma();
  return (
    <figure className="mt-6">
      <div className="relative h-8" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 bg-lime" style={{ width: `${alpha * 100}%` }} />
        <div className="absolute inset-x-0 top-1/2 h-px bg-rule-strong" />
        <div className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-foreground" style={{ left: `${Math.min(p, 1) * 100}%` }} />
      </div>
      <div className="num mt-1.5 flex justify-between text-[11px] text-muted-foreground" aria-hidden="true">
        <span>0</span>
        <span>{numero(0.5, 1)}</span>
        <span>1</span>
      </div>
      <figcaption className="mt-3 text-xs text-muted-foreground">{t("kruskal.escala")}</figcaption>
    </figure>
  );
}

export function PainelKruskal({ kruskal }) {
  const { t, numero, pValor } = useIdioma();
  return (
    <div className="grid grid-cols-12 gap-x-6 gap-y-10">
      <div className="col-span-12 lg:col-span-3">
        <h3 className="display text-3xl font-semibold">{t("kruskal.titulo")}</h3>
        <p className="mt-3 max-w-[36ch] text-sm leading-relaxed text-muted-foreground">{t("kruskal.descricao")}</p>
      </div>
      {kruskal.map((teste) => (
        <article
          key={teste.indice}
          className="col-span-12 border-t border-rule pt-6 md:col-span-6 lg:col-span-4 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-6 lg:first-of-type:col-start-5"
        >
          <header className="flex items-start justify-between gap-4">
            <h4 className="display text-xl font-semibold">{t(`indices.${teste.indice}`)}</h4>
            <span
              className={cn(
                "num px-2 py-1 text-xs",
                teste.significativo ? "bg-lime text-lime-ink" : "border border-rule-strong",
              )}
            >
              {teste.significativo ? t("kruskal.significativo") : t("kruskal.naoSignificativo")}
            </span>
          </header>
          <p className="mt-6 flex items-baseline gap-3">
            <span className="text-sm text-muted-foreground">{t("kruskal.p")}</span>
            <span className="num text-6xl leading-none font-medium tracking-tight">{pValor(teste.p_valor)}</span>
          </p>
          <dl className="num mt-5 grid grid-cols-2 gap-4 border-t border-rule pt-4 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("kruskal.h")}</dt>
              <dd className="mt-1 text-lg">{numero(teste.H, 4)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("kruskal.alpha")}</dt>
              <dd className="mt-1 text-lg">{numero(teste.alpha, 2)}</dd>
            </div>
          </dl>
          <EscalaP p={teste.p_valor} alpha={teste.alpha} />
          <p className="mt-4 text-sm">{teste.significativo ? t("kruskal.leituraSim") : t("kruskal.leituraNao")}</p>
        </article>
      ))}
    </div>
  );
}
