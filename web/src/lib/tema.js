// Tema claro/escuro. O script em index.html aplica a classe antes da pintura; aqui só trocamos e guardamos.
import { useCallback, useState } from "react";

const CHAVE = "sa-tema";

export function useTema() {
  const [tema, setTema] = useState(() =>
    document.documentElement.classList.contains("dark") ? "escuro" : "claro",
  );

  const alternar = useCallback(() => {
    const raiz = document.documentElement;
    const novo = raiz.classList.contains("dark") ? "claro" : "escuro";
    // A classe de transição fica só durante a troca, para não pesar em outras animações.
    raiz.classList.add("tema-transicao");
    raiz.classList.toggle("dark", novo === "escuro");
    window.setTimeout(() => raiz.classList.remove("tema-transicao"), 450);
    try {
      localStorage.setItem(CHAVE, novo);
    } catch {
      // Sem persistência; a troca vale só nesta visita.
    }
    setTema(novo);
  }, []);

  return { tema, alternar };
}
