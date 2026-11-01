// Comparações em pares: p ajustado por Bonferroni e rank-biserial de cada par, por índice.
import { useState } from "react";

import { Cartao, Pilulas } from "@/components/dashboard/Cartoes";
import { MarcaAcademia } from "@/components/MarcaAcademia";
import { useIdioma } from "@/i18n";
import { cn } from "@/lib/utils";

function Barra({ valor }) {
  const largura = Math.min(Math.abs(valor), 1) * 50;
  return (
    <span className="relative block h-1.5 w-32 rounded-full bg-muted" aria-hidden="true">
      <span className="absolute inset-y-0 left-1/2 w-px bg-muted-foreground" />
      <span
        className="absolute inset-y-0 rounded-full bg-foreground"
        style={valor < 0 ? { right: "50%", width: `${largura}%` } : { left: "50%", width: `${largura}%` }}
      />
    </span>
  );
}

export function CartaoPares({ id, pares }) {
  const { t, numero, pValor } = useIdioma();
  const [indice, setIndice] = useState("indice_tecnico");

  return (
    <Cartao
      id={id}
      titulo={t("painel.paresTitulo")}
      info={t("pares.descricao")}
      acao={
        <Pilulas
          rotulo={t("painel.paresTitulo")}
          opcoes={[
            { valor: "indice_tecnico", rotulo: t("indices.indice_tecnico") },
            { valor: "indice_explosivo", rotulo: t("indices.indice_explosivo") },
          ]}
          valor={indice}
          aoMudar={setIndice}
        />
      }
    >
      <div className="tabela-moldura">
        <table className="tabela tabela-compacta">
          <thead>
            <tr>
              <th scope="col">{t("pares.par")}</th>
              <th scope="col" className="text-right">{t("pares.pAjustado")}</th>
              <th scope="col" className="text-right">{t("pares.rankBiserial")}</th>
              <th scope="col" className="hidden sm:table-cell">
                <span className="sr-only">{t("pares.rankBiserial")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {pares
              .filter((par) => par.indice === indice)
              .map((par) => (
                <tr key={`${par.grupo_a}-${par.grupo_b}`} className={cn(par.significativo && "bg-lime/30")}>
                  <th scope="row">
                    <span className="flex items-center gap-1.5">
                      <MarcaAcademia clube={par.grupo_a} tamanho={10} />
                      <MarcaAcademia clube={par.grupo_b} tamanho={10} />
                      <span>
                        {par.grupo_a} × {par.grupo_b}
                      </span>
                    </span>
                  </th>
                  <td className="text-right">{pValor(par.p_bonferroni)}</td>
                  <td className="text-right">{numero(par.rank_biserial, 2)}</td>
                  <td className="hidden sm:table-cell">
                    <Barra valor={par.rank_biserial} />
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Cartao>
  );
}
