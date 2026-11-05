"use strict";
// Monta o HTML do site a partir da configuração já mesclada (segmento + cliente).
const { paleta } = require("./cores");
const { icone, WHATS, INSTA } = require("./icones");
const { ilustracoes } = require("./ilustracoes");

const SITE_EXPRESS_WHATS = "5561996113299";

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// *texto* vira destaque colorido no título
const destaque = (s) => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>");
const wa = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
const preencher = (modelo, dados) => String(modelo).replace(/\{(\w+)\}/g, (_, k) => dados[k] ?? "");

function iniciais(nome) {
  const ignorar = /^(de|da|do|das|dos|e|&|the)$/i;
  const partes = nome.replace(/[^\p{L}\p{N}\s&]/gu, " ").split(/\s+/).filter((w) => w && !ignorar.test(w));
  return (partes.length > 1 ? partes[0][0] + partes[1][0] : (partes[0] || "S").slice(0, 2)).toUpperCase();
}

function pagina(c, { fotos = {} } = {}) {
  const p = paleta(c.cores);
  const ilus = ilustracoes(c.segmento, p);
  const R = c.rotulos;
  const modo = c.modo; // "previa" | "modelo" | "final"
  const demo = modo !== "final";
  const nomeCompleto = c.complemento ? `${c.nome} ${c.complemento}` : c.nome;
  const da = c.artigo || "da"; // "da Lis Estética", "do Torque Auto Center"
  const subst = { nome: c.nome, da, cidade: c.endereco?.cidade || "" };

  // Para onde vão os botões
  const linkSite = demo
    ? wa(SITE_EXPRESS_WHATS, modo === "previa" ? `Olá! Vi a prévia do site ${da} ${c.nome} e quero saber mais.` : `Olá! Vi o modelo ${c.nome} e quero um site assim para o meu negócio.`)
    : null;
  const acao = (texto) => demo
    ? `href="#aviso-demonstracao" data-demo-notice`
    : `href="${esc(wa(c.whatsapp, texto))}" target="_blank" rel="noopener"`;
  const msgGeral = preencher(c.mensagens.geral, subst);
  const btn = (rotulo, extra = "", texto = msgGeral) => `<a class="btn btn-d${extra}" ${acao(texto)}>${WHATS}<span>${esc(rotulo)}</span></a>`;

  const marca = c.logo && fotos.logo
    ? `<img src="${esc(fotos.logo)}" alt="" width="40" height="40">`
    : `<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="${p.destaque}" stroke-width="2"/><text x="20" y="25" text-anchor="middle" font-family="Sora, sans-serif" font-size="13" font-weight="700" fill="${p.texto}" letter-spacing=".5">${esc(iniciais(c.nome))}</text></svg>`;

  const heroArte = fotos.capa
    ? `<figure class="hero-foto"><img src="${esc(fotos.capa)}" alt="${esc(c.fotos?.capaDescricao || `Foto de ${c.nome}`)}" width="880" height="1012" fetchpriority="high"></figure>`
    : ilus.hero;

  const servicos = c.servicos.map((s) => `
        <li class="svc">
          ${icone(s.icone)}
          ${s.categoria ? `<p class="cat">${esc(s.categoria)}</p>` : ""}
          <h3>${esc(s.nome)}</h3>
          <p>${esc(s.descricao)}</p>
          ${s.preco ? `<div class="price"><span>${esc(R.valor)}</span><strong>${s.prefixo === "" ? "" : `<small>${esc(s.prefixo ?? R.prefixoPreco)}</small>`}${esc(s.preco)}</strong></div>` : ""}
          <a ${acao(preencher(c.mensagens.servico, { ...subst, servico: s.nome }))}>${esc(R.ctaServico)} →</a>
        </li>`).join("");

  const galeria = (c.galeria || []).slice(0, 6).map((g, i) => {
    const foto = fotos.galeria?.[i];
    const midia = foto
      ? `<img src="${esc(foto)}" alt="${esc(g.titulo)}" width="600" height="450" loading="lazy" decoding="async">`
      : ilus.galeria[i % ilus.galeria.length];
    return `
        <figure>
          ${midia}
          <figcaption>${esc(g.titulo)} <span>${esc(g.detalhe || "")}</span></figcaption>
        </figure>`;
  }).join("");
  const temFotosGaleria = (fotos.galeria || []).some(Boolean);

  const diferenciais = (c.diferenciais || []).map((d) => `<li>${icone(d.icone || "check")}<div><h3>${esc(d.titulo)}</h3><p>${esc(d.texto)}</p></div></li>`).join("");
  const passos = c.passos.map((s) => `<li><h3>${esc(s.titulo)}</h3><p>${esc(s.texto)}</p></li>`).join("");
  const horarios = c.horarios.map(([d, h]) => `<div><dt>${esc(d)}</dt><dd>${esc(h)}</dd></div>`).join("");
  const faq = (c.faq || []).map((f) => `<details><summary>${esc(f.pergunta)}</summary><p>${esc(f.resposta)}</p></details>`).join("");
  const e = c.endereco || {};
  const mapaLink = e.mapa || (e.rua ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([c.nome, e.rua, e.bairro, e.cidade].filter(Boolean).join(", "))}` : null);
  const insta = c.instagram ? c.instagram.replace(/^@/, "") : null;
  const maiusc = c.estilo?.maiusculas !== false;

  const faixa = modo === "previa"
    ? `<div class="demo" role="note"><b>Prévia feita para ${esc(c.nome)}</b> <span>· Criada pela Site Express. Textos, preços e fotos são de exemplo e serão trocados pelos seus.</span></div>`
    : modo === "modelo"
      ? `<div class="demo" role="note"><b>Modelo demonstrativo</b> <span>· ${esc(c.nome)} é uma empresa fictícia. Textos, preços e imagens são de exemplo.</span></div>`
      : "";

  const avisoTitulo = modo === "previa" ? `Esta é uma prévia do site ${da} ${c.nome}` : `Este é um modelo da Site Express`;
  const avisoTexto = modo === "previa"
    ? `No site final, este botão abre o WhatsApp de vocês com uma mensagem pronta para o cliente. Quer colocar o site no ar? Fica pronto em até 24h.`
    : `No site do seu negócio, este botão abre o seu WhatsApp com uma mensagem pronta para o cliente. Quer um site assim, com a sua marca? Fica pronto em até 24h.`;

  const titulo = modo === "final" ? `${nomeCompleto} · ${c.endereco?.cidade || ""}`.replace(/ · $/, "")
    : modo === "previa" ? `${nomeCompleto} · Prévia do site · Site Express` : `${nomeCompleto} · Modelo Site Express`;
  const descricao = modo === "final" ? c.textos.subtitulo : modo === "previa" ? `Prévia de site criada pela Site Express para ${c.nome}.` : `Modelo de site da Site Express para ${c.segmentoNome}. Empresa fictícia.`;

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descricao)}">
${demo ? '<meta name="robots" content="noindex, nofollow">\n' : ""}<meta name="theme-color" content="${p.fundo}">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${esc(modo === "previa" ? `${c.nome} · Prévia do site` : nomeCompleto)}">
<meta property="og:description" content="${esc(descricao)}">
<meta property="og:site_name" content="${esc(c.nome)}">
${c.urlPublica ? `<meta property="og:url" content="${esc(c.urlPublica)}">\n<meta property="og:image" content="${esc(c.urlPublica.replace(/\/?$/, "/"))}arte.png">\n` : ""}<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="preload" href="fonts/sora-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>
@font-face{font-family:"Sora";src:url("fonts/sora-latin-wght-normal.woff2") format("woff2");font-weight:100 800;font-display:swap}
@font-face{font-family:"Inter";src:url("fonts/inter-latin-wght-normal.woff2") format("woff2");font-weight:100 900;font-display:swap}
:root{
  --bg:${p.fundo};--bg-2:${p.fundo2};--card:${p.cartao};--line:${p.linha};
  --text:${p.texto};--muted:${p.suave};--d:${p.destaque};--d-txt:${p.destaqueTexto};--d-on:${p.sobreDestaque};--d-hover:${p.destaqueHover};--glow:${p.brilho};
  --display:"Sora",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --body:"Inter",ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
  --gutter:clamp(16px,4vw,40px);--radius:${c.estilo?.raio ?? 14}px;
  --caixa:${maiusc ? "uppercase" : "none"};
  color-scheme:${p.escuro ? "dark" : "light"};
}
*,*::before,*::after{box-sizing:border-box}
html{scroll-behavior:smooth;scroll-padding-top:80px;-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:400 1rem/1.6 var(--body);-webkit-font-smoothing:antialiased;overflow-x:clip}
h1,h2,h3,p,ul,ol,dl,dd,figure{margin:0}
ul,ol{padding:0;list-style:none}
a{color:inherit}
svg,img{display:block;max-width:100%}
:focus-visible{outline:3px solid var(--d-txt);outline-offset:3px;border-radius:6px}
.skip{position:absolute;left:16px;top:-60px;z-index:100;background:var(--d);color:var(--d-on);padding:10px 16px;border-radius:8px;font-weight:700;text-decoration:none}
.skip:focus{top:12px}
.wrap{max-width:1160px;margin:0 auto;padding:0 var(--gutter)}

.demo{background:var(--text);color:var(--bg);font-size:13px;line-height:1.4;text-align:center;padding:8px var(--gutter)}
.demo b{font-weight:700;letter-spacing:.04em}
.demo span{opacity:.75}
@media (max-width:620px){.demo span{display:none}}

.header{position:sticky;top:0;z-index:30;background:color-mix(in srgb,var(--bg) 92%,transparent);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
.header .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:68px}
.brand{display:flex;align-items:center;gap:10px;text-decoration:none;min-width:0}
.brand svg,.brand img{width:40px;height:40px;flex:none;border-radius:50%;object-fit:cover}
.brand b{display:block;font:700 17px/1.1 var(--display);letter-spacing:.02em;text-transform:var(--caixa);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.brand small{display:block;font:500 11px/1.3 var(--body);letter-spacing:.2em;text-transform:uppercase;color:var(--d-txt);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.nav{display:flex;gap:26px;font-size:14px;font-weight:500}
.nav a{text-decoration:none;color:var(--muted)}
.nav a:hover{color:var(--text)}
@media (max-width:900px){.nav{display:none}}
@media (max-width:520px){.brand b{font-size:15px}.brand small{letter-spacing:.12em}}

.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:50px;padding:0 24px;border-radius:min(var(--radius),999px);font:600 15px/1.2 var(--body);text-decoration:none;letter-spacing:.01em;transition:background .2s,transform .2s,border-color .2s;text-align:center;cursor:pointer}
.btn svg{width:20px;height:20px;flex:none}
.btn-d{background:var(--d);color:var(--d-on);border:0}
.btn-d:hover{background:var(--d-hover);transform:translateY(-1px)}
.btn-line{border:1px solid color-mix(in srgb,var(--text) 30%,transparent);color:var(--text);background:transparent}
.btn-line:hover{border-color:var(--d)}
.header .btn{min-height:42px;padding:0 16px;font-size:14px;flex:none}
@media (max-width:420px){.header .btn span{display:none}.header .btn{padding:0 12px}}

.hero{position:relative;overflow:hidden;border-bottom:1px solid var(--line);background:radial-gradient(50% 60% at 85% 30%,var(--glow),transparent 70%),var(--bg)}
.hero .wrap{display:grid;gap:40px;align-items:center;padding-top:clamp(40px,7vw,96px);padding-bottom:clamp(48px,7vw,96px)}
@media (min-width:900px){.hero .wrap{grid-template-columns:1.1fr .9fr}}
.kicker{display:inline-flex;align-items:center;gap:12px;font:600 12px/1.2 var(--body);letter-spacing:.24em;text-transform:uppercase;color:var(--d-txt);margin-bottom:20px}
.kicker::before{content:"";width:32px;height:2px;background:var(--d);flex:none}
@media (max-width:520px){.kicker{letter-spacing:.14em}}
h1{font:700 clamp(36px,6.2vw,66px)/1.04 var(--display);letter-spacing:-.03em;text-transform:var(--caixa);text-wrap:balance}
h1 em,h2 em{font-style:normal;color:var(--d-txt)}
.lead{margin-top:20px;font-size:clamp(17px,2vw,19px);color:var(--muted);max-width:50ch}
.ctas{display:flex;flex-wrap:wrap;gap:12px;margin-top:30px}
@media (max-width:520px){.ctas .btn{width:100%}}
.chips{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:28px;font-size:14px;color:var(--muted)}
.chips li{display:flex;align-items:center;gap:8px}
.chips li::before{content:"";width:6px;height:6px;background:var(--d);transform:rotate(45deg)}
.hero-art{max-width:440px;width:100%;margin:0 auto}
.hero-foto{border-radius:220px 220px var(--radius) var(--radius);overflow:hidden;border:2px solid var(--d);aspect-ratio:400/460}
.hero-foto img{width:100%;height:100%;object-fit:cover}

section{padding:clamp(56px,8vw,104px) 0}
.head{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:end;gap:12px 32px;margin-bottom:36px}
h2{font:700 clamp(28px,4vw,44px)/1.08 var(--display);letter-spacing:-.02em;text-transform:var(--caixa);text-wrap:balance}
.head p{color:var(--muted);max-width:46ch}
.alt{background:var(--bg-2);border-top:1px solid var(--line);border-bottom:1px solid var(--line)}

.difs{display:grid;gap:14px}
@media (min-width:760px){.difs{grid-template-columns:repeat(3,1fr)}}
.difs li{display:flex;gap:16px;align-items:flex-start;padding:22px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card)}
.difs svg{width:34px;height:34px;flex:none;color:var(--d-txt)}
.difs h3{font:600 17px/1.3 var(--display);margin-bottom:4px}
.difs p{color:var(--muted);font-size:15px}
.difs-sec{padding:clamp(32px,5vw,56px) 0 0}

.services{display:grid;gap:1px;background:var(--line);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
@media (min-width:700px){.services{grid-template-columns:repeat(2,1fr)}}
@media (min-width:1040px){.services{grid-template-columns:repeat(3,1fr)}}
.svc{background:var(--card);padding:26px 24px;display:flex;flex-direction:column;gap:10px}
.svc svg{width:36px;height:36px;color:var(--d-txt)}
.svc .cat{font:600 11px/1 var(--body);letter-spacing:.18em;text-transform:uppercase;color:var(--muted)}
.svc h3{font:600 19px/1.25 var(--display)}
.svc p{color:var(--muted);font-size:15px;flex:1}
.svc .cat{flex:0}
.svc .price{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-top:14px;border-top:1px dashed var(--line);font-size:14px;color:var(--muted)}
.svc .price strong{font:700 20px/1 var(--display);color:var(--text)}
.svc .price strong small{font:500 12px/1 var(--body);color:var(--muted);margin-right:4px;text-transform:uppercase;letter-spacing:.06em}
.svc a{font-weight:600;font-size:14px;color:var(--d-txt);text-decoration:none}
.svc a:hover{text-decoration:underline}
.fine{margin-top:16px;font-size:13px;color:var(--muted)}

.gallery{display:grid;gap:14px;grid-template-columns:repeat(2,1fr)}
@media (min-width:900px){.gallery{grid-template-columns:repeat(3,1fr)}}
.gallery figure{background:var(--card);border:1px solid var(--line);border-radius:var(--radius);overflow:hidden}
.gallery svg,.gallery img{width:100%;height:auto;aspect-ratio:4/3;object-fit:cover}
.gallery figcaption{padding:12px 14px;font-size:14px;font-weight:600;display:flex;justify-content:space-between;gap:8px}
.gallery figcaption span{color:var(--muted);font-weight:400}
@media (max-width:520px){.gallery figcaption{flex-direction:column;gap:0}}

.steps{display:grid;gap:16px;counter-reset:s}
@media (min-width:800px){.steps{grid-template-columns:repeat(3,1fr)}}
.steps li{counter-increment:s;padding:26px 24px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card)}
.steps li::before{content:"0" counter(s);display:block;font:700 34px/1 var(--display);color:var(--d-txt);margin-bottom:14px}
.steps h3{font:600 18px/1.3 var(--display);margin-bottom:6px}
.steps p{color:var(--muted);font-size:15px}

.faq{display:grid;gap:10px;max-width:820px}
.faq details{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);padding:0 22px}
.faq summary{cursor:pointer;list-style:none;padding:18px 32px 18px 0;font:600 16px/1.4 var(--display);position:relative}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";position:absolute;right:0;top:14px;font:400 24px/1 var(--body);color:var(--d-txt)}
.faq details[open] summary::after{content:"−"}
.faq details p{color:var(--muted);padding-bottom:18px;font-size:15px}

.visit{display:grid;gap:20px}
@media (min-width:900px){.visit{grid-template-columns:1fr 1.2fr}}
.box{border:1px solid var(--line);border-radius:var(--radius);background:var(--card);padding:28px 26px}
.box h3{font:600 20px/1.2 var(--display);margin-bottom:18px}
.hours div{display:flex;justify-content:space-between;gap:16px;padding:12px 0;border-bottom:1px solid var(--line)}
.hours div:last-child{border-bottom:0}
.hours dt{color:var(--muted)}
.hours dd{font-weight:600;text-align:right}
.address{display:flex;flex-direction:column;gap:18px}
.address p{color:var(--muted)}
.address strong{color:var(--text);font-weight:600}
.map{border-radius:10px;overflow:hidden;border:1px solid var(--line)}
.map svg{width:100%;height:auto}

.final{text-align:center;background:radial-gradient(60% 80% at 50% 0%,var(--glow),transparent 70%),var(--bg)}
.final h2{max-width:20ch;margin:0 auto}
.final p{color:var(--muted);margin:16px auto 0;max-width:46ch}
.final .ctas{justify-content:center}

footer{border-top:1px solid var(--line);padding:32px 0 40px;font-size:13px;color:var(--muted)}
footer .wrap{display:flex;flex-wrap:wrap;justify-content:space-between;gap:10px 24px}
footer a{color:var(--d-txt)}
.social{display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.social svg{width:16px;height:16px}

.fab{display:none}
@media (max-width:760px){
  .fab{display:flex;position:fixed;z-index:40;left:16px;right:16px;bottom:calc(14px + env(safe-area-inset-bottom));box-shadow:0 14px 34px -10px rgba(0,0,0,.6)}
  body{padding-bottom:84px}
}

dialog{max-width:min(440px,calc(100% - 32px));border:1px solid var(--line);border-radius:var(--radius);background:var(--bg-2);color:var(--text);padding:28px 26px}
dialog::backdrop{background:rgba(0,0,0,.7)}
dialog h2{font-size:22px;text-transform:none;letter-spacing:-.01em;margin-bottom:10px}
dialog p{color:var(--muted);margin-bottom:20px}
dialog .ctas{margin-top:0}
@media (prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
</style>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
${faixa}
<header class="header">
  <div class="wrap">
    <a class="brand" href="#topo" aria-label="${esc(c.nome)}, início">
      ${marca}
      <span><b>${esc(c.nome)}</b><small>${esc(c.complemento || c.endereco?.cidade || "")}</small></span>
    </a>
    <nav class="nav" aria-label="Seções">
      <a href="#servicos">${esc(R.secaoServicos)}</a>
      <a href="#galeria">${esc(R.secaoGaleria)}</a>
      <a href="#como">${esc(R.secaoPassos)}</a>
      <a href="#visite">Horários e endereço</a>
    </nav>
    ${btn(R.ctaCurto)}
  </div>
</header>

<main id="conteudo">
  <div class="hero" id="topo">
    <div class="wrap">
      <div>
        <p class="kicker">${esc(preencher(c.textos.kicker, subst))}</p>
        <h1>${destaque(c.textos.titulo)}</h1>
        <p class="lead">${esc(preencher(c.textos.subtitulo, subst))}</p>
        <div class="ctas">
          ${btn(R.cta)}
          <a class="btn btn-line" href="#servicos">${esc(R.verServicos)}</a>
        </div>
        <ul class="chips">${(c.textos.chips || []).map((x) => `<li>${esc(x)}</li>`).join("")}</ul>
      </div>
      <div class="hero-art">${heroArte}</div>
    </div>
  </div>
${diferenciais ? `
  <section class="difs-sec" aria-label="Diferenciais">
    <div class="wrap"><ul class="difs">${diferenciais}</ul></div>
  </section>
` : ""}
  <section id="servicos" aria-labelledby="t-servicos">
    <div class="wrap">
      <div class="head">
        <div>
          <p class="kicker">${esc(R.secaoServicos)}</p>
          <h2 id="t-servicos">${destaque(c.textos.tituloServicos)}</h2>
        </div>
        <p>${esc(c.textos.notaServicos)}</p>
      </div>
      <ul class="services">${servicos}
      </ul>
      ${demo ? `<p class="fine">Valores de exemplo. No site final, entram ${esc(R.itens)} e preços ${modo === "previa" ? `${da} ${esc(c.nome)}` : "do seu negócio"}.</p>` : ""}
    </div>
  </section>

  <section id="galeria" class="alt" aria-labelledby="t-galeria">
    <div class="wrap">
      <div class="head">
        <div>
          <p class="kicker">${esc(R.secaoGaleria)}</p>
          <h2 id="t-galeria">${destaque(c.textos.tituloGaleria)}</h2>
        </div>
        ${demo && !temFotosGaleria ? `<p>No site real, aqui entram as fotos ${modo === "previa" ? `${da} ${esc(c.nome)}` : "do seu negócio"}. Neste ${modo === "previa" ? "rascunho" : "modelo"}, usamos ilustrações.</p>` : c.textos.notaGaleria ? `<p>${esc(c.textos.notaGaleria)}</p>` : ""}
      </div>
      <div class="gallery">${galeria}
      </div>
    </div>
  </section>

  <section id="como" aria-labelledby="t-como">
    <div class="wrap">
      <div class="head">
        <div>
          <p class="kicker">${esc(R.secaoPassos)}</p>
          <h2 id="t-como">${destaque(c.textos.tituloPassos)}</h2>
        </div>
      </div>
      <ol class="steps">${passos}</ol>
      <div class="ctas">${btn(R.ctaPassos)}</div>
    </div>
  </section>
${faq ? `
  <section id="duvidas" class="alt" aria-labelledby="t-duvidas">
    <div class="wrap">
      <div class="head"><div><p class="kicker">Dúvidas</p><h2 id="t-duvidas">Perguntas frequentes</h2></div></div>
      <div class="faq">${faq}</div>
    </div>
  </section>
` : ""}
  <section id="visite" class="${faq ? "" : "alt"}" aria-labelledby="t-visite">
    <div class="wrap">
      <div class="head"><div><p class="kicker">Visite</p><h2 id="t-visite">Horários e endereço</h2></div></div>
      <div class="visit">
        <div class="box">
          <h3>Horário de atendimento</h3>
          <dl class="hours">${horarios}</dl>
        </div>
        <div class="box address">
          <h3>Onde estamos</h3>
          <p><strong>${esc(e.rua || "")}</strong>${e.bairro ? `<br>${esc(e.bairro)}` : ""}<br>${esc(e.cidade || "")}</p>
          <div class="map">${ilus.mapa}</div>
          ${demo || !mapaLink ? `<a class="btn btn-line" ${acao(preencher(c.mensagens.localizacao, subst))}>Pedir a localização no WhatsApp</a>` : `<a class="btn btn-line" href="${esc(mapaLink)}" target="_blank" rel="noopener">Abrir no mapa</a>`}
        </div>
      </div>
    </div>
  </section>

  <section class="final ${faq ? "alt" : ""}" aria-labelledby="t-final">
    <div class="wrap">
      <h2 id="t-final">${destaque(c.textos.tituloFinal)}</h2>
      <p>${esc(c.textos.textoFinal)}</p>
      <div class="ctas">${btn(R.cta)}</div>
    </div>
  </section>
</main>

<footer>
  <div class="wrap">
    <p>© ${new Date().getFullYear()} ${esc(nomeCompleto)}${demo ? (modo === "previa" ? " · Prévia criada pela Site Express" : " · Empresa fictícia · Modelo Site Express") : ""}</p>
    ${insta ? `<a class="social" href="https://instagram.com/${esc(insta)}" target="_blank" rel="noopener">${INSTA}@${esc(insta)}</a>` : ""}
    ${demo ? `<p>Gostou? <a href="${esc(linkSite)}" target="_blank" rel="noopener">${modo === "previa" ? "Coloque este site no ar com a Site Express" : "Quero um site assim"}</a></p>` : `<p>Site feito pela <a href="https://vinriibeiro.github.io/site-express/?ref=rodape-cliente" target="_blank" rel="noopener">Site Express</a></p>`}
  </div>
</footer>

${btn(R.cta, " fab")}
${demo ? `
<dialog id="aviso-demonstracao" aria-labelledby="aviso-titulo">
  <h2 id="aviso-titulo">${esc(avisoTitulo)}</h2>
  <p>${esc(avisoTexto)}</p>
  <div class="ctas">
    <a class="btn btn-d" href="${esc(linkSite)}" target="_blank" rel="noopener">${modo === "previa" ? "Quero este site" : "Quero um site assim"}</a>
    <button type="button" class="btn btn-line" data-close>Continuar vendo</button>
  </div>
</dialog>

<script>
(function () {
  var d = document.getElementById("aviso-demonstracao"), last = null;
  if (!d || typeof d.showModal !== "function") return;
  var links = document.querySelectorAll("[data-demo-notice]");
  for (var i = 0; i < links.length; i++) {
    links[i].addEventListener("click", function (e) { e.preventDefault(); last = this; d.showModal(); });
  }
  d.querySelector("[data-close]").addEventListener("click", function () { d.close(); });
  d.addEventListener("click", function (e) { if (e.target === d) d.close(); });
  d.addEventListener("close", function () { if (last) last.focus(); });
})();
</script>` : ""}
</body>
</html>
`;
}

function favicon(c) {
  const p = paleta(c.cores);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><circle cx="20" cy="20" r="19" fill="${p.fundo}" stroke="${p.destaque}" stroke-width="2"/><text x="20" y="25.5" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${p.texto}">${esc(iniciais(c.nome))}</text></svg>`;
}

module.exports = { pagina, favicon };
