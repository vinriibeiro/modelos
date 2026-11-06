// Doce Fluxo · Confeitaria — demonstração do Laboratório Site Express.
// Regras fictícias de prazo e capacidade, processadas só no navegador. Nada é enviado.
(function () {
  'use strict';
  var Lab = window.Lab;
  if (!Lab) return;

  var EMPRESA = 'Doce Ateliê Confeitaria';
  var CAPACIDADE_DIA = 6;     // pontos de produção por dia
  var JANELA_BUSCA = 14;      // dias à frente para procurar outra data
  var LIMITE_GRANDE = 20;     // acima disso, pedido grande
  var TAXA_URGENCIA = 30;     // % sobre o valor, só informativo

  // Catálogo fictício: pontos de produção por unidade e antecedência mínima em dias.
  var PRODUTOS = {
    'bolo-decorado': { nome: 'Bolo decorado', unidade: 'unidade', plural: 'unidades', pontos: 1, minDias: 2 },
    'docinhos': { nome: 'Docinhos (cento)', unidade: 'cento', plural: 'centos', pontos: 0.5, minDias: 2 },
    'cupcakes': { nome: 'Cupcakes (dúzia)', unidade: 'dúzia', plural: 'dúzias', pontos: 0.4, minDias: 1 },
    'bolo-festa': { nome: 'Bolo de festa personalizado', unidade: 'unidade', plural: 'unidades', pontos: 2, minDias: 5 }
  };
  var PERSONALIZACOES = {
    'nenhuma': { nome: 'Sem personalização', mult: 1, extraDias: 0, aprovacao: false },
    'tema': { nome: 'Tema ou cores', mult: 1.25, extraDias: 1, aprovacao: false },
    'topo': { nome: 'Topo modelado ou foto comestível', mult: 1.6, extraDias: 2, aprovacao: true }
  };

  // Ocupação fictícia e determinística da agenda (pontos já comprometidos naquele dia).
  // Domingo: fechado (null). Sábado: 5 pontos. Dias pares: 4 pontos. Dias ímpares: 2 pontos.
  function ocupacaoDoDia(d) {
    var ds = d.getDay();
    if (ds === 0) return null;
    if (ds === 6) return 5;
    return d.getDate() % 2 === 0 ? 4 : 2;
  }

  // Regras do fluxo, em linguagem simples. Cada uma avalia o pedido já calculado (ctx).
  var REGRAS = [
    {
      nome: 'Antecedência mínima',
      explicacao: 'Mínimo do produto + extra da personalização. Se faltam menos dias que isso, o pedido é urgente.',
      avaliar: function (c) {
        return {
          tipo: c.urgente ? 'erro' : 'ok',
          efeito: c.prod.minDias + ' dia(s) do produto + ' + c.pers.extraDias + ' da personalização = mínimo de ' + c.minDias + ' dia(s). Entrega em ' + c.dias + ' dia(s).',
          delta: c.urgente ? 'Urgente' : 'No prazo'
        };
      }
    },
    {
      nome: 'Capacidade do dia',
      explicacao: 'Pontos do pedido = pontos do produto × quantidade × multiplicador. Cada dia tem 6 pontos; se estourar, a automação sugere a próxima data com espaço.',
      avaliar: function (c) {
        var conta = fmt(c.prod.pontos) + ' × ' + c.quantidade + ' × ' + fmt(c.pers.mult) + ' = ' + fmt(c.pontos) + ' ponto(s). ';
        if (c.domingo) return { tipo: 'atencao', efeito: conta + 'Sem produção no domingo.', delta: 'Sem agenda' };
        return {
          tipo: c.cabe ? 'ok' : 'atencao',
          efeito: conta + 'O dia já tem ' + fmt(c.ocupados) + ' de ' + CAPACIDADE_DIA + ' ocupados' + (c.cabe ? '; ficam ' + fmt(c.livres) + ' livres após o pedido.' : '; faltariam ' + fmt(c.ocupados + c.pontos - CAPACIDADE_DIA) + ' ponto(s).'),
          delta: c.cabe ? 'Cabe' : 'Não cabe'
        };
      }
    },
    {
      nome: 'Dia de entrega',
      explicacao: 'Domingo não há entrega. A automação sugere o sábado anterior ou a segunda seguinte.',
      avaliar: function (c) {
        if (!c.domingo) return { tipo: 'ok', efeito: Cap(Lab.diaSemana(c.data)) + ', dia normal de entrega.', delta: 'Ok' };
        return { tipo: 'atencao', efeito: 'Domingo. Sugestões: ' + c.sugestoesDomingo.map(function (s) { return s.texto; }).join(' ou ') + '.', delta: 'Sem entrega' };
      }
    },
    {
      nome: 'Topo modelado ou foto',
      explicacao: 'Sempre passa pela confeiteira, que confirma se o desenho é viável.',
      avaliar: function (c) {
        return c.pers.aprovacao
          ? { tipo: 'atencao', efeito: 'A confeiteira confirma a viabilidade do topo ou da foto antes de aceitar.', delta: 'Aprovação' }
          : { tipo: 'ok', efeito: 'Não se aplica a esta personalização.', delta: 'Ok' };
      }
    },
    {
      nome: 'Pedido grande',
      explicacao: 'Acima de 20 unidades a confeiteira aprova antes, para organizar insumos e equipe.',
      avaliar: function (c) {
        return c.quantidade > LIMITE_GRANDE
          ? { tipo: 'atencao', efeito: c.quantidade + ' ' + c.prod.plural + ', acima de ' + LIMITE_GRANDE + '. Precisa de aprovação.', delta: 'Aprovação' }
          : { tipo: 'ok', efeito: c.quantidade + ' ' + (c.quantidade === 1 ? c.prod.unidade : c.prod.plural) + ', dentro do padrão.', delta: 'Ok' };
      }
    }
  ];

  // ---- utilitários locais ----
  function fmt(n) {
    try { return Number(n).toLocaleString('pt-BR', { maximumFractionDigits: 2 }); }
    catch (e) { return String(Math.round(n * 100) / 100).replace('.', ','); }
  }
  function Cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  function arred(n) { return Math.round(n * 100) / 100; }
  function dataLonga(d) { return Lab.diaSemana(d) + ', ' + Lab.dataBR(d); }
  function diaCabe(d, pontos) { var oc = ocupacaoDoDia(d); return oc !== null && oc + pontos <= CAPACIDADE_DIA; }

  // Primeira data a partir de `inicio` (inclusive) que respeita a antecedência e tem espaço.
  function proximaData(inicio, minDias, pontos) {
    var hoje = Lab.hoje();
    for (var i = 0; i <= JANELA_BUSCA; i++) {
      var d = Lab.addDias(inicio, i);
      if (Lab.diasEntre(hoje, d) < minDias) continue;
      if (diaCabe(d, pontos)) return d;
    }
    return null;
  }

  // ---- análise do pedido ----
  function analisar(p) {
    var prod = PRODUTOS[p.produto], pers = PERSONALIZACOES[p.personalizacao];
    var hoje = Lab.hoje();
    var c = {
      data: p.data, quantidade: p.quantidade, cliente: p.cliente, prod: prod, pers: pers,
      dias: Lab.diasEntre(hoje, p.data),
      minDias: prod.minDias + pers.extraDias,
      pontos: arred(prod.pontos * p.quantidade * pers.mult)
    };
    c.ocupados = ocupacaoDoDia(p.data);
    c.domingo = c.ocupados === null;
    c.cabe = !c.domingo && c.ocupados + c.pontos <= CAPACIDADE_DIA;
    c.livres = c.cabe ? arred(CAPACIDADE_DIA - c.ocupados - c.pontos) : 0;
    c.urgente = c.dias < c.minDias;
    c.motivos = [];
    c.dataSugerida = null;
    c.sugestoesDomingo = [];

    if (c.domingo) {
      var sab = Lab.addDias(p.data, -1), seg = Lab.addDias(p.data, 1);
      var sabOk = Lab.diasEntre(hoje, sab) >= c.minDias && diaCabe(sab, c.pontos);
      var segOk = diaCabe(seg, c.pontos);
      c.sugestoesDomingo.push({ data: sab, ok: sabOk, texto: 'sábado ' + Lab.dataBR(sab) + (sabOk ? ' (tem espaço)' : ' (sem espaço ou prazo)') });
      c.sugestoesDomingo.push({ data: seg, ok: segOk, texto: 'segunda ' + Lab.dataBR(seg) + (segOk ? ' (tem espaço)' : ' (sem espaço)') });
      c.dataSugerida = sabOk ? sab : (segOk ? seg : proximaData(seg, c.minDias, c.pontos));
    }

    if (c.urgente) {
      c.status = 'urgente';
      c.proximaPossivel = proximaData(Lab.addDias(hoje, c.minDias), c.minDias, c.pontos);
      return c;
    }

    if (c.domingo) c.motivos.push('Domingo não há entrega.' + (c.dataSugerida ? ' Data sugerida: ' + dataLonga(c.dataSugerida) + '.' : ''));
    if (!c.domingo && !c.cabe) {
      c.dataSugerida = proximaData(Lab.addDias(p.data, 1), c.minDias, c.pontos);
      c.motivos.push('O dia ' + Lab.dataBR(p.data) + ' já tem ' + fmt(c.ocupados) + ' de ' + CAPACIDADE_DIA + ' pontos ocupados e o pedido usa ' + fmt(c.pontos) + '.' +
        (c.dataSugerida ? ' Próxima data com espaço: ' + dataLonga(c.dataSugerida) + '.' : ' Nenhuma data com espaço nos próximos ' + JANELA_BUSCA + ' dias; a confeiteira avalia dividir a produção.'));
    }
    if (pers.aprovacao) c.motivos.push('Topo modelado ou foto comestível: a confeiteira confirma a viabilidade.');
    if (p.quantidade > LIMITE_GRANDE) c.motivos.push('Pedido grande (' + p.quantidade + ' ' + prod.plural + '): acima de ' + LIMITE_GRANDE + ' unidades.');

    c.status = c.motivos.length ? 'aprovacao' : 'aceito';
    return c;
  }

  // ---- textos copiáveis ----
  var ROTULOS = { aceito: 'Aceito automaticamente', aprovacao: 'Aguarda aprovação da confeiteira', urgente: 'Urgente: fora do prazo padrão' };

  function fichaProducao(c, avaliacoes) {
    var l = [];
    l.push((c.status === 'aceito' ? 'FICHA DE PRODUÇÃO' : 'PRÉ-FICHA DE PRODUÇÃO (aguardando aprovação)') + ' · ' + EMPRESA);
    l.push('Cliente: ' + (c.cliente || 'não informado'));
    l.push('Produto: ' + c.prod.nome);
    l.push('Quantidade: ' + c.quantidade + ' ' + (c.quantidade === 1 ? c.prod.unidade : c.prod.plural));
    l.push('Personalização: ' + c.pers.nome + ' (×' + fmt(c.pers.mult) + ')');
    l.push('Entrega: ' + Lab.dataBR(c.data) + ' (' + Lab.diaSemana(c.data) + ')' + (c.dataSugerida ? ' · data sugerida: ' + Lab.dataBR(c.dataSugerida) + ' (' + Lab.diaSemana(c.dataSugerida) + ')' : ''));
    l.push('Produção: ' + fmt(c.pontos) + ' ponto(s) deste pedido · dia com ' + (c.domingo ? 'produção fechada' : fmt(c.ocupados) + ' de ' + CAPACIDADE_DIA + ' já ocupados'));
    l.push('Status: ' + ROTULOS[c.status]);
    if (c.motivos.length) l.push('Motivos: ' + c.motivos.join(' '));
    l.push('Regras aplicadas:');
    avaliacoes.forEach(function (a) { l.push('  - ' + a.regra.nome + ': ' + a.res.delta + '. ' + a.res.efeito); });
    l.push('Gerada em: ' + Lab.dataBR(new Date()) + ' às ' + Lab.horaAgora() + ' · demonstração com dados fictícios');
    return l.join('\n');
  }

  function pedidoEncaixe(c) {
    var l = [];
    l.push('PEDIDO DE ENCAIXE (urgente) · ' + EMPRESA);
    l.push('Cliente: ' + (c.cliente || 'não informado'));
    l.push('Produto: ' + c.prod.nome + ' · ' + c.quantidade + ' ' + (c.quantidade === 1 ? c.prod.unidade : c.prod.plural) + ' · ' + c.pers.nome);
    l.push('Entrega pedida: ' + Lab.dataBR(c.data) + ' (' + Lab.diaSemana(c.data) + '), em ' + c.dias + ' dia(s). Mínimo padrão: ' + c.minDias + ' dia(s).');
    l.push('Produção: ' + fmt(c.pontos) + ' ponto(s) · dia com ' + (c.domingo ? 'produção fechada' : fmt(c.ocupados) + ' de ' + CAPACIDADE_DIA + ' ocupados'));
    l.push('Condição: taxa de urgência de ' + TAXA_URGENCIA + '%, sujeito a confirmação da confeiteira.');
    l.push('Próxima data no prazo padrão: ' + (c.proximaPossivel ? Lab.dataBR(c.proximaPossivel) + ' (' + Lab.diaSemana(c.proximaPossivel) + ')' : 'nenhuma nos próximos ' + JANELA_BUSCA + ' dias'));
    l.push('Status: aguardando confirmação · sem ficha de produção automática');
    l.push('Gerado em: ' + Lab.dataBR(new Date()) + ' às ' + Lab.horaAgora() + ' · demonstração com dados fictícios');
    return l.join('\n');
  }

  // ---- renderização ----
  var e = Lab.escapar;
  var form = document.getElementById('formulario');
  var resultado = document.getElementById('resultado');
  var passos = document.querySelector('.passos');
  var campoData = document.getElementById('data');
  var campoQtd = document.getElementById('quantidade');
  var campoProduto = document.getElementById('produto');
  var campoCliente = document.getElementById('cliente');
  var fichas = document.getElementById('personalizacao');
  var atual = null; // última análise, usada pelos botões do resultado

  function htmlRegras(avaliacoes) {
    var h = '<div class="regras">';
    avaliacoes.forEach(function (a) {
      h += '<div class="regra regra--' + a.res.tipo + '"><span class="regra__nome">' + e(a.regra.nome) + '</span><span class="regra__efeito">' + e(a.res.efeito) + '</span><span class="regra__delta">' + e(a.res.delta) + '</span></div>';
    });
    h += '</div><details><summary class="link-simples">Entenda as regras</summary><ul class="regras">';
    REGRAS.forEach(function (r) { h += '<li class="regra"><span class="regra__nome">' + e(r.nome) + '</span><span class="regra__efeito">' + e(r.explicacao) + '</span></li>'; });
    return h + '</ul></details>';
  }

  function htmlFicha(texto, titulo, rotuloBotao) {
    var linhas = texto.split('\n').length + 1;
    return '<h3>' + e(titulo) + '</h3>' +
      '<textarea class="briefing" readonly rows="' + linhas + '" aria-label="' + e(titulo) + '">' + e(texto) + '</textarea>' +
      '<div class="acoes"><button class="btn btn--primario btn--sm" type="button" data-copiar>' + e(rotuloBotao) + '</button></div>' +
      '<p class="dica-botao">Copia o texto para colar no WhatsApp, no caderno digital ou na planilha de produção.</p>';
  }

  function resumoPedido(c) {
    return e(c.prod.nome) + ', ' + c.quantidade + ' ' + e(c.quantidade === 1 ? c.prod.unidade : c.prod.plural) + ', ' + e(c.pers.nome.toLowerCase()) +
      (c.cliente ? ', para ' + e(c.cliente) : '') + '. Entrega ' + e(dataLonga(c.data)) + ' (em ' + c.dias + ' dia' + (c.dias === 1 ? '' : 's') + ').';
  }

  function render(c) {
    atual = c;
    var avaliacoes = REGRAS.map(function (r) { return { regra: r, res: r.avaliar(c) }; });
    var cls = { aceito: 'ok', aprovacao: 'atencao', urgente: 'erro' }[c.status];
    var h = '<article class="resultado resultado--' + cls + '">';
    h += '<div class="resultado__cabeca"><div><p class="resultado__rotulo">Decisão da automação</p><p class="resultado__valor">' +
      { aceito: 'Pedido aceito', aprovacao: 'Precisa de aprovação', urgente: 'Pedido urgente' }[c.status] + '</p></div>' +
      '<span class="etiqueta etiqueta--' + cls + '">' + e(ROTULOS[c.status]) + '</span></div>';
    h += '<p class="resultado__sub">' + resumoPedido(c) + '</p>';

    if (c.status === 'aceito') {
      h += '<p class="aviso aviso--ok">Usa ' + fmt(c.pontos) + ' de ' + CAPACIDADE_DIA + ' pontos do dia; ficam ' + fmt(c.livres) + ' livres depois deste pedido. A ficha de produção foi gerada e o cliente recebe a confirmação na hora.</p>';
    } else if (c.status === 'aprovacao') {
      h += '<div class="aviso aviso--atencao"><strong>Por que precisa de aprovação</strong><ul>';
      c.motivos.forEach(function (m) { h += '<li>· ' + e(m) + '</li>'; });
      h += '</ul></div>';
    } else {
      h += '<p class="aviso aviso--erro">Faltam <strong>' + c.dias + ' dia' + (c.dias === 1 ? '' : 's') + '</strong> para a entrega e o mínimo deste pedido é <strong>' + c.minDias + ' dias</strong> (' + c.prod.minDias + ' do produto + ' + c.pers.extraDias + ' da personalização). Sem ficha de produção automática: o cliente escolhe entre pedir encaixe ou mudar a data.</p>';
      h += '<div class="acoes"><button class="btn btn--primario btn--sm" type="button" data-encaixe>Pedir encaixe (taxa de urgência de ' + TAXA_URGENCIA + '%, sujeito a confirmação)</button>' +
        '<button class="btn btn--linha btn--sm" type="button" data-proxima>Ver próxima data possível</button></div>' +
        '<p class="dica-botao">Pedir encaixe gera um pedido para a confeiteira confirmar. Ver próxima data mostra o primeiro dia dentro do prazo e com espaço.</p>' +
        '<div data-saida-urgente></div>';
    }

    h += '<h3>Regras verificadas</h3>' + htmlRegras(avaliacoes);
    if (c.status !== 'urgente') h += htmlFicha(fichaProducao(c, avaliacoes), c.status === 'aceito' ? 'Ficha de produção' : 'Pré-ficha de produção', 'Copiar ficha');
    h += '</article>';

    mostrar(h);
    Lab.passo(passos, c.status === 'urgente' ? 2 : 3);
    Lab.rolarPara(resultado);
    Lab.anunciar('Resultado: ' + ROTULOS[c.status] + '. ' + (c.status === 'urgente' ? 'Faltam ' + c.dias + ' dias, mínimo ' + c.minDias + '.' : c.motivos.length ? c.motivos.join(' ') : 'Ficha de produção gerada.'));
  }

  function mostrar(html) {
    var h2 = resultado.querySelector('h2.sr');
    resultado.innerHTML = '';
    if (h2) resultado.appendChild(h2);
    var box = document.createElement('div');
    box.innerHTML = html;
    resultado.appendChild(box);
  }

  function mostrarVazio() {
    mostrar('<div class="vazio" data-vazio><strong>O resultado aparece aqui.</strong><span>Você vai ver se o pedido foi aceito, se precisa da aprovação da confeiteira ou se está fora do prazo, com as regras aplicadas e a ficha de produção.</span></div>');
  }

  // ---- leitura e validação do formulário ----
  function campoDe(el) { return el.closest('.campo'); }
  function limparCampo(campo) { // limpa só o campo indicado, sem mover nós (mantém o foco)
    if (!campo) return;
    campo.classList.remove('campo--invalido');
    var c = campo.querySelector('input, select, textarea');
    if (c) { c.removeAttribute('aria-invalid'); c.removeAttribute('aria-describedby'); }
    var m = campo.querySelector('.campo__erro');
    if (m) m.textContent = '';
  }

  function lerPedido() {
    Lab.limparErros(form);
    var ok = true;
    var data = Lab.deISO(campoData.value);
    if (!data) { Lab.erro(campoDe(campoData), 'Informe a data de entrega.'); ok = false; }
    else if (Lab.diasEntre(Lab.hoje(), data) < 0) { Lab.erro(campoDe(campoData), 'A data já passou. Escolha hoje ou uma data futura.'); ok = false; }

    var qtd = Number(campoQtd.value);
    if (!campoQtd.value || !isFinite(qtd) || qtd < 1 || qtd > 50 || Math.floor(qtd) !== qtd) { Lab.erro(campoDe(campoQtd), 'Informe uma quantidade inteira de 1 a 50.'); ok = false; }

    if (!PRODUTOS[campoProduto.value]) { Lab.erro(campoDe(campoProduto), 'Escolha um produto.'); ok = false; }

    var pers = Lab.fichaEscolhida(fichas);
    if (!PERSONALIZACOES[pers]) { Lab.erro(document.getElementById('campo-personalizacao'), 'Escolha uma opção de personalização.'); ok = false; }

    var cliente = campoCliente.value.trim().slice(0, 40);
    if (!ok) { Lab.focarPrimeiroErro(form); return null; }
    return { data: data, quantidade: qtd, produto: campoProduto.value, personalizacao: pers, cliente: cliente };
  }

  function preencher(p) {
    campoData.value = Lab.paraISO(p.data);
    campoQtd.value = p.quantidade;
    campoProduto.value = p.produto;
    Lab.escolherFicha(fichas, p.personalizacao);
    campoCliente.value = p.cliente || '';
  }

  function reiniciar() {
    form.reset();
    Lab.limparErros(form);
    Lab.escolherFicha(fichas, 'nenhuma');
    atual = null;
    mostrarVazio();
    Lab.passo(passos, 1);
    campoData.focus();
    Lab.anunciar('Formulário limpo. Comece um novo pedido.');
  }

  // ---- cenários de exemplo ----
  function exemploAceito() {
    // Bolo decorado, 1 unidade, tema ou cores, daqui a 7 dias. Se cair no domingo, usa 8.
    // Se o dia (ex.: sábado com 5 pontos ocupados) não tiver espaço, avança até achar um dia que caiba.
    var hoje = Lab.hoje(), n = 7, d = Lab.addDias(hoje, n);
    if (d.getDay() === 0) { n = 8; d = Lab.addDias(hoje, n); }
    while (!diaCabe(d, 1.25) && n < 7 + JANELA_BUSCA) { n++; d = Lab.addDias(hoje, n); }
    preencher({ data: d, quantidade: 1, produto: 'bolo-decorado', personalizacao: 'tema', cliente: 'Fernanda' });
    submeter();
  }
  function exemploUrgente() {
    preencher({ data: Lab.addDias(Lab.hoje(), 1), quantidade: 1, produto: 'bolo-festa', personalizacao: 'topo', cliente: 'Carla' });
    submeter();
  }

  function submeter() {
    var p = lerPedido();
    if (!p) { Lab.passo(passos, 1); return; }
    Lab.passo(passos, 2);
    render(analisar(p));
  }

  // ---- eventos ----
  campoData.min = Lab.paraISO(Lab.hoje());

  form.addEventListener('submit', function (ev) { ev.preventDefault(); submeter(); });
  form.addEventListener('input', function (ev) {
    var campo = ev.target.closest && ev.target.closest('.campo--invalido');
    if (campo) limparCampo(campo);
  });
  Lab.ligarFichas(fichas, function () { limparCampo(document.getElementById('campo-personalizacao')); });

  var btnExemplo = document.querySelector('[data-exemplo]');
  var btnUrgente = document.querySelector('[data-exemplo-urgente]');
  var btnReiniciar = document.querySelector('[data-reiniciar]');
  if (btnExemplo) btnExemplo.addEventListener('click', exemploAceito);
  if (btnUrgente) btnUrgente.addEventListener('click', exemploUrgente);
  if (btnReiniciar) btnReiniciar.addEventListener('click', reiniciar);

  resultado.addEventListener('click', function (ev) {
    var b = ev.target.closest('button, .link-simples');
    if (!b || !atual) return;

    if (b.hasAttribute('data-copiar')) {
      var ta = b.closest('.resultado, [data-saida-urgente]').querySelector('textarea.briefing');
      if (ta) Lab.copiar(ta.value, b);
      return;
    }
    var saida = resultado.querySelector('[data-saida-urgente]');
    if (b.hasAttribute('data-encaixe') && saida) {
      saida.innerHTML = '<div class="aviso aviso--atencao">Pedido de encaixe registrado para confirmação da confeiteira. Taxa de urgência de ' + TAXA_URGENCIA + '% informada ao cliente.</div>' +
        htmlFicha(pedidoEncaixe(atual), 'Pedido de encaixe', 'Copiar pedido');
      Lab.passo(passos, 3);
      Lab.anunciar('Pedido de encaixe gerado, aguardando confirmação.');
      return;
    }
    if (b.hasAttribute('data-proxima') && saida) {
      var d = atual.proximaPossivel;
      saida.innerHTML = d
        ? '<div class="aviso"><strong>Próxima data possível:</strong> ' + e(Cap(dataLonga(d))) + ' (em ' + Lab.diasEntre(Lab.hoje(), d) + ' dias, com ' + fmt(ocupacaoDoDia(d)) + ' de ' + CAPACIDADE_DIA + ' pontos já ocupados). <button class="link-simples" type="button" data-usar-data="' + Lab.paraISO(d) + '">Usar esta data no pedido</button></div>'
        : '<div class="aviso aviso--erro">Nenhuma data com espaço nos próximos ' + JANELA_BUSCA + ' dias para este volume. A confeiteira avalia dividir a produção.</div>';
      Lab.anunciar(d ? 'Próxima data possível: ' + dataLonga(d) : 'Nenhuma data disponível nos próximos ' + JANELA_BUSCA + ' dias.');
      return;
    }
    if (b.hasAttribute('data-usar-data')) {
      campoData.value = b.getAttribute('data-usar-data');
      submeter();
    }
  });

  Lab.passo(passos, 1);
})();
