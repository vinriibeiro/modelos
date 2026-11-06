// Concilia Express · compara dois CSVs fictícios no navegador. Nada é enviado.
(function () {
  'use strict';
  var L = window.Lab;
  var form = document.getElementById('formulario');
  var resultado = document.getElementById('resultado');
  var passos = document.querySelector('.passos');
  var csvA = document.getElementById('csv-a');
  var csvB = document.getElementById('csv-b');
  var tol = document.getElementById('tolerancia');
  var vazioHTML = resultado.innerHTML;

  var EXEMPLO_A = [
    'pedido;data;cliente;valor',
    '1001;03/11/2026;Ana;150,00',
    '1002;03/11/2026;Bruno;89,90',
    '1003;04/11/2026;Carla;320,00',
    '1004;04/11/2026;Diego;45,50',
    '1005;05/11/2026;Elisa;210,00',
    '1006;05/11/2026;Fábio;99,00',
    '1007;05/11/2026;Gabi;75,00'
  ].join('\n');
  var EXEMPLO_B = [
    'nsu;data;bandeira;valor',
    '1001;03/11/2026;Visa;150,00',
    '1002;03/11/2026;Master;89,90',
    '1003;04/11/2026;Elo;302,00',
    '1005;05/11/2026;Visa;210,00',
    '1006;05/11/2026;Master;99,00',
    '1008;05/11/2026;Pix;60,00'
  ].join('\n');

  // Regras em linguagem simples, mostradas no relatório.
  var REGRAS = [
    { nome: 'Cruzamento pelo identificador', efeito: 'Cada linha é procurada no outro arquivo pelo número da venda (pedido, NSU, id ou código).' },
    { nome: 'Tolerância', efeito: 'Diferença de valor até a tolerância conta como correspondência.' },
    { nome: 'Divergência', efeito: 'Mesmo identificador com valores diferentes além da tolerância.' },
    { nome: 'Sem par', efeito: 'Identificador que só aparece em um dos arquivos.' }
  ];

  function campo(nome) { return form.querySelector('[data-campo="' + nome + '"]'); }

  function detectarSeparador(linha) {
    var pv = (linha.match(/;/g) || []).length, v = (linha.match(/,/g) || []).length, tab = (linha.match(/\t/g) || []).length;
    if (tab > pv && tab > v) return '\t';
    return pv >= v ? ';' : ',';
  }
  function normalizar(s) { return String(s || '').trim().replace(/^"|"$/g, '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }
  function valorNumero(s) {
    var t = String(s || '').trim().replace(/^"|"$/g, '').replace(/R\$\s?/i, '');
    if (/,\d{1,2}$/.test(t)) t = t.replace(/\./g, '').replace(',', '.'); else t = t.replace(/,/g, '');
    var n = parseFloat(t);
    return isNaN(n) ? null : n;
  }
  function lerCSV(texto) {
    var linhas = String(texto || '').split(/\r?\n/).filter(function (l) { return l.trim() !== ''; });
    if (linhas.length < 2) return { erro: 'Precisa de uma linha de cabeçalho e pelo menos uma linha de dados.' };
    var sep = detectarSeparador(linhas[0]);
    var cab = linhas[0].split(sep).map(normalizar);
    var idx = -1, val = -1;
    var idNomes = ['pedido', 'nsu', 'id', 'codigo', 'cod', 'referencia', 'autorizacao', 'venda', 'numero'];
    var valNomes = ['valor', 'total', 'bruto', 'amount', 'liquido'];
    cab.forEach(function (c, i) {
      if (idx < 0 && idNomes.some(function (n) { return c === n || c.indexOf(n) === 0; })) idx = i;
      if (val < 0 && valNomes.some(function (n) { return c.indexOf(n) >= 0; })) val = i;
    });
    if (idx < 0) idx = 0;
    if (val < 0) val = cab.length - 1;
    if (idx === val) return { erro: 'Não encontrei colunas distintas de identificador e valor no cabeçalho.' };
    var itens = [], invalidas = 0;
    for (var i = 1; i < linhas.length; i++) {
      var cel = linhas[i].split(sep);
      var id = String(cel[idx] || '').trim().replace(/^"|"$/g, '');
      var v = valorNumero(cel[val]);
      if (!id || v === null) { invalidas++; continue; }
      itens.push({ id: id, valor: v, linha: i + 1 });
    }
    if (!itens.length) return { erro: 'Nenhuma linha válida: confira se a coluna de valor usa números (ex.: 150,00).' };
    return { itens: itens, invalidas: invalidas, colunaId: cab[idx], colunaValor: cab[val], separador: sep };
  }

  function conciliar(a, b, tolerancia) {
    var mapaB = {};
    b.itens.forEach(function (it) { (mapaB[it.id] = mapaB[it.id] || []).push(it); });
    var corresp = [], diverg = [], soA = [], soB = [];
    a.itens.forEach(function (it) {
      var lista = mapaB[it.id];
      if (!lista || !lista.length) { soA.push(it); return; }
      var par = lista.shift();
      var dif = Math.round((it.valor - par.valor) * 100) / 100;
      if (Math.abs(dif) <= tolerancia + 1e-9) corresp.push({ id: it.id, a: it.valor, b: par.valor });
      else diverg.push({ id: it.id, a: it.valor, b: par.valor, dif: dif });
    });
    Object.keys(mapaB).forEach(function (id) { mapaB[id].forEach(function (it) { soB.push(it); }); });
    var soma = function (arr, k) { return arr.reduce(function (s, x) { return s + (k ? x[k] : x.valor); }, 0); };
    return {
      corresp: corresp, diverg: diverg, soA: soA, soB: soB,
      totalA: soma(a.itens), totalB: soma(b.itens),
      totalCorresp: soma(corresp, 'a'), totalDiverg: diverg.reduce(function (s, x) { return s + x.dif; }, 0),
      totalSoA: soma(soA), totalSoB: soma(soB)
    };
  }

  function linhaTabela(cels) { return '<tr>' + cels.map(function (c) { return '<td' + (c.num ? ' class="num"' : '') + '>' + L.escapar(c.t) + '</td>'; }).join('') + '</tr>'; }
  function tabela(titulo, cab, linhas, vazio) {
    var h = '<h3>' + L.escapar(titulo) + ' <span class="etiqueta">' + linhas.length + '</span></h3>';
    if (!linhas.length) return h + '<p class="texto texto--pequeno">' + L.escapar(vazio) + '</p>';
    return h + '<div class="tabela-rolagem"><table class="tabela"><thead><tr>' + cab.map(function (c) { return '<th' + (c.num ? ' class="num"' : '') + '>' + L.escapar(c.t) + '</th>'; }).join('') + '</tr></thead><tbody>' + linhas.join('') + '</tbody></table></div>';
  }

  function relatorioTexto(r, a, b, tolerancia) {
    var m = L.moedaCentavos, agora = new Date();
    var t = ['CONCILIAÇÃO DE VENDAS · ' + L.dataBR(agora) + ' ' + L.horaAgora(agora),
      'Vendas do sistema: ' + a.itens.length + ' linhas · ' + m(r.totalA),
      'Extrato da maquininha: ' + b.itens.length + ' linhas · ' + m(r.totalB),
      'Diferença entre os totais: ' + m(r.totalA - r.totalB),
      'Tolerância: ' + m(tolerancia), '',
      'CORRESPONDÊNCIAS (' + r.corresp.length + '): ' + m(r.totalCorresp)];
    r.corresp.forEach(function (x) { t.push('  ' + x.id + ' · ' + m(x.a)); });
    t.push('', 'DIVERGÊNCIAS (' + r.diverg.length + '):');
    r.diverg.forEach(function (x) { t.push('  ' + x.id + ' · sistema ' + m(x.a) + ' · maquininha ' + m(x.b) + ' · diferença ' + m(x.dif)); });
    t.push('', 'SÓ NO SISTEMA (' + r.soA.length + '): ' + m(r.totalSoA));
    r.soA.forEach(function (x) { t.push('  ' + x.id + ' · ' + m(x.valor)); });
    t.push('', 'SÓ NA MAQUININHA (' + r.soB.length + '): ' + m(r.totalSoB));
    r.soB.forEach(function (x) { t.push('  ' + x.id + ' · ' + m(x.valor)); });
    t.push('', 'Demonstração com dados fictícios · Laboratório Site Express');
    return t.join('\n');
  }

  function mostrar(r, a, b, tolerancia) {
    var m = L.moedaCentavos;
    var pendencias = r.diverg.length + r.soA.length + r.soB.length;
    var variante = pendencias === 0 ? 'resultado--ok' : (r.diverg.length ? 'resultado--atencao' : 'resultado--info');
    var etiqueta = pendencias === 0 ? '<span class="etiqueta etiqueta--ok">Tudo bateu</span>' : '<span class="etiqueta etiqueta--atencao">' + pendencias + ' ' + (pendencias === 1 ? 'item para conferir' : 'itens para conferir') + '</span>';
    var html = '<h2 class="sr" id="titulo-resultado">Resultado</h2>' +
      '<div class="resultado ' + variante + '">' +
      '<div class="resultado__cabeca"><div><p class="resultado__rotulo">Diferença entre os totais</p><p class="resultado__valor">' + L.escapar(m(r.totalA - r.totalB)) + '</p></div>' + etiqueta + '</div>' +
      '<p class="resultado__sub">Sistema ' + L.escapar(m(r.totalA)) + ' (' + a.itens.length + ' vendas) · Maquininha ' + L.escapar(m(r.totalB)) + ' (' + b.itens.length + ' lançamentos)' +
      ((a.invalidas || b.invalidas) ? ' · ' + (a.invalidas + b.invalidas) + ' linha(s) ignorada(s) por valor ilegível' : '') + '</p>' +
      '<div class="regras">' +
      '<div class="regra regra--ok"><span class="regra__nome">Correspondências</span><span class="regra__efeito">mesmo identificador e mesmo valor (até ' + L.escapar(m(tolerancia)) + ' de diferença)</span><span class="regra__delta">' + r.corresp.length + ' · ' + L.escapar(m(r.totalCorresp)) + '</span></div>' +
      '<div class="regra' + (r.diverg.length ? ' regra--atencao' : '') + '"><span class="regra__nome">Divergências</span><span class="regra__efeito">mesmo identificador, valores diferentes</span><span class="regra__delta">' + r.diverg.length + ' · ' + L.escapar(m(r.totalDiverg)) + '</span></div>' +
      '<div class="regra' + (r.soA.length ? ' regra--erro' : '') + '"><span class="regra__nome">Só no sistema</span><span class="regra__efeito">venda registrada sem lançamento na maquininha</span><span class="regra__delta">' + r.soA.length + ' · ' + L.escapar(m(r.totalSoA)) + '</span></div>' +
      '<div class="regra' + (r.soB.length ? ' regra--erro' : '') + '"><span class="regra__nome">Só na maquininha</span><span class="regra__efeito">recebimento sem venda registrada</span><span class="regra__delta">' + r.soB.length + ' · ' + L.escapar(m(r.totalSoB)) + '</span></div>' +
      '</div>' +
      tabela('Divergências', [{ t: 'Identificador' }, { t: 'Sistema', num: 1 }, { t: 'Maquininha', num: 1 }, { t: 'Diferença', num: 1 }],
        r.diverg.map(function (x) { return linhaTabela([{ t: x.id }, { t: m(x.a), num: 1 }, { t: m(x.b), num: 1 }, { t: m(x.dif), num: 1 }]); }), 'Nenhuma divergência de valor.') +
      tabela('Só no sistema', [{ t: 'Identificador' }, { t: 'Valor', num: 1 }], r.soA.map(function (x) { return linhaTabela([{ t: x.id }, { t: m(x.valor), num: 1 }]); }), 'Todas as vendas têm lançamento na maquininha.') +
      tabela('Só na maquininha', [{ t: 'Identificador' }, { t: 'Valor', num: 1 }], r.soB.map(function (x) { return linhaTabela([{ t: x.id }, { t: m(x.valor), num: 1 }]); }), 'Todos os lançamentos têm venda registrada.') +
      tabela('Correspondências', [{ t: 'Identificador' }, { t: 'Valor', num: 1 }], r.corresp.map(function (x) { return linhaTabela([{ t: x.id }, { t: m(x.a), num: 1 }]); }), 'Nenhuma correspondência encontrada: confira se os identificadores são os mesmos nos dois arquivos.') +
      '<h3>Regras aplicadas</h3><div class="regras">' + REGRAS.map(function (g) { return '<div class="regra"><span class="regra__nome">' + L.escapar(g.nome) + '</span><span class="regra__efeito">' + L.escapar(g.efeito) + '</span></div>'; }).join('') + '</div>' +
      '<h3>Relatório para enviar ao financeiro</h3>' +
      '<textarea class="briefing" readonly rows="10" aria-label="Relatório da conciliação" data-relatorio></textarea>' +
      '<div class="acoes"><button class="btn btn--linha btn--sm" type="button" data-copiar>Copiar relatório</button><span class="dica-botao">Copia o texto acima para colar no WhatsApp ou no e-mail.</span></div>' +
      '</div>';
    resultado.innerHTML = html;
    var ta = resultado.querySelector('[data-relatorio]');
    ta.value = relatorioTexto(r, a, b, tolerancia);
    resultado.querySelector('[data-copiar]').addEventListener('click', function () { L.copiar(ta.value, this); });
    L.passo(passos, 3);
    L.rolarPara(resultado);
    L.anunciar('Conciliação pronta: ' + r.corresp.length + ' correspondências, ' + r.diverg.length + ' divergências, ' + (r.soA.length + r.soB.length) + ' itens sem par.');
  }

  function validar() {
    L.limparErros(form);
    var ok = true, a = lerCSV(csvA.value), b = lerCSV(csvB.value);
    if (!csvA.value.trim()) { L.erro(campo('a'), 'Cole ou escolha o CSV das vendas do sistema.'); ok = false; }
    else if (a.erro) { L.erro(campo('a'), a.erro); ok = false; }
    if (!csvB.value.trim()) { L.erro(campo('b'), 'Cole ou escolha o CSV do extrato da maquininha.'); ok = false; }
    else if (b.erro) { L.erro(campo('b'), b.erro); ok = false; }
    var t = parseFloat(String(tol.value).replace(',', '.'));
    if (isNaN(t) || t < 0 || t > 100) { L.erro(campo('tolerancia'), 'Informe uma tolerância entre 0 e 100.'); ok = false; }
    if (!ok) { L.focarPrimeiroErro(form); L.anunciar('Confira os campos marcados.'); return null; }
    return { a: a, b: b, t: t };
  }

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    L.passo(passos, 2);
    var d = validar();
    if (!d) { L.passo(passos, 1); return; }
    mostrar(conciliar(d.a, d.b, d.t), d.a, d.b, d.t);
  });

  function reiniciar(foco) {
    form.reset(); L.limparErros(form);
    csvA.value = ''; csvB.value = ''; tol.value = '0.01';
    resultado.innerHTML = vazioHTML;
    L.passo(passos, 1);
    if (foco) csvA.focus();
    L.anunciar('Demonstração reiniciada.');
  }
  form.querySelector('[data-reiniciar]').addEventListener('click', function () { reiniciar(true); });

  document.querySelector('[data-exemplo]').addEventListener('click', function () {
    L.limparErros(form);
    csvA.value = EXEMPLO_A; csvB.value = EXEMPLO_B; tol.value = '0.01';
    L.toast('Exemplo carregado: 7 vendas e 6 lançamentos fictícios.');
    form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit', { cancelable: true }));
  });

  // Arquivo do celular: lido localmente com FileReader.
  Array.prototype.forEach.call(form.querySelectorAll('input[type="file"][data-arquivo]'), function (inp) {
    inp.addEventListener('change', function () {
      var f = inp.files && inp.files[0]; if (!f) return;
      var alvo = document.getElementById(inp.getAttribute('data-arquivo'));
      var r = new FileReader();
      r.onload = function () { alvo.value = String(r.result || ''); L.toast('Arquivo carregado: ' + f.name); alvo.focus(); };
      r.onerror = function () { L.toast('Não foi possível ler o arquivo.'); };
      r.readAsText(f, 'UTF-8');
    });
  });
})();
