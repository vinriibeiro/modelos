"use strict";
// Ilustrações em SVG usadas quando o cliente ainda não mandou fotos.
// Todas recebem a paleta (p) e se adaptam às cores do cliente.
const { mix } = require("./cores");

const ARCO = "M30 450V200a170 170 0 0 1 340 0v250z";

function moldura(p, rotulo, miolo) {
  const fundoArco = p.escuro ? mix(p.fundo, "#FFFFFF", 0.05) : mix(p.fundo, p.destaque, 0.08);
  return `<svg viewBox="0 0 400 460" role="img" aria-label="${rotulo}">
  <defs>
    <radialGradient id="h-brilho" cx=".55" cy=".42" r=".6"><stop offset="0" stop-color="${p.destaque}" stop-opacity=".35"/><stop offset="1" stop-color="${p.destaque}" stop-opacity="0"/></radialGradient>
    <clipPath id="h-arco"><path d="${ARCO}"/></clipPath>
    <linearGradient id="h-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p.realce(0.45)}"/><stop offset=".5" stop-color="${p.destaque}"/><stop offset="1" stop-color="${mix(p.destaque, "#000000", 0.35)}"/></linearGradient>
  </defs>
  <path d="${ARCO}" fill="${fundoArco}"/>
  <g clip-path="url(#h-arco)"><circle cx="220" cy="220" r="230" fill="url(#h-brilho)"/>${miolo}</g>
  <path d="${ARCO}" fill="none" stroke="${p.destaque}" stroke-width="2"/>
  <path d="M46 450V202a154 154 0 0 1 308 0v248" fill="none" stroke="${p.destaque}" stroke-width="1" opacity=".4"/>
</svg>`;
}

function quadro(p, rotulo, miolo, tom = 0) {
  const base = p.escuro ? mix(p.fundo, "#FFFFFF", 0.05 + tom) : mix(p.fundo, p.destaque, 0.1 + tom);
  return `<svg viewBox="0 0 300 225" role="img" aria-label="${rotulo}"><rect width="300" height="225" fill="${base}"/><circle cx="150" cy="105" r="88" fill="${p.destaque}" opacity="${p.escuro ? 0.12 : 0.14}"/>${miolo}</svg>`;
}

