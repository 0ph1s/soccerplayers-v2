// Idioma da interface: troca sem recarregar, guarda a escolha e formata números no padrão local.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import en from "./en";
import es from "./es";
import fr from "./fr";
import pt from "./pt";

export const IDIOMAS = {
  pt: { rotulo: "PT", nome: "Português", tag: "pt-BR", dicionario: pt },
  es: { rotulo: "ES", nome: "Español", tag: "es-ES", dicionario: es },
  en: { rotulo: "EN", nome: "English", tag: "en-GB", dicionario: en },
  fr: { rotulo: "FR", nome: "Français", tag: "fr-FR", dicionario: fr },
};

const CHAVE = "sa-idioma";
const ContextoIdioma = createContext(null);

function idiomaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE);
    if (salvo && IDIOMAS[salvo]) return salvo;
  } catch {
    // localStorage indisponível (modo privado): segue com o padrão.
  }
  return "pt";
}

function buscar(dicionario, chave) {
  return chave.split(".").reduce((no, parte) => (no == null ? undefined : no[parte]), dicionario);
}

export function ProvedorIdioma({ children }) {
  const [idioma, setIdiomaEstado] = useState(idiomaInicial);
  const config = IDIOMAS[idioma];

  const setIdioma = useCallback((novo) => {
    if (!IDIOMAS[novo]) return;
    setIdiomaEstado(novo);
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      // Sem persistência; a troca vale só nesta visita.
    }
  }, []);

  // O título da aba fica a cargo de cada página (publicação e dashboard).
  useEffect(() => {
    document.documentElement.lang = config.tag;
  }, [config]);

  const valor = useMemo(() => {
    const formatadores = new Map();
    const formatador = (casas) => {
      if (!formatadores.has(casas)) {
        formatadores.set(
          casas,
          new Intl.NumberFormat(config.tag, { minimumFractionDigits: casas, maximumFractionDigits: casas }),
        );
      }
      return formatadores.get(casas);
    };

    const t = (chave, variaveis) => {
      const texto = buscar(config.dicionario, chave) ?? buscar(pt, chave) ?? chave;
      if (!variaveis || typeof texto !== "string") return texto;
      return texto.replace(/\{(\w+)\}/g, (_, nome) => (variaveis[nome] ?? `{${nome}}`));
    };

    const numero = (valor, casas = 1) => {
      if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
      return formatador(casas).format(valor);
    };

    // p-valores: três casas, e "< 0,001" quando for menor que isso.
    const pValor = (valor) => {
      if (valor === null || valor === undefined) return "—";
      if (valor < 0.001) return `< ${formatador(3).format(0.001)}`;
      return formatador(3).format(valor);
    };

    const data = (iso) => {
      const instante = new Date(iso);
      if (Number.isNaN(instante.getTime())) return "—";
      return new Intl.DateTimeFormat(config.tag, { dateStyle: "long", timeStyle: "short" }).format(instante);
    };

    return { idioma, setIdioma, tag: config.tag, t, numero, pValor, data };
  }, [idioma, config, setIdioma]);

  return <ContextoIdioma.Provider value={valor}>{children}</ContextoIdioma.Provider>;
}

export function useIdioma() {
  const contexto = useContext(ContextoIdioma);
  if (!contexto) throw new Error("useIdioma precisa estar dentro de <ProvedorIdioma>.");
  return contexto;
}
