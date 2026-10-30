// Preferência do sistema por menos movimento; usada para desligar as animações do Recharts.
import { useEffect, useState } from "react";

const CONSULTA = "(prefers-reduced-motion: reduce)";

export function usePrefereMenosMovimento() {
  const [reduzir, setReduzir] = useState(() => window.matchMedia(CONSULTA).matches);
  useEffect(() => {
    const consulta = window.matchMedia(CONSULTA);
    const aoMudar = () => setReduzir(consulta.matches);
    consulta.addEventListener("change", aoMudar);
    return () => consulta.removeEventListener("change", aoMudar);
  }, []);
  return reduzir;
}
