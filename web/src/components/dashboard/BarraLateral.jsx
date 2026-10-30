// Barra lateral da dashboard: busca (Ctrl/⌘ K), navegação entre cartões, configurações, leituras e fonte/método.
import {
  BookOpen,
  ChevronRight,
  Code2,
  FlaskConical,
  Landmark,
  LayoutDashboard,
  PanelLeft,
  Search,
  Settings,
  Users,
} from "lucide-react";
import { useState } from "react";

import { BotaoTema } from "@/components/Cabecalho";
import { IDIOMAS, useIdioma } from "@/i18n";
import { Link } from "@/lib/rota";
import { cn } from "@/lib/utils";

export const ITENS_NAVEGACAO = [
  { id: "dash-visao", chave: "painel.navVisao", Icone: LayoutDashboard },
  { id: "dash-jogadores", chave: "painel.navJogadores", Icone: Users },
  { id: "dash-academias", chave: "painel.navAcademias", Icone: Landmark },
  { id: "dash-testes", chave: "painel.navTestes", Icone: FlaskConical },
];

const EH_MAC = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);

function Pilula({ rotulo, opcoes, valor, aoMudar }) {
  return (
    <div role="group" aria-label={rotulo} className="grid grid-cols-2 rounded-lg bg-muted p-0.5">
      {opcoes.map((opcao) => (
        <button
          key={opcao.valor}
          type="button"
          aria-pressed={opcao.valor === valor}
          onClick={() => aoMudar(opcao.valor)}
          className={cn(
            "cursor-pointer rounded-md px-2 py-1 text-xs transition-colors duration-300",
            opcao.valor === valor ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opcao.rotulo}
        </button>
      ))}
    </div>
  );
}

export function BarraLateral({
  recolhido,
  aoRecolher,
  busca,
  aoBuscar,
  buscaRef,
  aoConfirmarBusca,
  ativa,
  aoIrPara,
  tema,
  alternarTema,
  modo,
  setModo,
  pool,
  setPool,
  movel = false,
}) {
  const { t, idioma, setIdioma } = useIdioma();
  const [configAberta, setConfigAberta] = useState(false);
  const compacta = recolhido && !movel;

  const itemClasse = (ativo) =>
    cn(
      "flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-colors duration-300",
      compacta && "justify-center px-0",
      ativo ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
    );

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto p-3">
      <div className={cn("flex items-center gap-2 px-1 pt-1", compacta ? "flex-col" : "justify-between")}>
        <Link para="/" className="flex items-center gap-2" aria-label={t("painel.publicacao")}>
          <span className="display grid size-7 place-items-center rounded-md bg-lime text-[11px] font-bold text-lime-ink">SA</span>
          {!compacta && <span className="display text-sm font-semibold tracking-tight">SOCCER/ANALYTICS</span>}
        </Link>
        {!movel && (
          <button
            type="button"
            onClick={aoRecolher}
            aria-label={recolhido ? t("painel.expandir") : t("painel.recolher")}
            title={recolhido ? t("painel.expandir") : t("painel.recolher")}
            className="grid size-8 cursor-pointer place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <PanelLeft className="size-4" aria-hidden="true" />
          </button>
        )}
      </div>

      {compacta ? (
        <button
          type="button"
          onClick={() => {
            aoRecolher();
            requestAnimationFrame(() => buscaRef.current?.focus());
          }}
          aria-label={t("painel.buscar")}
          className={itemClasse(false)}
        >
          <Search className="size-4" aria-hidden="true" />
        </button>
      ) : (
        <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-2 text-sm focus-within:border-foreground">
          <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          <span className="sr-only">{t("painel.buscar")}</span>
          <input
            ref={buscaRef}
            type="search"
            value={busca}
            onChange={(evento) => aoBuscar(evento.target.value)}
            onKeyDown={(evento) => evento.key === "Enter" && aoConfirmarBusca()}
            placeholder={`${t("painel.buscar")}…`}
            className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground"
          />
          <kbd className="hidden shrink-0 rounded border border-border px-1.5 text-[10px] text-muted-foreground sm:inline">
            {EH_MAC ? "⌘K" : "Ctrl K"}
          </kbd>
        </label>
      )}

      <nav aria-label={t("painel.plataforma")}>
        {!compacta && <p className="mb-1 px-2.5 text-xs text-muted-foreground">{t("painel.plataforma")}</p>}
        <ul className="flex flex-col gap-0.5">
          {ITENS_NAVEGACAO.map(({ id, chave, Icone }) => (
            <li key={id}>
              <button
                type="button"
                onClick={() => aoIrPara(id)}
                aria-current={ativa === id ? "true" : undefined}
                title={compacta ? t(chave) : undefined}
                aria-label={compacta ? t(chave) : undefined}
                className={itemClasse(ativa === id)}
              >
                <Icone className="size-4 shrink-0" aria-hidden="true" />
                {!compacta && t(chave)}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div>
        {!compacta && <p className="mb-1 px-2.5 text-xs text-muted-foreground">{t("painel.sistema")}</p>}
        <button
          type="button"
          onClick={() => (compacta ? aoRecolher() : setConfigAberta((aberta) => !aberta))}
          aria-expanded={compacta ? undefined : configAberta}
          title={compacta ? t("painel.configuracoes") : undefined}
          aria-label={compacta ? t("painel.configuracoes") : undefined}
          className={itemClasse(false)}
        >
          <Settings className="size-4 shrink-0" aria-hidden="true" />
          {!compacta && (
            <>
              <span className="flex-1 text-left">{t("painel.configuracoes")}</span>
              <ChevronRight
                className={cn("size-4 transition-transform duration-300", configAberta && "rotate-90")}
                aria-hidden="true"
              />
            </>
          )}
        </button>
        {configAberta && !compacta && (
          <div className="mt-2 flex items-center justify-between gap-2 px-2.5">
            <div role="group" aria-label={t("nav.idioma")} className="flex gap-0.5">
              {Object.entries(IDIOMAS).map(([codigo, { rotulo, nome, tag }]) => (
                <button
                  key={codigo}
                  type="button"
                  lang={tag}
                  aria-label={nome}
                  aria-pressed={idioma === codigo}
                  onClick={() => setIdioma(codigo)}
                  className={cn(
                    "cursor-pointer rounded px-1.5 py-1 text-xs transition-colors",
                    idioma === codigo ? "bg-lime text-lime-ink" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {rotulo}
                </button>
              ))}
            </div>
            <BotaoTema tema={tema} alternar={alternarTema} className="size-8 rounded-md" />
          </div>
        )}
      </div>

      <div className="mt-auto flex flex-col gap-3">
        {!compacta && (
          <div className="rounded-xl border border-border bg-muted/40 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
              <BookOpen className="size-3.5" aria-hidden="true" />
              {t("painel.leiaTambem")}
            </p>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li>
                <Link para="/#metodo" className="hover:underline">
                  {t("painel.linkMetodo")}
                </Link>
              </li>
              <li>
                <Link para="/#pool" className="hover:underline">
                  {t("painel.linkPool")}
                </Link>
              </li>
              <li>
                <a href="https://github.com/0ph1s/soccerplayers-v2" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:underline">
                  <Code2 className="size-3.5" aria-hidden="true" />
                  {t("painel.linkRepo")}
                </a>
              </li>
            </ul>
          </div>
        )}

        <Link
          para="/"
          title={compacta ? t("painel.publicacao") : undefined}
          aria-label={compacta ? t("painel.publicacao") : undefined}
          className={itemClasse(false)}
        >
          <BookOpen className="size-4 shrink-0" aria-hidden="true" />
          {!compacta && t("painel.publicacao")}
        </Link>

        {!compacta && (
          <div className="rounded-xl border border-border p-3">
            <p className="mb-2 text-xs text-muted-foreground">{t("painel.fonteMetodo")}</p>
            <div className="flex flex-col gap-1.5">
              <Pilula
                rotulo={t("controles.fonte")}
                opcoes={[
                  { valor: "snapshot", rotulo: t("controles.snapshot") },
                  { valor: "raw", rotulo: t("controles.raw") },
                ]}
                valor={modo}
                aoMudar={setModo}
              />
              <Pilula
                rotulo={t("controles.metodo")}
                opcoes={[
                  { valor: "artigo", rotulo: t("controles.artigo") },
                  { valor: "corrigido", rotulo: t("controles.corrigido") },
                ]}
                valor={pool}
                aoMudar={setPool}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