// ---------- Clínica de estética / salão ----------
function clinica(p) {
  const pele = "#E9C2A6", pele2 = "#D9A988", folha = p.escuro ? "#6E8F75" : "#7E9C84", vidro = p.escuro ? mix(p.fundo, "#FFFFFF", 0.82) : "#FFFFFF";
  const escuroD = mix(p.destaque, "#000000", 0.35), claroD = mix(p.destaque, "#FFFFFF", 0.55);
  const ramo = (x, y, r, s = 1) => `<g transform="translate(${x} ${y}) rotate(${r}) scale(${s})"><path d="M0 0C0-60 6-120 20-170" fill="none" stroke="${folha}" stroke-width="3"/>${[30, 60, 90, 120, 150].map((t, i) => `<path d="M${2 + i * 2.6} -${t}c-26-4-38-20-40-34 22 0 38 14 40 34zM${4 + i * 2.6} -${t + 12}c22-10 30-28 28-42-20 4-30 22-28 42z" fill="${folha}" opacity="${0.75 + i * 0.04}"/>`).join("")}</g>`;
  const frasco = (x, y, h, cor) => `<g transform="translate(${x} ${y})"><rect x="-22" y="0" width="44" height="${h}" rx="10" fill="${cor}"/><rect x="-22" y="${h * 0.35}" width="44" height="${h * 0.32}" fill="${vidro}" opacity=".85"/><rect x="-9" y="-22" width="18" height="24" rx="3" fill="${escuroD}"/><ellipse cx="0" cy="-30" rx="11" ry="12" fill="${p.texto}" opacity=".85"/></g>`;
  const hero = moldura(p, "Ilustração: ramos de folhas, frasco de sérum, pote de creme e pedras de massagem", `
    <circle cx="210" cy="190" r="110" fill="${claroD}" opacity="${p.escuro ? 0.18 : 0.45}"/>
    ${ramo(110, 440, -14)}${ramo(310, 450, 18, 0.85)}
    ${frasco(245, 250, 120, p.destaque)}
    <g transform="translate(160 330)"><ellipse cx="0" cy="44" rx="58" ry="12" fill="${escuroD}" opacity=".35"/><rect x="-56" y="0" width="112" height="44" rx="12" fill="${vidro}"/><rect x="-60" y="-16" width="120" height="22" rx="8" fill="${p.destaque}"/><path d="M-36 22h72" stroke="${claroD}" stroke-width="4" stroke-linecap="round"/></g>
    <g transform="translate(290 420)"><ellipse cx="0" cy="0" rx="46" ry="14" fill="${mix(p.texto, p.fundo, 0.35)}"/><ellipse cx="2" cy="-20" rx="34" ry="11" fill="${mix(p.texto, p.fundo, 0.5)}"/><ellipse cx="0" cy="-37" rx="22" ry="8" fill="${mix(p.texto, p.fundo, 0.65)}"/></g>
    <path d="M118 140l5 11 12 2-9 8 2 12-10-6-10 6 2-12-9-8 12-2z" fill="${p.destaque}" opacity=".7"/>
    <path d="M330 120l3 7 8 1-6 5 2 8-7-4-7 4 2-8-6-5 8-1z" fill="${p.destaque}" opacity=".5"/>`);
  const rosto = (extra) => `<ellipse cx="150" cy="112" rx="46" ry="56" fill="${pele}"/><path d="M104 104c-6-50 26-74 46-74s52 24 46 74c-8-22-24-38-46-38s-38 16-46 38z" fill="${mix(p.texto, "#3A2A22", 0.6)}"/><path d="M128 112q8 6 16 0M156 112q8 6 16 0" stroke="${mix(pele2, "#000", 0.35)}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M140 140q10 7 20 0" stroke="${escuroD}" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M84 225c4-36 30-52 66-52s62 16 66 52z" fill="${p.destaque}"/>${extra}`;
  const galeria = [
    quadro(p, "Ilustração de limpeza de pele com toalha e brilho", rosto(`<path d="M100 92c10-34 32-46 50-46s40 12 50 46c-14-10-30-14-50-14s-36 4-50 14z" fill="${vidro}"/><path d="M110 70h80" stroke="${claroD}" stroke-width="3"/><g fill="${p.destaque}"><path d="M226 62l4 9 10 2-8 6 2 10-8-5-8 5 2-10-8-6 10-2z"/><path d="M70 120l3 6 6 1-5 4 1 6-5-3-5 3 1-6-5-4 6-1z"/></g>`)),
    quadro(p, "Ilustração de olho com sobrancelha desenhada", `<path d="M58 132c26-40 62-58 92-58s66 18 92 58c-26 40-62 58-92 58s-66-18-92-58z" fill="${pele}"/><path d="M76 132c22-28 48-40 74-40s52 12 74 40c-22 28-48 40-74 40s-52-12-74-40z" fill="${vidro}"/><circle cx="150" cy="132" r="28" fill="${mix(p.destaque, "#3A2A22", 0.55)}"/><circle cx="150" cy="132" r="12" fill="#1C1412"/><circle cx="160" cy="122" r="5" fill="#FFF"/><path d="M62 78c30-30 70-40 104-36 30 4 54 16 74 30-30-10-56-14-80-14-36 0-66 8-98 20z" fill="${mix(p.texto, "#3A2A22", 0.55)}"/><path d="M76 132l-14-10M84 118l-12-14M224 132l14-10M216 118l12-14" stroke="#1C1412" stroke-width="2.5" stroke-linecap="round"/>`),
    quadro(p, "Ilustração de pedras quentes e folhas para massagem relaxante", `<ellipse cx="150" cy="192" rx="110" ry="14" fill="${escuroD}" opacity=".25"/>${ramo(78, 196, -40, 0.6)}${ramo(230, 196, 40, 0.6)}<ellipse cx="150" cy="176" rx="74" ry="20" fill="${mix(p.texto, p.fundo, 0.3)}"/><ellipse cx="152" cy="144" rx="58" ry="17" fill="${mix(p.texto, p.fundo, 0.45)}"/><ellipse cx="148" cy="116" rx="42" ry="14" fill="${mix(p.texto, p.fundo, 0.6)}"/><ellipse cx="150" cy="92" rx="26" ry="10" fill="${mix(p.texto, p.fundo, 0.72)}"/><path d="M128 64c0-10 8-10 8-20M150 60c0-10 8-10 8-20M172 64c0-10 8-10 8-20" stroke="${p.destaque}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>`),
    quadro(p, "Ilustração de esmaltes e unhas pintadas", `${[0, 1, 2].map((i) => `<g transform="translate(${92 + i * 58} ${86 + (i === 1 ? -12 : 0)})"><rect x="-14" y="-38" width="28" height="44" rx="5" fill="${escuroD}"/><rect x="-26" y="4" width="52" height="74" rx="14" fill="${[p.destaque, claroD, mix(p.destaque, "#7A2E3B", 0.5)][i]}"/><rect x="-18" y="20" width="10" height="40" rx="5" fill="#FFF" opacity=".35"/></g>`).join("")}<g transform="translate(150 196)">${[-2, -1, 0, 1, 2].map((k) => `<path d="M${k * 30 - 10} 0v-${26 - Math.abs(k) * 4}a10 10 0 0 1 20 0v${26 - Math.abs(k) * 4}z" fill="${pele}"/><path d="M${k * 30 - 7} -${10 - Math.abs(k) * 0}v-${12 - Math.abs(k) * 4}a7 7 0 0 1 14 0v${12 - Math.abs(k) * 4}z" fill="${p.destaque}"/>`).join("")}</g>`),
    quadro(p, "Ilustração de produtos de cuidado com a pele", `<g>${frasco(98, 96, 96, claroD)}${frasco(150, 70, 122, p.destaque)}</g><g transform="translate(212 140)"><rect x="-30" y="0" width="60" height="52" rx="12" fill="${vidro}"/><rect x="-32" y="-14" width="64" height="18" rx="7" fill="${escuroD}"/></g><ellipse cx="150" cy="196" rx="110" ry="8" fill="${escuroD}" opacity=".25"/>${ramo(256, 200, 20, 0.45)}`),
    quadro(p, "Ilustração do ambiente: maca de atendimento, luminária e planta", `<rect x="0" y="176" width="300" height="49" fill="${mix(p.fundo, p.texto, p.escuro ? 0.12 : 0.08)}"/><path d="M58 0v40" stroke="${p.texto}" stroke-width="2" opacity=".5"/><path d="M38 40h40l-10 18H48z" fill="${p.destaque}"/><ellipse cx="58" cy="70" rx="40" ry="16" fill="${claroD}" opacity=".35"/><rect x="70" y="130" width="160" height="22" rx="8" fill="${vidro}"/><rect x="62" y="120" width="44" height="18" rx="9" fill="${claroD}"/><rect x="80" y="152" width="8" height="34" fill="${escuroD}"/><rect x="212" y="152" width="8" height="34" fill="${escuroD}"/><rect x="74" y="146" width="152" height="8" rx="3" fill="${p.destaque}"/><g transform="translate(262 190)"><path d="M-14 0h28l-4-26h-20z" fill="${escuroD}"/>${ramo(0, -26, 0, 0.42)}</g>`),
  ];
  return { hero, galeria };
}

// ---------- Restaurante / lanchonete ----------
function restaurante(p) {
  const pao = "#E0A04A", pao2 = "#C9832E", carne = "#5A2E1C", queijo = "#F6C23E", alface = "#6FA94A", tomate = "#D9472B", batata = "#F2C14E";
  const escuroD = mix(p.destaque, "#000000", 0.35);
  const burger = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="96" rx="120" ry="16" fill="#000" opacity=".25"/><path d="M-104 78h208a12 12 0 0 1-12 16h-184a12 12 0 0 1-12-16z" fill="${pao2}"/><rect x="-110" y="40" width="220" height="38" rx="18" fill="${carne}"/><path d="M-116 34h232l-14 16-14-10-14 12-14-10-14 12-14-10-14 12-14-10-14 12-14-10-14 12-14-10-14 12-14-10-14 12-14-10z" fill="${queijo}"/><path d="M-112 22c14-8 26 8 40 0s26 8 40 0 26 8 40 0 26 8 40 0 26 8 40 0 26 8 32 4v10h-232z" fill="${alface}"/><rect x="-96" y="10" width="76" height="14" rx="7" fill="${tomate}"/><rect x="20" y="10" width="76" height="14" rx="7" fill="${tomate}"/><path d="M-110 10c0-56 50-86 110-86s110 30 110 86z" fill="${pao}"/>${[[-60, -40], [-24, -58], [16, -50], [52, -34], [-10, -28], [30, -18], [-46, -12]].map(([a, b]) => `<ellipse cx="${a}" cy="${b}" rx="6" ry="3" fill="#FCE7B8" transform="rotate(-20 ${a} ${b})"/>`).join("")}</g>`;
  const fritas = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${[-30, -18, -6, 6, 18, 30].map((a, i) => `<rect x="${a - 5}" y="${-70 + (i % 3) * 10}" width="10" height="80" rx="3" fill="${batata}" transform="rotate(${a / 3} ${a} 0)"/>`).join("")}<path d="M-44 -6h88l-10 76h-68z" fill="${p.destaque}"/><path d="M-44 -6c14 14 30 18 44 18s30-4 44-18" fill="none" stroke="${escuroD}" stroke-width="4"/></g>`;
  const copo = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M4 -96l20-50h18" stroke="${p.texto}" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M-40 -96h80l-10 120h-60z" fill="${mix(p.fundo, "#FFFFFF", 0.85)}"/><path d="M-37 -60h74l-6 70h-62z" fill="${p.destaque}"/><rect x="-46" y="-108" width="92" height="16" rx="6" fill="${escuroD}"/></g>`;
  const vapor = (x, y) => `<path d="M${x} ${y}c-10-14 10-22 0-36M${x + 24} ${y + 4}c-10-14 10-22 0-36M${x - 24} ${y + 4}c-10-14 10-22 0-36" stroke="${p.texto}" stroke-width="3" fill="none" stroke-linecap="round" opacity=".35"/>`;
  const hero = moldura(p, "Ilustração: hambúrguer artesanal, porção de batata frita e refrigerante", `
    ${vapor(200, 150)}
    ${burger(200, 270, 1.05)}
    ${fritas(110, 380, 1)}${copo(296, 400, 0.95)}
    <rect x="30" y="430" width="340" height="40" fill="${escuroD}" opacity=".35"/>`);
  const prato = `<circle cx="150" cy="112" r="84" fill="${mix(p.fundo, "#FFFFFF", 0.9)}"/><circle cx="150" cy="112" r="66" fill="none" stroke="${mix(p.fundo, "#FFFFFF", 0.7)}" stroke-width="3"/><path d="M98 96a40 30 0 0 1 60-24 30 30 0 0 1-20 50 40 30 0 0 1-40-26z" fill="#F7F1E3"/><path d="M160 74a28 28 0 0 1 40 30c-10 10-30 8-40-6z" fill="#5B3A22"/><path d="M118 132c20-8 50-8 70 4-6 16-24 26-40 24s-30-12-30-28z" fill="${carne}"/><path d="M182 136c10-14 26-14 32-4-2 12-18 18-32 4z" fill="${alface}"/><circle cx="196" cy="102" r="4" fill="#3A2412"/><circle cx="176" cy="90" r="4" fill="#3A2412"/>`;
  const galeria = [
    quadro(p, "Ilustração de hambúrguer artesanal", `${vapor(150, 64)}${burger(150, 120, 0.72)}`),
    quadro(p, "Ilustração de prato executivo visto de cima: arroz, feijão, carne e salada", prato),
    quadro(p, "Ilustração de porção de batata frita", `${fritas(150, 150, 1.25)}<ellipse cx="150" cy="198" rx="80" ry="8" fill="#000" opacity=".2"/>`),
    quadro(p, "Ilustração de sucos e refrigerante", `${copo(110, 170, 0.8)}<g transform="translate(196 170) scale(.8)"><path d="M-40 -96h80l-10 120h-60z" fill="${mix(p.fundo, "#FFFFFF", 0.85)}"/><path d="M-36 -64h72l-7 86h-58z" fill="#F29A3A"/><circle cx="34" cy="-100" r="22" fill="#F6C23E"/><circle cx="34" cy="-100" r="15" fill="#FBE08A"/></g>`),
    quadro(p, "Ilustração de copo de açaí com frutas", `<path d="M96 92h108l-14 100h-80z" fill="${mix(p.fundo, "#FFFFFF", 0.85)}"/><path d="M100 104h100l-10 82h-80z" fill="#5B2350"/><path d="M92 92c10-26 34-36 58-36s48 10 58 36z" fill="#6E2A61"/><circle cx="128" cy="66" r="12" fill="${tomate}"/><path d="M128 54l4-8" stroke="${alface}" stroke-width="3"/><ellipse cx="166" cy="68" rx="18" ry="7" fill="#F6E6A6"/><ellipse cx="150" cy="80" rx="22" ry="5" fill="#E8D7A0"/><circle cx="186" cy="80" r="5" fill="#2A3A8C"/><circle cx="110" cy="82" r="5" fill="#2A3A8C"/>`),
    quadro(p, "Ilustração do ambiente: balcão com luminárias e banquetas", `${[70, 150, 230].map((x) => `<path d="M${x} 0v38" stroke="${p.texto}" stroke-width="2" opacity=".5"/><path d="M${x - 22} 58a22 20 0 0 1 44 0z" fill="${p.destaque}"/><ellipse cx="${x}" cy="76" rx="34" ry="12" fill="${p.destaque}" opacity=".18"/>`).join("")}<rect x="20" y="124" width="260" height="14" rx="4" fill="${mix(p.fundo, "#FFFFFF", 0.18)}"/><rect x="34" y="138" width="232" height="60" fill="${escuroD}"/>${[78, 150, 222].map((x) => `<rect x="${x - 16}" y="170" width="32" height="8" rx="4" fill="${p.texto}" opacity=".75"/><path d="M${x} 178v40M${x - 12} 218h24" stroke="${p.texto}" stroke-width="3" opacity=".75"/>`).join("")}`),
  ];
  return { hero, galeria };
}

// ---------- Oficina mecânica / auto center ----------
function oficina(p) {
  const aco = p.escuro ? "#C9D1D9" : "#5B6670", aco2 = p.escuro ? "#8B96A1" : "#3E4851", borracha = "#1E2226", escuroD = mix(p.destaque, "#000000", 0.35);
  const engrenagem = (x, y, r, cor, dentes = 12) => {
    let d = "";
    for (let i = 0; i < dentes; i++) {
      const a = (i / dentes) * Math.PI * 2, w = Math.PI / dentes / 1.6;
      const pt = (ang, rr) => `${(x + Math.cos(ang) * rr).toFixed(1)} ${(y + Math.sin(ang) * rr).toFixed(1)}`;
      d += `${i ? "L" : "M"}${pt(a - w * 1.4, r)}L${pt(a - w, r * 1.18)}L${pt(a + w, r * 1.18)}L${pt(a + w * 1.4, r)}`;
    }
    return `<path d="${d}Z" fill="${cor}"/><circle cx="${x}" cy="${y}" r="${r * 0.45}" fill="${p.escuro ? mix(p.fundo, "#FFFFFF", 0.05) : mix(p.fundo, p.destaque, 0.08)}"/>`;
  };
  const pneu = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${borracha}"/>${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `<path d="M${(x + Math.cos(a) * r * 0.86).toFixed(1)} ${(y + Math.sin(a) * r * 0.86).toFixed(1)}L${(x + Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}" stroke="#3A4148" stroke-width="${r / 9}"/>`; }).join("")}<circle cx="${x}" cy="${y}" r="${r * 0.62}" fill="${aco2}"/><circle cx="${x}" cy="${y}" r="${r * 0.5}" fill="${aco}"/>${Array.from({ length: 5 }, (_, i) => { const a = (i / 5) * Math.PI * 2 - Math.PI / 2; return `<circle cx="${(x + Math.cos(a) * r * 0.3).toFixed(1)}" cy="${(y + Math.sin(a) * r * 0.3).toFixed(1)}" r="${r * 0.06}" fill="${aco2}"/>`; }).join("")}<circle cx="${x}" cy="${y}" r="${r * 0.12}" fill="${p.destaque}"/>`;
  const chave = (x, y, rot, s, cor) => `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})"><path d="M-130 -11h220v22h-220z" fill="${cor}"/><path d="M90 -34a34 34 0 1 1 0 68l0-22 20 0 0-24-20 0z" fill="${cor}"/><path d="M-130 -30a30 30 0 1 0 0 60a30 30 0 0 0 0-60zm0 14a16 16 0 1 1 0 32a16 16 0 0 1 0-32z" fill="${cor}"/></g>`;
  const hero = moldura(p, "Ilustração: engrenagem, chave de boca e pneu com roda", `
    ${engrenagem(250, 190, 96, p.escuro ? mix(p.fundo, "#FFFFFF", 0.12) : mix(p.fundo, "#000000", 0.08), 14)}
    ${engrenagem(120, 150, 46, p.destaque, 10)}
    ${pneu(220, 360, 110)}
    ${chave(170, 260, -38, 0.95, aco)}
    <rect x="30" y="440" width="340" height="30" fill="${p.destaque}"/>
    <path d="M30 440h340" stroke="${borracha}" stroke-width="10" stroke-dasharray="26 26"/>`);
  const galeria = [
    quadro(p, "Ilustração de galão de óleo sendo despejado", `<g transform="translate(120 70)"><path d="M0 40h90l20-30 18 8-18 32v80H0z" fill="${p.destaque}"/><rect x="16" y="20" width="34" height="22" rx="4" fill="${escuroD}"/><rect x="14" y="70" width="64" height="44" rx="6" fill="${p.escuro ? p.fundo : "#FFFFFF"}" opacity=".9"/><path d="M26 92h40M26 102h28" stroke="${p.destaque}" stroke-width="5" stroke-linecap="round"/></g><path d="M246 84c4 20-6 36-6 60" stroke="#C9921E" stroke-width="7" fill="none" stroke-linecap="round"/><path d="M240 160c-8 12-12 18-12 24a12 12 0 0 0 24 0c0-6-4-12-12-24z" fill="#C9921E"/>`),
    quadro(p, "Ilustração de disco e pinça de freio", `<circle cx="150" cy="112" r="80" fill="${aco2}"/><circle cx="150" cy="112" r="72" fill="${aco}"/>${Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return `<circle cx="${(150 + Math.cos(a) * 54).toFixed(1)}" cy="${(112 + Math.sin(a) * 54).toFixed(1)}" r="4" fill="${aco2}"/>`; }).join("")}<circle cx="150" cy="112" r="30" fill="${aco2}"/><circle cx="150" cy="112" r="10" fill="${borracha}"/><path d="M200 40a84 84 0 0 1 32 46l-30 10a54 54 0 0 0-20-32z" fill="${p.destaque}"/><rect x="214" y="52" width="10" height="22" rx="3" fill="${escuroD}" transform="rotate(30 219 63)"/>`),
    quadro(p, "Ilustração de pneu com setas de alinhamento", `${pneu(150, 112, 80)}<path d="M40 30v164M260 30v164" stroke="${p.destaque}" stroke-width="4" stroke-dasharray="8 8"/><path d="M40 112h26M66 112l-10-8M66 112l-10 8M260 112h-26M234 112l10-8M234 112l10 8" stroke="${p.destaque}" stroke-width="4" stroke-linecap="round"/>`),
    quadro(p, "Ilustração de scanner de diagnóstico ligado ao carro", `<rect x="96" y="30" width="108" height="168" rx="14" fill="${borracha}"/><rect x="108" y="44" width="84" height="70" rx="6" fill="${mix(p.destaque, "#000", 0.6)}"/><path d="M114 100l14-20 14 12 16-28 14 16 14-10" stroke="${p.destaque}" stroke-width="3" fill="none" stroke-linejoin="round"/><circle cx="150" cy="140" r="14" fill="none" stroke="${aco}" stroke-width="3"/>${[124, 176].map((x) => `<rect x="${x - 10}" y="130" width="20" height="20" rx="4" fill="${aco2}"/>`).join("")}<rect x="116" y="164" width="68" height="12" rx="6" fill="${p.destaque}"/><path d="M204 150c40 0 40 40 70 40" stroke="${aco}" stroke-width="5" fill="none"/>`),
    quadro(p, "Ilustração de saída de ar-condicionado com floco de neve", `<rect x="60" y="66" width="180" height="92" rx="18" fill="${aco2}"/><rect x="72" y="78" width="156" height="68" rx="10" fill="${borracha}"/>${[90, 106, 122, 138].map((y) => `<rect x="80" y="${y - 2}" width="140" height="6" rx="3" fill="${aco}" opacity=".8"/>`).join("")}<g transform="translate(232 60)" stroke="${p.destaque}" stroke-width="4" stroke-linecap="round"><path d="M0-30v60M-26-15l52 30M-26 15l52-30"/><path d="M-8-24l8 6 8-6M-8 24l8-6 8 6"/></g><path d="M86 176c20 10 40-10 64 0s44-10 64 0" stroke="${p.texto}" stroke-width="3" fill="none" opacity=".4" stroke-linecap="round"/>`),
    quadro(p, "Ilustração do ambiente: carro no elevador da oficina", `<rect x="0" y="196" width="300" height="29" fill="${mix(p.fundo, p.texto, 0.1)}"/><rect x="34" y="70" width="14" height="128" fill="${p.destaque}"/><rect x="252" y="70" width="14" height="128" fill="${p.destaque}"/><rect x="40" y="126" width="220" height="10" fill="${aco2}"/><path d="M62 118v-18l22-32h120l28 32v18z" fill="${aco}"/><path d="M92 74h48v26H76zM150 74h50l22 26h-72z" fill="${mix(p.fundo, "#FFFFFF", 0.2)}"/><circle cx="98" cy="118" r="16" fill="${borracha}"/><circle cx="210" cy="118" r="16" fill="${borracha}"/><circle cx="98" cy="118" r="7" fill="${aco2}"/><circle cx="210" cy="118" r="7" fill="${aco2}"/>${chave(150, 214, 0, 0.45, aco)}`),
  ];
  return { hero, galeria };
}

function mapa(p) {
  const base = p.escuro ? mix(p.fundo, "#FFFFFF", 0.05) : mix(p.fundo, "#FFFFFF", 0.5);
  const rua = p.escuro ? mix(p.fundo, "#FFFFFF", 0.14) : mix(p.fundo, "#000000", 0.08);
  return `<svg viewBox="0 0 480 200" role="img" aria-label="Mapa ilustrativo da localização"><rect width="480" height="200" fill="${base}"/><path d="M0 64h480M0 146h480M120 0v200M300 0v200M400 0l-60 200" stroke="${rua}" stroke-width="14"/><path d="M0 64h480M0 146h480M120 0v200M300 0v200" stroke="${p.texto}" stroke-width="1" stroke-dasharray="6 8" opacity=".25"/><rect x="140" y="80" width="60" height="50" rx="4" fill="${rua}" opacity=".7"/><rect x="320" y="10" width="50" height="40" rx="4" fill="${rua}" opacity=".7"/><g transform="translate(210 110)"><ellipse cx="0" cy="4" rx="14" ry="5" fill="#000" opacity=".25"/><path d="M0 0c-14-16-22-26-22-38a22 22 0 0 1 44 0c0 12-8 22-22 38z" fill="${p.destaque}"/><circle cx="0" cy="-38" r="8" fill="${p.fundo}"/></g></svg>`;
}

const SEGMENTOS = { "clinica-estetica": clinica, restaurante, oficina };
function ilustracoes(segmento, p) {
  const f = SEGMENTOS[segmento];
  if (!f) throw new Error(`Segmento sem ilustrações: ${segmento}. Disponíveis: ${Object.keys(SEGMENTOS).join(", ")}`);
  return { ...f(p), mapa: mapa(p) };
}

module.exports = { ilustracoes };
