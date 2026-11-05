#!/usr/bin/env node
"use strict";
// Tira as capturas de um site gerado: desktop, celular e arte.png (imagem de compartilhamento).
//   node gerador/capturar.js modelos/lis-estetica-beleza [pasta-de-saida]
// Precisa do Playwright instalado (npx playwright install chromium, na primeira vez).
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const RAIZ = path.resolve(__dirname, "..");
const TIPOS = { ".html": "text/html; charset=utf-8", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".avif": "image/avif" };

function servidor() {
  return new Promise((ok) => {
    const s = http.createServer((req, res) => {
      let f = path.join(RAIZ, decodeURIComponent(req.url.split("?")[0]));
      if (!f.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
      if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
      if (!fs.existsSync(f)) { res.writeHead(404); return res.end(); }
      res.writeHead(200, { "content-type": TIPOS[path.extname(f)] || "application/octet-stream" });
      fs.createReadStream(f).pipe(res);
    }).listen(0, "127.0.0.1", () => ok(s));
  });
}

(async () => {
  const [alvo, saidaArg] = process.argv.slice(2);
  if (!alvo) { console.log("Uso: node gerador/capturar.js <pasta-do-site> [pasta-de-saida]"); process.exit(1); }
  const pasta = path.resolve(alvo);
  const nome = path.basename(pasta);
  const saida = path.resolve(saidaArg || pasta);
  fs.mkdirSync(saida, { recursive: true });
  const s = await servidor();
  const url = `http://127.0.0.1:${s.address().port}/${path.relative(RAIZ, pasta).split(path.sep).join("/")}/`;
  const browser = await chromium.launch();
  try {
    const shots = [
      { arq: `${nome}-desktop.png`, viewport: { width: 1440, height: 900 }, scale: 1, full: true },
      { arq: `${nome}-celular.png`, viewport: { width: 390, height: 844 }, scale: 2, full: true, mobile: true },
      { arq: `${nome}-desktop-topo.png`, viewport: { width: 1440, height: 900 }, scale: 1 },
      { arq: `${nome}-celular-topo.png`, viewport: { width: 390, height: 844 }, scale: 2, mobile: true },
    ];
    for (const sh of shots) {
      const ctx = await browser.newContext({ viewport: sh.viewport, deviceScaleFactor: sh.scale, isMobile: !!sh.mobile, hasTouch: !!sh.mobile });
      const pg = await ctx.newPage();
      await pg.goto(url, { waitUntil: "networkidle" });
      await pg.evaluate(() => document.fonts.ready);
      await pg.screenshot({ path: path.join(saida, sh.arq), fullPage: !!sh.full });
      await ctx.close();
    }
    // Arte de compartilhamento (1200x630) a partir do topo do site
    const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    await pg.goto(url, { waitUntil: "networkidle" });
    await pg.addStyleTag({ content: ".demo,.header{display:none!important}.hero .wrap{padding-top:48px!important}" });
    await pg.evaluate(() => document.fonts.ready);
    await pg.screenshot({ path: path.join(pasta, "arte.png") });
    await ctx.close();
    console.log(`ok  capturas de ${nome} em ${saida}`);
  } finally {
    await browser.close();
    s.close();
  }
})().catch((e) => { console.error(e); process.exit(1); });
