// Laboratório Site Express · utilitários compartilhados das demonstrações.
// Tudo roda no navegador, com dados fictícios. Nada é enviado a servidor.
(function () {
  'use strict';

  var WA_NUMERO = '5561996113299'; // canal comercial do projeto (mesmo número da landing e do catálogo)
  var reduzMovimento = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function dd(n) { return (n < 10 ? '0' : '') + n; }
  function moeda(v) {
    try { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }); }
    catch (e) { return 'R$ ' + Math.round(v); }
  }
  function moedaCentavos(v) {
    try { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
    catch (e) { return 'R$ ' + Number(v).toFixed(2).replace('.', ','); }
  }
  function faixa(a, b) { return moeda(a) + ' a ' + moeda(b); }
  function hoje() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function addDias(d, n) { var x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
  function diasEntre(a, b) {
    var x = new Date(a.getTime()); x.setHours(0, 0, 0, 0);
    var y = new Date(b.getTime()); y.setHours(0, 0, 0, 0);
    return Math.round((y - x) / 86400000);
  }
  function dataBR(d) { return dd(d.getDate()) + '/' + dd(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function dataCurta(d) { return dd(d.getDate()) + '/' + dd(d.getMonth() + 1); }
  function paraISO(d) { return d.getFullYear() + '-' + dd(d.getMonth() + 1) + '-' + dd(d.getDate()); }
  function deISO(s) { // 'aaaa-mm-dd' -> Date local (sem deslocamento de fuso)
    var p = String(s || '').split('-');
    if (p.length !== 3) return null;
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime()) ? null : d;
  }
  var DIAS_SEMANA = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  function diaSemana(d) { return DIAS_SEMANA[d.getDay()]; }
  function horaAgora(d) { var n = d || new Date(); return dd(n.getHours()) + ':' + dd(n.getMinutes()); }

  // Link do WhatsApp com a mensagem pronta e a origem no fim, como na landing.
  function whats(mensagem, origem) {
    var texto = mensagem + (origem ? '\n\n(origem: ' + origem + ')' : '');
    return 'https://wa.me/' + WA_NUMERO + '?text=' + encodeURIComponent(texto);
  }

  function escapar(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // Região viva para leitores de tela.
  function anunciar(texto) {
    var el = document.getElementById('anuncio');
    if (!el) { el = document.createElement('div'); el.id = 'anuncio'; el.className = 'sr'; el.setAttribute('aria-live', 'polite'); document.body.appendChild(el); }
    el.textContent = '';
    setTimeout(function () { el.textContent = texto; }, 40);
  }

  var toastTimer;
  function toast(texto) {
    var el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; el.className = 'toast'; el.setAttribute('role', 'status'); document.body.appendChild(el); }
    el.textContent = texto;
    el.classList.add('toast--visivel');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('toast--visivel'); }, 2200);
  }

  // Copia texto; devolve Promise<boolean>. Mostra "Copiado!" no botão por 2 s.
  function copiar(texto, botao) {
    var rotulo = botao ? botao.textContent : '';
    function feito(ok) {
      if (botao) {
        botao.textContent = ok ? 'Copiado!' : 'Não foi possível copiar';
        setTimeout(function () { botao.textContent = rotulo; }, 2000);
      }
      anunciar(ok ? 'Texto copiado.' : 'Não foi possível copiar. Selecione o texto e copie manualmente.');
      return ok;
    }
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(texto).then(function () { return feito(true); }, function () { return feito(copiarLegado(texto)); });
    }
    return Promise.resolve(feito(copiarLegado(texto)));
  }
  function copiarLegado(texto) {
    var ta = document.createElement('textarea');
    ta.value = texto; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.left = '-9999px';
    document.body.appendChild(ta); ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  // Indicador de passos: marca o passo n (1-based) como atual e os anteriores como feitos.
  function passo(container, n) {
    if (!container) return;
    var itens = container.querySelectorAll('.passo');
    for (var i = 0; i < itens.length; i++) {
      var feito = i + 1 < n, atual = i + 1 === n;
      itens[i].classList.toggle('passo--feito', feito);
      if (atual) itens[i].setAttribute('aria-current', 'step'); else itens[i].removeAttribute('aria-current');
    }
  }

  // Validação: campo é o elemento .campo que envolve rótulo, controle e <p class="campo__erro">.
  var contadorErro = 0;
  function erro(campo, mensagem) {
    if (!campo) return;
    var controle = campo.querySelector('input, select, textarea');
    var msg = campo.querySelector('.campo__erro');
    campo.classList.add('campo--invalido');
    if (msg) { msg.textContent = mensagem; if (!msg.id) msg.id = 'erro-' + (++contadorErro); }
    if (controle) {
      controle.setAttribute('aria-invalid', 'true');
      if (msg) controle.setAttribute('aria-describedby', msg.id);
    }
  }
  function limparErros(raiz) {
    if (!raiz) return;
    var campos = raiz.querySelectorAll('.campo--invalido');
    for (var i = 0; i < campos.length; i++) {
      campos[i].classList.remove('campo--invalido');
      var c = campos[i].querySelector('input, select, textarea');
      if (c) { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); }
      var m = campos[i].querySelector('.campo__erro');
      if (m) m.textContent = '';
    }
  }
  function focarPrimeiroErro(raiz) {
    var c = raiz && raiz.querySelector('.campo--invalido input, .campo--invalido select, .campo--invalido textarea, .campo--invalido .ficha');
    if (c) c.focus();
    return !!c;
  }

  function rolarPara(el) {
    if (!el) return;
    // Em telas estreitas o resultado fica abaixo do formulário; levar o olhar até ele.
    if (window.innerWidth < 960) el.scrollIntoView({ behavior: reduzMovimento ? 'auto' : 'smooth', block: 'start' });
  }

  // Numeração sequencial fictícia: var proximo = Lab.sequencia('OS-', 1041); proximo() -> 'OS-1041'
  function sequencia(prefixo, inicio) {
    var n = inicio || 1;
    return function () { return prefixo + (n++); };
  }

  // Fichas (botões de escolha única) dentro de um contêiner. Chama aoEscolher(valor, botao).
  function ligarFichas(container, aoEscolher) {
    if (!container) return;
    container.addEventListener('click', function (ev) {
      var b = ev.target.closest('.ficha');
      if (!b || !container.contains(b)) return;
      var todos = container.querySelectorAll('.ficha');
      for (var i = 0; i < todos.length; i++) todos[i].setAttribute('aria-pressed', todos[i] === b ? 'true' : 'false');
      if (aoEscolher) aoEscolher(b.getAttribute('data-valor'), b);
    });
  }
  function fichaEscolhida(container) {
    var b = container && container.querySelector('.ficha[aria-pressed="true"]');
    return b ? b.getAttribute('data-valor') : null;
  }
  function escolherFicha(container, valor) {
    if (!container) return;
    var todos = container.querySelectorAll('.ficha');
    for (var i = 0; i < todos.length; i++) todos[i].setAttribute('aria-pressed', valor != null && todos[i].getAttribute('data-valor') === String(valor) ? 'true' : 'false');
  }

  window.Lab = {
    WA_NUMERO: WA_NUMERO, moeda: moeda, moedaCentavos: moedaCentavos, faixa: faixa,
    hoje: hoje, addDias: addDias, diasEntre: diasEntre, dataBR: dataBR, dataCurta: dataCurta, paraISO: paraISO, deISO: deISO,
    diaSemana: diaSemana, horaAgora: horaAgora, dd: dd,
    whats: whats, escapar: escapar, anunciar: anunciar, toast: toast, copiar: copiar,
    passo: passo, erro: erro, limparErros: limparErros, focarPrimeiroErro: focarPrimeiroErro, rolarPara: rolarPara,
    sequencia: sequencia, ligarFichas: ligarFichas, fichaEscolhida: fichaEscolhida, escolherFicha: escolherFicha
  };
})();
