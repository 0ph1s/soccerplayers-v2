// Rodapé: instituição, equipe e origem dos dados.
import { useIdioma } from "@/i18n";

// Equipe conforme o artigo e o README do projeto original.
const EQUIPE = ["Arthur Martins", "Guilherme Onorio", "Octavio Teodoro", "Peterson Carara"];

export function Rodape({ geradoEm }) {
  const { t, data } = useIdioma();
  return (
    <footer className="mx-auto mt-32 max-w-[1440px] px-4 pb-10 md:mt-48 md:px-8">
      <div className="grid grid-cols-12 gap-x-6 gap-y-10 border-t border-rule-strong pt-8">
        <p className="display col-span-12 text-[clamp(2.5rem,9vw,8rem)] leading-[0.85] font-bold md:col-span-7">
          SOCCER
          <br />
          /ANALYTICS
        </p>
        <div className="col-span-12 flex flex-col gap-6 text-sm md:col-span-5">
          <p>{t("rodape.instituicao")}</p>
          <div>
            <p className="rotulo">{t("rodape.equipe")}</p>
            <ul className="mt-2 grid grid-cols-2 gap-1">
              {EQUIPE.map((nome) => (
                <li key={nome}>{nome}</li>
              ))}
            </ul>
          </div>
          <p className="max-w-[52ch] text-muted-foreground">{t("rodape.dados")}</p>
          {geradoEm && <p className="num text-xs text-muted-foreground">{t("controles.gerado", { data: data(geradoEm) })}</p>}
          <a href="#inicio" className="self-start border-b border-rule-strong pb-1 font-medium transition-colors hover:border-lime">
            {t("rodape.voltar")}
          </a>
        </div>
      </div>
    </footer>
  );
}
