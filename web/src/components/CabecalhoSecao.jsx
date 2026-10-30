// Abertura de seção: número do capítulo, título em duas linhas e texto de apoio no grid assimétrico.
export function CabecalhoSecao({ numero, linha1, linha2, children, id }) {
  return (
    <header className="grid grid-cols-12 gap-x-6 gap-y-8 border-t border-rule-strong pt-6 md:pt-8">
      <p className="num col-span-12 text-sm md:col-span-2" aria-hidden="true">
        {numero}
      </p>
      <h2 id={id} className="display col-span-12 text-[clamp(2.75rem,7vw,6.5rem)] font-semibold uppercase md:col-span-10">
        <span className="linha-mascara">
          <span data-revelar="texto">{linha1}</span>
        </span>
        <span className="linha-mascara">
          <span data-revelar="texto">{linha2}</span>
        </span>
      </h2>
      {children && (
        <div data-revelar="bloco" className="col-span-12 max-w-[62ch] text-base leading-relaxed text-muted-foreground md:col-span-6 md:col-start-3 lg:text-lg">
          {children}
        </div>
      )}
    </header>
  );
}
