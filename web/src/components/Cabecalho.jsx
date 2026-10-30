// Cabeçalho fixo: logo tipográfico, seções, dashboard, idioma e tema.
// Animações (GSAP): entrada ao carregar, esconde ao descer e volta ao subir, barra de progresso da leitura
// e um indicador que desliza até a seção ativa.
import { LayoutDashboard, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { IDIOMAS, useIdioma } from "@/i18n";
import { COM_MOVIMENTO, gsap, ScrollTrigger, useGSAP } from "@/lib/animacao";
import { Link } from "@/lib/rota";
import { useTema } from "@/lib/tema";
import { cn } from "@/lib/utils";

const SECOES = [
  { id: "visao", chave: "nav.visao" },
  { id: "analise", chave: "nav.analise" },
  { id: "metodo", chave: "nav.metodo" },
  { id: "pool", chave: "nav.pool" },
];

function useSecaoAtiva() {
  const [ativa, setAtiva] = useState(null);
  useEffect(() => {
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => entrada.isIntersecting && setAtiva(entrada.target.id));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    SECOES.forEach(({ id }) => {
      const elemento = document.getElementById(id);
      if (elemento) observador.observe(elemento);
    });
    // Acima da primeira seção (no hero), nenhum item fica ativo.
    const inicio = document.getElementById("inicio");
    const observadorInicio = new IntersectionObserver(
      ([entrada]) => entrada.isIntersecting && setAtiva(null),
      { rootMargin: "-45% 0px -50% 0px" },
    );
    if (inicio) observadorInicio.observe(inicio);
    return () => {
      observador.disconnect();
      observadorInicio.disconnect();
    };
  }, []);
  return ativa;
}

