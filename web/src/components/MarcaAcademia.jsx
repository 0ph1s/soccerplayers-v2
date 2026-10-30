// Marca de cada academia: a mesma forma usada nos pontos do gráfico de dispersão.
import { ACADEMIAS } from "@/lib/dados";
import { caminhoForma } from "@/lib/formas";

export function MarcaAcademia({ clube, tamanho = 12, className }) {
  const meta = ACADEMIAS[clube];
  if (!meta) return null;
  return (
    <svg width={tamanho} height={tamanho} viewBox="0 0 12 12" aria-hidden="true" className={className}>
      <path d={caminhoForma(meta.forma, 6, 6, 4.4)} fill={meta.cor} stroke="var(--marca-contorno)" strokeWidth="0.9" />
    </svg>
  );
}
