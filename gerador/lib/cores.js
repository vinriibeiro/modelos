"use strict";
// Monta a paleta completa do site a partir de duas cores: fundo e destaque.
// Ajusta os tons para manter o texto legível (contraste mínimo 4,5:1).

function hex(c) {
  let s = String(c || "").trim().replace(/^#/, "");
  if (s.length === 3) s = s.split("").map((x) => x + x).join("");
  if (!/^[0-9a-fA-F]{6}$/.test(s)) throw new Error(`Cor inválida: "${c}". Use o formato #RRGGBB.`);
  return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16));
}
const toHex = (rgb) => "#" + rgb.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("").toUpperCase();
const mix = (a, b, t) => { const x = hex(a), y = hex(b); return toHex(x.map((v, i) => v + (y[i] - v) * t)); };
function lum(c) {
  return hex(c).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); })
    .reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
}
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgba = (c, a) => `rgba(${hex(c).join(",")},${a})`;

// Aproxima "cor" de "alvo" até alcançar o contraste pedido sobre "fundo".
function legivel(cor, fundo, alvo, minimo = 4.5) {
  let t = 0, c = cor;
  while (contraste(c, fundo) < minimo && t < 1) { t += 0.05; c = mix(cor, alvo, t); }
  return c;
}

function paleta({ fundo, destaque }) {
  const escuro = lum(fundo) < 0.2;
  const branco = "#FFFFFF", preto = "#000000";
  const texto = escuro ? mix(fundo, branco, 0.93) : mix(fundo, preto, 0.9);
  const p = {
    escuro,
    fundo: toHex(hex(fundo)),
    fundo2: escuro ? mix(fundo, branco, 0.035) : mix(fundo, preto, 0.03),
    cartao: escuro ? mix(fundo, branco, 0.07) : mix(fundo, branco, 0.6),
    texto,
    suave: legivel(mix(texto, fundo, 0.32), fundo, texto),
    linha: rgba(texto, escuro ? 0.13 : 0.12),
    destaque: toHex(hex(destaque)),
  };
  // Tom do destaque usado como texto (títulos pequenos, links)
  p.destaqueTexto = legivel(escuro ? mix(destaque, branco, 0.18) : mix(destaque, preto, 0.12), p.fundo2, texto);
  // Texto sobre o botão com fundo de destaque
  p.sobreDestaque = contraste(destaque, branco) >= contraste(destaque, "#111111") ? branco : "#111111";
  p.destaqueHover = escuro ? mix(destaque, branco, 0.15) : mix(destaque, preto, 0.12);
  p.brilho = rgba(destaque, escuro ? 0.18 : 0.14);
  p.realce = (t) => mix(destaque, escuro ? branco : preto, t);
  p.tom = (t) => mix(fundo, texto, t);
  return p;
}

module.exports = { paleta, mix, rgba, contraste, hex };
