#!/usr/bin/env node
"use strict";
// Gera um site a partir do arquivo de um cliente.
//   node gerador/gerar.js gerador/clientes/minha-cliente.json
//   node gerador/gerar.js --todos          (gera todos os arquivos de gerador/clientes)
// Sem dependências: só Node 18 ou mais novo.
const fs = require("fs");
const path = require("path");
const { pagina, favicon } = require("./lib/pagina");
const { nomes: ICONES } = require("./lib/icones");

const RAIZ = path.resolve(__dirname, "..");
const SEGMENTOS = path.join(__dirname, "segmentos");
const CLIENTES = path.join(__dirname, "clientes");
const FONTES = path.join(RAIZ, "fonts");

const ehObjeto = (v) => v && typeof v === "object" && !Array.isArray(v);
function mesclar(base, extra) {
  const out = { ...base };
  for (const [k, v] of Object.entries(extra || {})) out[k] = ehObjeto(v) && ehObjeto(base[k]) ? mesclar(base[k], v) : v;
  return out;
}

function slugify(s) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/&/g, "e").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function validar(c, arquivo) {
  const erros = [];
  if (!c.nome) erros.push('falta "nome"');
  if (!["previa", "modelo", "final"].includes(c.modo)) erros.push('"modo" deve ser "previa", "modelo" ou "final"');
  if (c.modo === "final" && !/^55\d{10,11}$/.test(String(c.whatsapp || ""))) erros.push('"whatsapp" deve ter DDI + DDD + número, só dígitos (ex.: 5514999998888)');
  if (!Array.isArray(c.servicos) || !c.servicos.length) erros.push('"servicos" precisa de pelo menos 1 item');
  (c.servicos || []).forEach((s, i) => { if (s.icone && !ICONES.includes(s.icone)) erros.push(`servicos[${i}].icone "${s.icone}" não existe. Opções: ${ICONES.join(", ")}`); });
  if (erros.length) throw new Error(`${path.relative(RAIZ, arquivo)}:\n  - ${erros.join("\n  - ")}`);
}

function copiarFoto(origem, destinoDir, nome) {
  if (!fs.existsSync(origem)) throw new Error(`Foto não encontrada: ${origem}`);
  fs.mkdirSync(path.join(destinoDir, "img"), { recursive: true });
  const ext = path.extname(origem).toLowerCase();
  const rel = `img/${nome}${ext}`;
  fs.copyFileSync(origem, path.join(destinoDir, rel));
  return rel;
}

function gerar(arquivo) {
  const cliente = JSON.parse(fs.readFileSync(arquivo, "utf8"));
  const segArq = path.join(SEGMENTOS, `${cliente.segmento}.json`);
  if (!fs.existsSync(segArq)) {
    const ok = fs.readdirSync(SEGMENTOS).map((f) => f.replace(/\.json$/, ""));
    throw new Error(`Segmento "${cliente.segmento}" não existe. Opções: ${ok.join(", ")}`);
  }
  const c = mesclar(JSON.parse(fs.readFileSync(segArq, "utf8")), cliente);
  c.modo = c.modo || "previa";
  validar(c, arquivo);
  const slug = c.slug || slugify(`${c.nome} ${c.endereco?.cidade || ""}`);
  const pasta = c.saida
    ? path.resolve(RAIZ, c.saida)
    : path.join(RAIZ, c.modo === "modelo" ? "modelos" : c.modo === "previa" ? "previas" : "sites", slug);
  fs.mkdirSync(path.join(pasta, "fonts"), { recursive: true });
  for (const f of fs.readdirSync(FONTES)) fs.copyFileSync(path.join(FONTES, f), path.join(pasta, "fonts", f));

  // Fotos: caminhos relativos ao arquivo do cliente
  const dirCliente = path.dirname(arquivo);
  const fotos = {};
  if (c.fotos?.capa) fotos.capa = copiarFoto(path.resolve(dirCliente, c.fotos.capa), pasta, "capa");
  if (c.logo) fotos.logo = copiarFoto(path.resolve(dirCliente, c.logo), pasta, "logo");
  fotos.galeria = (c.galeria || []).map((g, i) => (g.foto ? copiarFoto(path.resolve(dirCliente, g.foto), pasta, `galeria-${i + 1}`) : null));
  const comFoto = fotos.galeria.filter(Boolean).length;
  if (comFoto && comFoto < Math.min(6, fotos.galeria.length)) {
    console.warn(`  aviso: só ${comFoto} item(ns) da galeria têm foto. Os demais usam ilustração.`);
  }

  fs.writeFileSync(path.join(pasta, "index.html"), pagina(c, { fotos }));
  fs.writeFileSync(path.join(pasta, "favicon.svg"), favicon(c));
  console.log(`ok  ${path.relative(RAIZ, pasta)}/  (${c.modo})`);
  return pasta;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const arquivos = args.includes("--todos")
    ? fs.readdirSync(CLIENTES).filter((f) => f.endsWith(".json") && !f.startsWith("_")).map((f) => path.join(CLIENTES, f))
    : args.map((a) => path.resolve(a));
  if (!arquivos.length) {
    console.log("Uso: node gerador/gerar.js gerador/clientes/<arquivo>.json   ou   node gerador/gerar.js --todos");
    process.exit(1);
  }
  let falhas = 0;
  for (const a of arquivos) {
    try { gerar(a); } catch (e) { falhas++; console.error(`ERRO ${e.message}`); }
  }
  process.exit(falhas ? 1 : 0);
}

module.exports = { gerar, slugify };
