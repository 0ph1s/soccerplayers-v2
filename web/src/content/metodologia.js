// Conteúdo fixo da metodologia. Não é calculado aqui: espelha arquivos do projeto.

// Espelha config/metricas.yaml. Se o YAML mudar, atualize esta lista.
export const PESOS = {
  indice_tecnico: [
    { metrica: "accuratePasses", fonte: "snapshot", peso: 1.0 },
    { metrica: "accurateFinalThirdPasses", fonte: "snapshot", peso: 1.5 },
    { metrica: "keyPasses", fonte: "snapshot", peso: 1.5 },
    { metrica: "expectedAssists", fonte: "snapshot", peso: 1.5 },
    { metrica: "successfulDribbles", fonte: "snapshot", peso: 1.0 },
    { metrica: "assists", fonte: "aparicoes", peso: 0.8 },
    { metrica: "goals", fonte: "aparicoes", peso: 0.7 },
  ],
  indice_explosivo: [
    { metrica: "successfulDribbles", fonte: "snapshot", peso: 1.2 },
    { metrica: "aerialDuelsWon", fonte: "snapshot", peso: 1.5 },
    { metrica: "groundDuelsWon", fonte: "snapshot", peso: 1.3 },
    { metrica: "metersCoveredSprinting", fonte: "snapshot", peso: 1.2 },
    { metrica: "numberOfSprints", fonte: "snapshot", peso: 1.0 },
    { metrica: "height_in_cm", fonte: "jogador", peso: 0.8 },
  ],
};

export const MAIOR_PESO = 1.5;

// Espelha a tabela "Validação contra o artigo" do README (snapshot, método Artigo).
// Cada valor é [número, casas decimais]; "faixa" junta dois valores, "lista" vários.
export const VALIDACAO = [
  { chave: "kwExplosivo", tipo: "par", artigo: [[2.2489, 4], [0.5224, 4]], projeto: [[2.2489, 4], [0.5224, 4]], igual: true },
  { chave: "kwTecnico", tipo: "par", artigo: [[2.2551, 4], [0.5212, 4]], projeto: [[2.2058, 4], [0.5308, 4]], igual: false },
  { chave: "mwTecnico", tipo: "faixa", artigo: [[0.192, 3], [0.638, 3]], projeto: [[0.204, 3], [0.723, 3]], igual: false },
  { chave: "mwExplosivo", tipo: "faixa", artigo: [[0.21, 3], [0.943, 3]], projeto: [[0.21, 3], [0.943, 3]], igual: true },
  { chave: "medianaLiverpool", tipo: "lista", artigo: [[67, 0]], projeto: [[62.6, 1]], igual: false },
  { chave: "idades", tipo: "lista", artigo: [[19.0, 1], [19.3, 1], [19.3, 1], [21.0, 1]], projeto: [[19.0, 1], [19.3, 1], [19.3, 1], [21.0, 1]], igual: true },
  { chave: "bonferroni", tipo: "texto", artigo: "nenhum", projeto: "nenhum", igual: true },
];
