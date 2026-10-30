// Geometria das marcas de academia, compartilhada pela legenda e pela arte do hero.
export function caminhoForma(forma, cx, cy, r) {
  switch (forma) {
    case "square":
      return `M${cx - r * 0.86},${cy - r * 0.86}h${r * 1.72}v${r * 1.72}h${-r * 1.72}z`;
    case "triangle":
      return `M${cx},${cy - r * 1.1}L${cx + r},${cy + r * 0.75}L${cx - r},${cy + r * 0.75}z`;
    case "diamond":
      return `M${cx},${cy - r * 1.15}L${cx + r * 1.15},${cy}L${cx},${cy + r * 1.15}L${cx - r * 1.15},${cy}z`;
    default:
      return `M${cx - r},${cy}a${r},${r} 0 1,0 ${r * 2},0a${r},${r} 0 1,0 ${-r * 2},0`;
  }
}
