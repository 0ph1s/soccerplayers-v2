// Carregamento dos resultados gerados pelo pipeline Python e metadados fixos das academias.
// Nenhum cálculo estatístico acontece aqui: o front só lê e mostra o que está nos JSONs.
import { useEffect, useState } from "react";

export const MODOS = ["snapshot", "raw"];
export const POOLS = ["artigo", "corrigido"];
export const INDICES = ["indice_tecnico", "indice_explosivo"];
export const POSICOES = ["Goalkeeper", "Defender", "Midfield", "Attack"];

// A chave é o nome do clube como aparece nos JSONs. Cor e forma se repetem em todos os gráficos.
export const ACADEMIAS = {
  Barcelona: { academia: "La Masia", clube: "FC Barcelona", cor: "var(--club-barcelona)", forma: "circle" },
  "Real Madrid": { academia: "La Fábrica", clube: "Real Madrid CF", cor: "var(--club-real-madrid)", forma: "square" },
  "Manchester City": {
    academia: "City Football Academy",
    clube: "Manchester City FC",
    cor: "var(--club-manchester-city)",
    forma: "triangle",
  },
  Liverpool: { academia: "The Academy", clube: "Liverpool FC", cor: "var(--club-liverpool)", forma: "diamond" },
};

export function arquivoResultados(modo, pool) {
  return `${import.meta.env.BASE_URL}dados/resultados_${modo}_${pool}.json`;
}

export function comandoResultados(modo, pool) {
  return `uv run python -m soccerplayers executar --modo ${modo} --pool ${pool}`;
}

const cache = new Map();

export function carregarResultados(modo, pool) {
  const url = arquivoResultados(modo, pool);
  if (!cache.has(url)) {
    const promessa = fetch(url).then((resposta) => {
      const tipo = resposta.headers.get("content-type") ?? "";
      // O servidor de desenvolvimento devolve index.html para arquivos ausentes; isso também é erro.
      if (!resposta.ok || !tipo.includes("json")) {
        const erro = new Error("arquivo-ausente");
        erro.modo = modo;
        erro.pool = pool;
        throw erro;
      }
      return resposta.json();
    });
    // Falhas não ficam no cache, para que gerar o arquivo e tentar de novo funcione.
    promessa.catch(() => cache.delete(url));
    cache.set(url, promessa);
  }
  return cache.get(url);
}

/** Carrega uma combinação; mantém os dados anteriores na tela enquanto a nova chega. */
export function useResultados(modo, pool) {
  const chave = `${modo}_${pool}`;
  const [estado, setEstado] = useState({ chave: null, dados: null, erro: null });

  useEffect(() => {
    let ativo = true;
    carregarResultados(modo, pool)
      .then((dados) => ativo && setEstado({ chave, dados, erro: null }))
      .catch((erro) => ativo && setEstado((anterior) => ({ ...anterior, chave, erro })));
    return () => {
      ativo = false;
    };
  }, [modo, pool, chave]);

  const carregando = estado.chave !== chave;
  return { dados: estado.dados, carregando, erro: carregando ? null : estado.erro };
}

/** Carrega os dois métodos de percentil de uma mesma fonte, para a comparação do pool. */
export function useResultadosDosDoisPools(modo) {
  const [estado, setEstado] = useState({ artigo: null, corrigido: null, erro: null });

  useEffect(() => {
    let ativo = true;
    Promise.all([carregarResultados(modo, "artigo"), carregarResultados(modo, "corrigido")])
      .then(([artigo, corrigido]) => ativo && setEstado({ artigo, corrigido, erro: null }))
      .catch((erro) => ativo && setEstado((anterior) => ({ ...anterior, erro })));
    return () => {
      ativo = false;
    };
  }, [modo]);

  return estado;
}

export function linhaDescritiva(descritiva, academia, indice) {
  return descritiva.find((linha) => linha.academia === academia && linha.indice === indice);
}

export function exportarCsv(linhas, colunas, nomeArquivo) {
  const escapar = (valor) => {
    if (valor === null || valor === undefined) return "";
    const texto = String(valor);
    return /[",\n;]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const cabecalho = colunas.map((coluna) => escapar(coluna.rotulo)).join(",");
  const corpo = linhas.map((linha) => colunas.map((coluna) => escapar(coluna.valor(linha))).join(","));
  // BOM para o Excel reconhecer UTF-8 e acentos.
  const blob = new Blob([`﻿${[cabecalho, ...corpo].join("\n")}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