function SeletorIdioma({ className }) {
  const { idioma, setIdioma, t } = useIdioma();
  return (
    <div role="group" aria-label={t("nav.idioma")} className={cn("flex items-center", className)}>
      {Object.entries(IDIOMAS).map(([codigo, { rotulo, nome, tag }]) => (
        <button
          key={codigo}
          type="button"
          lang={tag}
          title={nome}
          aria-label={nome}
          aria-pressed={idioma === codigo}
          onClick={() => setIdioma(codigo)}
          className={cn(
            "num cursor-pointer px-1.5 py-1 text-xs transition-colors duration-300",
            idioma === codigo ? "bg-lime text-lime-ink" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {rotulo}
        </button>
      ))}
    </div>
  );
}

export function BotaoTema({ tema, alternar, className }) {
  const { t } = useIdioma();
  const escuro = tema === "escuro";
  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={escuro ? t("nav.temaClaro") : t("nav.temaEscuro")}
      title={escuro ? t("nav.temaClaro") : t("nav.temaEscuro")}
      className={cn(
        "group flex size-9 cursor-pointer items-center justify-center border border-rule-strong transition-colors duration-300 hover:bg-lime hover:text-lime-ink",
        className,
      )}
    >
      <span className="transition-transform duration-500 ease-out group-hover:rotate-45">
        {escuro ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
      </span>
    </button>
  );
}

export function Cabecalho() {
  const { t } = useIdioma();
  const ativa = useSecaoAtiva();
  const { tema, alternar } = useTema();
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuMontado, setMenuMontado] = useState(false);
  const painelMenu = useRef(null);
  const [rolou, setRolou] = useState(false);

  const raiz = useRef(null);
  const barra = useRef(null);
  const indicador = useRef(null);
  const lista = useRef(null);
  const menuAbertoRef = useRef(false);
  useEffect(() => {
    menuAbertoRef.current = menuAberto;
  }, [menuAberto]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add({ movimento: COM_MOVIMENTO, reduzido: "(prefers-reduced-motion: reduce)" }, (contexto) => {
        const { movimento } = contexto.conditions;

        if (movimento) {
          gsap.from("[data-entrada]", { y: -18, autoAlpha: 0, duration: 0.9, ease: "power3.out", stagger: 0.06, delay: 0.15 });
        }

        // Barra de progresso: acompanha a leitura da página inteira.
        gsap.fromTo(
          barra.current,
          { scaleX: 0 },
          { scaleX: 1, ease: "none", scrollTrigger: { start: 0, end: "max", scrub: movimento ? 0.4 : true } },
        );

        // Esconde ao descer depois do hero; volta ao subir. Fica visível com o menu móvel aberto.
        let oculto = false;
        let compacto = false;
        ScrollTrigger.create({
          start: 0,
          end: "max",
          onUpdate: (self) => {
            const posicao = self.scroll();
            const deveCompactar = posicao > 16;
            if (deveCompactar !== compacto) {
              compacto = deveCompactar;
              setRolou(deveCompactar);
            }
            const deveOcultar = self.direction === 1 && posicao > 520 && !menuAbertoRef.current;
            const deveMostrar = self.direction === -1 || posicao <= 520;
            if (deveOcultar && !oculto) {
              oculto = true;
              gsap.to(raiz.current, { yPercent: -100, duration: movimento ? 0.5 : 0, ease: "power3.inOut", overwrite: true });
            } else if (deveMostrar && oculto) {
              oculto = false;
              gsap.to(raiz.current, { yPercent: 0, duration: movimento ? 0.6 : 0, ease: "power3.out", overwrite: true });
            }
          },
        });
      });
      return () => mm.revert();
    },
    { scope: raiz },
  );

  // Indicador deslizante da seção ativa (recalcula quando muda a seção ou o idioma, que muda a largura dos itens).
  const { idioma } = useIdioma();
  useLayoutEffect(() => {
    const ul = lista.current;
    const marcador = indicador.current;
    if (!ul || !marcador) return;
    const link = ativa ? ul.querySelector(`a[href="#${ativa}"]`) : null;
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!link) {
      gsap.to(marcador, { autoAlpha: 0, duration: reduzir ? 0 : 0.3 });
      return;
    }
    const base = ul.getBoundingClientRect();
    const caixa = link.getBoundingClientRect();
    gsap.to(marcador, {
      x: caixa.left - base.left,
      width: caixa.width,
      autoAlpha: 1,
      duration: reduzir ? 0 : 0.55,
      ease: "power3.out",
    });
  }, [ativa, idioma]);

  const abrirMenu = () => {
    setMenuMontado(true);
    setMenuAberto(true);
  };
  const fecharMenu = () => setMenuAberto(false);

  // Abre descendo com os itens em cascata; fecha recolhendo e só então desmonta o painel.
  useGSAP(
    () => {
      const painel = painelMenu.current;
      if (!painel) return;
      const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const itens = painel.querySelectorAll("[data-item-menu]");
      if (menuAberto) {
        gsap.fromTo(
          painel,
          { height: 0, autoAlpha: 0 },
          { height: "auto", autoAlpha: 1, duration: reduzir ? 0 : 0.5, ease: "power3.out", overwrite: true },
        );
        gsap.fromTo(
          itens,
          { y: 18, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: reduzir ? 0 : 0.45, ease: "power3.out", stagger: reduzir ? 0 : 0.05, delay: reduzir ? 0 : 0.1 },
        );
      } else {
        gsap.to(itens, { y: -8, autoAlpha: 0, duration: reduzir ? 0 : 0.2, ease: "power2.in", stagger: reduzir ? 0 : { each: 0.03, from: "end" } });
        gsap.to(painel, {
          height: 0,
          autoAlpha: 0,
          duration: reduzir ? 0 : 0.4,
          delay: reduzir ? 0 : 0.1,
          ease: "power3.inOut",
          overwrite: true,
          onComplete: () => setMenuMontado(false),
        });
      }
    },
    { dependencies: [menuAberto, menuMontado] },
  );

  useEffect(() => {
    if (!menuAberto) return undefined;
    const aoTeclar = (evento) => evento.key === "Escape" && fecharMenu();
    window.addEventListener("keydown", aoTeclar);
    return () => window.removeEventListener("keydown", aoTeclar);
  }, [menuAberto]);

  return (
    <header
      ref={raiz}
      className={cn(
        "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,padding] duration-500 ease-out",
        rolou ? "border-rule bg-background/85 py-2 backdrop-blur-md" : "border-transparent py-4",
      )}
    >
      <a
        href="#analise"
        className="num absolute top-2 left-4 -translate-y-24 bg-lime px-3 py-2 text-xs text-lime-ink focus:translate-y-0"
      >
        {t("nav.pular")}
      </a>
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-6 px-4 md:px-8">
        <a href="#inicio" data-entrada aria-label={t("nav.inicio")} className="display text-lg leading-none font-bold tracking-tight">
          SOCCER<span className="text-muted-foreground">/</span>ANALYTICS
        </a>

        <nav aria-label={t("nav.principal")} className="hidden lg:block">
          <ul ref={lista} className="relative flex items-center gap-7">
            {SECOES.map(({ id, chave }) => (
              <li key={id} data-entrada>
                <a
                  href={`#${id}`}
                  aria-current={ativa === id ? "location" : undefined}
                  className={cn(
                    "py-1 text-sm transition-colors duration-300",
                    ativa === id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {t(chave)}
                </a>
              </li>
            ))}
            <li data-entrada>
              <Link
                para="/dashboard"
                className="inline-flex items-center gap-1.5 border border-rule-strong px-2.5 py-1 text-sm transition-colors duration-300 hover:bg-lime hover:text-lime-ink"
              >
                <LayoutDashboard className="size-3.5" aria-hidden="true" />
                {t("nav.dashboard")}
              </Link>
            </li>
            <li
              ref={indicador}
              aria-hidden="true"
              className="pointer-events-none invisible absolute -bottom-1 left-0 h-0.5 w-0 bg-lime opacity-0"
            />
          </ul>
        </nav>

        <div className="hidden items-center gap-3 lg:flex" data-entrada>
          <SeletorIdioma />
          <BotaoTema tema={tema} alternar={alternar} />
        </div>

        <div className="flex items-center gap-2 lg:hidden" data-entrada>
          <BotaoTema tema={tema} alternar={alternar} />
          <button
            type="button"
            aria-expanded={menuAberto}
            aria-controls="menu-movel"
            aria-label={menuAberto ? t("nav.fecharMenu") : t("nav.abrirMenu")}
            onClick={() => (menuAberto ? fecharMenu() : abrirMenu())}
            className="relative flex size-9 cursor-pointer items-center justify-center border border-rule-strong"
          >
            {/* Os dois ícones ficam sobrepostos e trocam com giro e esmaecimento. */}
            <Menu
              aria-hidden="true"
              className={cn(
                "absolute size-4 transition-all duration-300 ease-out",
                menuAberto ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
              )}
            />
            <X
              aria-hidden="true"
              className={cn(
                "absolute size-4 transition-all duration-300 ease-out",
                menuAberto ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
              )}
            />
          </button>
        </div>
      </div>

      <div
        ref={barra}
        aria-hidden="true"
        className="absolute inset-x-0 -bottom-px h-0.5 origin-left scale-x-0 bg-lime"
      />

      {menuMontado && (
        <div id="menu-movel" ref={painelMenu} className="invisible h-0 overflow-hidden border-t border-rule bg-background px-4 lg:hidden">
          <div className="pt-4 pb-6">
          <nav aria-label={t("nav.principal")}>
            <ul className="flex flex-col">
              {SECOES.map(({ id, chave }) => (
                <li key={id} data-item-menu className="border-b border-rule">
                  <a
                    href={`#${id}`}
                    onClick={fecharMenu}
                    aria-current={ativa === id ? "location" : undefined}
                    className="display block py-3 text-2xl font-semibold"
                  >
                    {t(chave)}
                  </a>
                </li>
              ))}
              <li data-item-menu className="border-b border-rule">
                <Link para="/dashboard" className="display flex items-center gap-2 py-3 text-2xl font-semibold">
                  <LayoutDashboard className="size-5" aria-hidden="true" />
                  {t("nav.dashboard")}
                </Link>
              </li>
            </ul>
          </nav>
          <div data-item-menu>
            <SeletorIdioma className="mt-5 gap-1" />
          </div>
          </div>
        </div>
      )}
    </header>
  );
}
