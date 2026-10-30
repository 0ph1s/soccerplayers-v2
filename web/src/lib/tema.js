// Tema claro/escuro. O script em index.html aplica a classe antes da pintura; aqui só trocamos e guardamos.
// A troca usa a View Transitions API: o navegador tira uma foto da tela e revela o novo tema num círculo
// a partir do botão. É uma única animação na tela inteira, em vez de transicionar cada elemento.
import { useCallback, useState } from "react";

const CHAVE = "sa-tema";

function aplicar(novo) {
  document.documentElement.classList.toggle("dark", novo === "escuro");
  try {
    localStorage.setItem(CHAVE, novo);
  } catch {
    // Sem persistência; a troca vale só nesta visita.
  }
}

export function useTema() {
  const [tema, setTema] = useState(() =>
    document.documentElement.classList.contains("dark") ? "escuro" : "claro",
  );

  const alternar = useCallback((evento) => {
    const novo = document.documentElement.classList.contains("dark") ? "claro" : "escuro";
    const reduzir = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduzir) {
      aplicar(novo);
      setTema(novo);
      return;
    }

    // Origem do círculo: o botão clicado, ou o canto superior direito se veio do teclado.
    const x = evento?.clientX || window.innerWidth - 40;
    const y = evento?.clientY || 32;
    const raio = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transicao = document.startViewTransition(() => aplicar(novo));
    setTema(novo);
    transicao.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${raio}px at ${x}px ${y}px)`] },
          { duration: 520, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {
        // Transição cancelada (por exemplo, outra troca logo em seguida): o tema já foi aplicado.
      });
  }, []);

  return { tema, alternar };
}
