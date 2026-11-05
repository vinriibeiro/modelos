"use strict";
// Ícones de linha (36x36). No arquivo do cliente, use o nome em "icone".
const I = {
  // Estética e beleza
  rosto: '<path d="M18 4c-6 0-10 5-10 11 0 7 4.5 13 10 13s10-6 10-13c0-6-4-11-10-11z"/><path d="M13 15h2M21 15h2M15 22c1.8 1.3 4.2 1.3 6 0"/><path d="M27 6l1.2 2.4L31 9.5l-2.6 1.1L27 13l-1.2-2.4L23 9.5l2.8-1.1z"/>',
  sobrancelha: '<path d="M5 14c4-4 9-5 13-5s9 1 13 5"/><path d="M6 22c3.5-4 8-6 12-6s8.5 2 12 6c-3.5 4-8 6-12 6s-8.5-2-12-6z"/><circle cx="18" cy="22" r="3.5"/>',
  gota: '<path d="M18 4s-10 11-10 18a10 10 0 0 0 20 0C28 15 18 4 18 4z"/><path d="M13 23a5 5 0 0 0 5 5"/>',
  folha: '<path d="M30 6C14 6 6 14 6 24c0 2 .5 4 1.5 6C10 20 17 15 24 13 18 17 12 23 9.5 31c1.5.6 3 1 4.5 1 10 0 16-10 16-26z"/>',
  pedras: '<ellipse cx="18" cy="28" rx="12" ry="4"/><ellipse cx="18" cy="19" rx="9" ry="3.6"/><ellipse cx="18" cy="11" rx="6" ry="3"/>',
  unha: '<path d="M12 33V16a6 6 0 0 1 12 0v17"/><path d="M14 16a4 4 0 0 1 8 0v4h-8z"/><path d="M15 3v5M21 3v5M18 2v6"/>',
  cera: '<path d="M7 16h22l-2 15H9z"/><path d="M5 16h26"/><path d="M22 16c0-4 2-9 6-12"/><path d="M12 22c2 1 4 1 6 0s4-1 6 0"/>',
  massagem: '<path d="M4 26h28M7 26v5M29 26v5"/><circle cx="10" cy="19" r="3"/><path d="M14 20h14a2 2 0 0 1 2 2v4H13z"/><path d="M20 8c0 3 4 3 4 6M25 8c0 3 4 3 4 6"/>',
  espelho: '<circle cx="18" cy="14" r="10"/><path d="M18 24v7M12 32h12"/><path d="M13 11a6 6 0 0 1 5-4"/>',
  // Comida
  lanche: '<path d="M6 15c0-6 5-9 12-9s12 3 12 9z"/><path d="M5 19h26"/><path d="M6 23c2-1.5 4-1.5 6 0s4 1.5 6 0 4-1.5 6 0 4 1.5 6 0"/><path d="M6 27h24a0 0 0 0 1 0 0c0 2-1.5 3-3 3H9c-1.5 0-3-1-3-3z"/>',
  prato: '<circle cx="18" cy="19" r="12"/><circle cx="18" cy="19" r="7"/><path d="M4 4v8a3 3 0 0 0 3 3v17M7 4v6M10 4v8a3 3 0 0 1-3 3"/>',
  batata: '<path d="M9 15h18l-3 17H12z"/><path d="M12 15l-1-10M16 15V4M20 15l1-11M24 15l2-9"/><path d="M11 22c4 2 10 2 14 0"/>',
  copo: '<path d="M9 9h18l-2.5 23h-13z"/><path d="M8 9h20M20 9l3-6h4"/><path d="M11 17h14"/>',
  pizza: '<path d="M18 33 4 7c9-4 19-4 28 0z"/><path d="M6.5 11.5c7-3 16-3 23 0"/><circle cx="14" cy="16" r="1.8"/><circle cx="21" cy="19" r="1.8"/><circle cx="17" cy="25" r="1.6"/>',
  sobremesa: '<path d="M7 17h22l-3 12H10z"/><path d="M8 17c0-5 4-8 10-8s10 3 10 8"/><path d="M18 9V5"/><circle cx="18" cy="4" r="1.5"/>',
  entrega: '<circle cx="9" cy="26" r="4"/><circle cx="27" cy="26" r="4"/><path d="M13 26h10l3-9h-7l-3 9M20 17l-2-6h-4"/><path d="M27 22V12h-5"/>',
  // Oficina
  chave: '<path d="M22 4a8 8 0 0 0-7.4 11L4 25.6V32h6.4L21 21.4A8 8 0 0 0 32 14l-5 5-5-1-1-5 5-5a8 8 0 0 0-4-4z"/>',
  oleo: '<path d="M6 14h16l6-4 4 2-6 6v12H6z"/><path d="M10 14v-4h6v4"/><path d="M31 21s-2 3-2 4.5a2 2 0 0 0 4 0c0-1.5-2-4.5-2-4.5z"/>',
  freio: '<circle cx="18" cy="18" r="13"/><circle cx="18" cy="18" r="4"/><path d="M24 7a14 14 0 0 1 5 6l-5 3-3-5z"/>',
  pneu: '<circle cx="18" cy="18" r="14"/><circle cx="18" cy="18" r="7"/><path d="M18 4v7M18 25v7M4 18h7M25 18h7M8 8l5 5M23 23l5 5M28 8l-5 5M13 23l-5 5"/>',
  motor: '<path d="M8 12h14l4 4h4v10h-4l-4 4H10l-2-3H4V15h4z"/><path d="M14 12V7h6M12 7h10"/><path d="M15 17l-2 5h4l-2 5"/>',
  neve: '<path d="M18 3v30M5 10.5l26 15M5 25.5l26-15"/><path d="M14 5l4 3 4-3M14 31l4-3 4 3M4 15l5-1 1-4M32 21l-5 1-1 4M4 21l5 1 1 4M32 15l-5-1-1-4"/>',
  bateria: '<rect x="4" y="10" width="28" height="20" rx="2"/><path d="M9 10V7h5v3M22 10V7h5v3M9 20h5M23 20h5M25.5 17.5v5"/>',
  scanner: '<rect x="6" y="4" width="18" height="28" rx="3"/><path d="M10 9h10v8H10z"/><path d="M11 22h2M17 22h2M11 26h2M17 26h2M24 18h4l3 3"/><path d="M12 15l2-3 2 2 2-3"/>',
  carro: '<path d="M4 23v-5l4-8h20l4 8v5z"/><path d="M8 18h20"/><circle cx="10" cy="25" r="3"/><circle cx="26" cy="25" r="3"/>',
  // Gerais
  escudo: '<path d="M18 3 6 8v9c0 8 5 13 12 16 7-3 12-8 12-16V8z"/><path d="m12 18 4 4 8-8"/>',
  relogio: '<circle cx="18" cy="18" r="14"/><path d="M18 9v9l6 4"/>',
  calendario: '<rect x="5" y="7" width="26" height="24" rx="3"/><path d="M5 14h26M12 4v6M24 4v6M11 20h4M21 20h4M11 25h4"/>',
  estrela: '<path d="m18 4 4.2 8.6 9.3 1.3-6.8 6.6 1.6 9.3L18 25.4l-8.3 4.4 1.6-9.3-6.8-6.6 9.3-1.3z"/>',
  check: '<circle cx="18" cy="18" r="14"/><path d="m11 18 5 5 9-10"/>',
  cartao: '<rect x="4" y="9" width="28" height="19" rx="3"/><path d="M4 15h28M9 22h6"/>',
  conversa: '<path d="M5 8h26v16H15l-7 6v-6H5z"/><path d="M11 14h14M11 19h9"/>',
  coracao: '<path d="M18 31S5 23 5 13.5A6.5 6.5 0 0 1 18 10a6.5 6.5 0 0 1 13 3.5C31 23 18 31 18 31z"/>',
};

function icone(nome, attrs = "") {
  const d = I[nome] || I.check;
  return `<svg viewBox="0 0 36 36" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"${attrs}>${d}</svg>`;
}

const WHATS = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 11.6A8.4 8.4 0 0 1 7.6 19L3 20.2l1.3-4.4A8.4 8.4 0 1 1 20 11.6z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8.6c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.6c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.4 1.8 2.4 2.3.2.1.4.1.5-.1l.6-.7c.2-.2.4-.2.6-.1l1.5.7c.3.1.4.3.3.6-.1.9-.9 1.7-1.9 1.7-2.8 0-6.4-3.3-6.4-6.1 0-.6.2-1.1.5-1.5z" fill="currentColor"/></svg>';
const INSTA = '<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>';

module.exports = { icone, nomes: Object.keys(I), WHATS, INSTA };
