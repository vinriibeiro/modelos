// OrçaCar · Prime Car Estética (fictícia). Triagem de orçamento de estética automotiva no navegador.
(function () {
  'use strict';

  var EMPRESA = 'Prime Car Estética';

  // Tabelas de dados: bases e multiplicadores em um só lugar.
  var CATEGORIAS = {
    hatch: { rotulo: 'Hatch ou compacto', mult: 1.0 },
    sedan: { rotulo: 'Sedan', mult: 1.15 },
    suv: { rotulo: 'SUV ou picape', mult: 1.35 },
    van: { rotulo: 'Van ou utilitário grande', mult: 1.6 }
  };
  var SERVICOS = {
    lavagem: { rotulo: 'Lavagem detalhada', min: 120, max: 180 },
    higienizacao: { rotulo: 'Higienização interna', min: 250, max: 380 },
    polimento: { rotulo: 'Polimento técnico', min: 450, max: 700 },
    vitrificacao: { rotulo: 'Vitrificação', min: 900, max: 1400 },
    combo: { rotulo: 'Combo polimento + vitrificação', min: 1200, max: 1800 }
  };
  var CONDICOES = {
    boa: { rotulo: 'Boa, só manutenção', mult: 1.0 },
    leves: { rotulo: 'Riscos leves e sujeira acumulada', mult: 1.2 },
    manchas: { rotulo: 'Manchas, pelos ou mau cheiro', mult: 1.35 },
    profundos: { rotulo: 'Riscos profundos, pintura opaca ou sinistro', mult: null }
  };

  function pct(m) { return (m > 1 ? '+' : '') + Math.round((m - 1) * 100) + '%'; }
  function dezena(v) { return Math.round(v / 10) * 10; }

  // Tabela de regras, avaliada em ordem. Cada regra decide se vale (quando) e o que faz (aplicar).
  // ctx: { dados, min, max, inspecao, motivo, regras[] }
  var REGRAS = [
    {
      id: 'inspecao-profundos',
      quando: function (d) { return d.condicao === 'profundos'; },
      aplicar: function (d, ctx) {
        ctx.inspecao = true;
        ctx.motivo = 'Riscos profundos, pintura opaca ou sinistro mudam muito o trabalho: pode ser só polimento ou exigir correção de pintura. Sem ver o carro, qualquer número seria chute.';
        ctx.regras.push({ tipo: 'atencao', nome: 'Pintura comprometida', efeito: 'o serviço depende do que a inspeção encontrar', delta: 'Avaliação presencial' });
      }
    },
    {
      id: 'inspecao-higienizacao',
      quando: function (d) { return d.condicao === 'manchas' && d.servico === 'higienizacao'; },
      aplicar: function (d, ctx) {
        ctx.inspecao = true;
        ctx.motivo = 'Manchas, pelos ou mau cheiro na higienização interna variam de uma limpeza reforçada a tratamento de odor e extração profunda. O preço só fica justo depois de olhar bancos e carpete.';
        ctx.regras.push({ tipo: 'atencao', nome: 'Higienização com manchas, pelos ou odor', efeito: 'o tipo de tratamento depende do estado interno', delta: 'Avaliação presencial' });
      }
    },
    {
      id: 'base',
      quando: function (d, ctx) { return !ctx.inspecao; },
      aplicar: function (d, ctx) {
        var s = SERVICOS[d.servico];
        ctx.min = s.min; ctx.max = s.max;
        ctx.regras.push({ tipo: 'ok', nome: s.rotulo, efeito: 'faixa base para hatch em boas condições', delta: Lab.faixa(s.min, s.max) });
      }
    },
    {
      id: 'categoria',
      quando: function (d, ctx) { return !ctx.inspecao && CATEGORIAS[d.categoria].mult !== 1; },
      aplicar: function (d, ctx) {
        var c = CATEGORIAS[d.categoria];
        ctx.min *= c.mult; ctx.max *= c.mult;
        ctx.regras.push({ tipo: '', nome: c.rotulo, efeito: c.mult >= 1.5 ? 'muito mais área e tempo de trabalho' : 'pela área maior', delta: pct(c.mult) });
      }
    },
    {
      id: 'condicao',
      quando: function (d, ctx) { return !ctx.inspecao && CONDICOES[d.condicao].mult !== 1; },
      aplicar: function (d, ctx) {
        var c = CONDICOES[d.condicao];
        ctx.min *= c.mult; ctx.max *= c.mult;
        ctx.regras.push({ tipo: '', nome: c.rotulo, efeito: d.condicao === 'manchas' ? 'exige produto e tempo extra' : 'mais etapas de preparo', delta: pct(c.mult) });
      }
    },
    {
      id: 'arredondar',
      quando: function (d, ctx) { return !ctx.inspecao; },
      aplicar: function (d, ctx) {
        ctx.min = dezena(ctx.min); ctx.max = dezena(ctx.max);
        ctx.regras.push({ tipo: '', nome: 'Arredondamento', efeito: 'valores em múltiplos de R$ 10, fáceis de falar', delta: Lab.faixa(ctx.min, ctx.max) });
      }
    }
  ];

  function calcular(dados) {
    var ctx = { dados: dados, min: 0, max: 0, inspecao: false, motivo: '', regras: [] };
    for (var i = 0; i < REGRAS.length; i++) {
      if (REGRAS[i].quando(dados, ctx)) REGRAS[i].aplicar(dados, ctx);
    }
    return ctx;
  }

  // Elementos
  var form = document.getElementById('formulario');
  var resultado = document.getElementById('resultado');
  var passos = document.querySelector('.passos');
  var selCategoria = document.getElementById('categoria');
  var selCondicao = document.getElementById('condicao');
  var inpNome = document.getElementById('nome');
  var fichasServico = form.querySelector('.fichas[data-grupo="servico"]');
  var vazioHTML = resultado.querySelector('[data-vazio]').outerHTML;
  var TITULO_SR = '<h2 class="sr" id="titulo-resultado">Resultado</h2>';
  var ctxAtual = null;

  function campo(nome) { return form.querySelector('.campo[data-campo="' + nome + '"]'); }

  function lerDados() {
    return {
      categoria: selCategoria.value,
      servico: Lab.fichaEscolhida(fichasServico),
      condicao: selCondicao.value,
      nome: inpNome.value.trim().slice(0, 40)
    };
  }

  function validar(d) {
    Lab.limparErros(form);
    var ok = true;
    if (!CATEGORIAS[d.categoria]) { Lab.erro(campo('categoria'), 'Escolha a categoria do veículo para a demo ajustar a faixa.'); ok = false; }
    if (!SERVICOS[d.servico]) { Lab.erro(campo('servico'), 'Toque em um serviço para saber a base de preço.'); ok = false; }
    if (!CONDICOES[d.condicao]) { Lab.erro(campo('condicao'), 'Informe a condição do veículo: é ela que decide se dá para orçar à distância.'); ok = false; }
    if (!ok) Lab.focarPrimeiroErro(form);
    return ok;
  }

  function agora() { var d = new Date(); return Lab.dataBR(d) + ' às ' + Lab.horaAgora(d); }

  function montarBriefing(ctx, modo) {
    var d = ctx.dados;
    var linhas = [];
    linhas.push((modo === 'avaliacao' ? 'AVALIAÇÃO PRESENCIAL' : 'ORÇAMENTO') + ' · ' + EMPRESA);
    linhas.push('Cliente/placa: ' + (d.nome || 'não informado'));
    linhas.push('Veículo: ' + CATEGORIAS[d.categoria].rotulo);
    linhas.push('Serviço: ' + SERVICOS[d.servico].rotulo);
    linhas.push('Condição: ' + CONDICOES[d.condicao].rotulo);
    if (ctx.inspecao) {
      linhas.push('Faixa de preço: aguardando inspeção presencial');
      linhas.push('Motivo: ' + ctx.motivo);
      if (modo === 'avaliacao') {
        linhas.push('Próximo passo: agendar avaliação de 15 min, sem compromisso.');
        linhas.push('Sugestão de horário: ' + Lab.dataBR(Lab.addDias(Lab.hoje(), 1)) + ', 9h ou 14h (confirmar com o cliente).');
      }
    } else {
      linhas.push('Faixa demonstrativa: ' + Lab.faixa(ctx.min, ctx.max));
      linhas.push('Valor final depende da avaliação do veículo.');
    }
    linhas.push('Regras aplicadas:');
    for (var i = 0; i < ctx.regras.length; i++) {
      var r = ctx.regras[i];
      linhas.push('- ' + r.nome + ': ' + r.efeito + ' (' + r.delta + ')');
    }
    linhas.push('Gerado em ' + agora() + ' · demonstração, dados fictícios');
    return linhas.join('\n');
  }

  function htmlRegras(regras) {
    var h = '<div class="regras" aria-label="Regras aplicadas">';
    for (var i = 0; i < regras.length; i++) {
      var r = regras[i];
      h += '<div class="regra' + (r.tipo ? ' regra--' + r.tipo : '') + '">' +
        '<span class="regra__nome">' + Lab.escapar(r.nome) + '</span>' +
        '<span class="regra__efeito">' + Lab.escapar(r.efeito) + '</span>' +
        '<span class="regra__delta">' + Lab.escapar(r.delta) + '</span></div>';
    }
    return h + '</div>';
  }

  function htmlBriefing(texto) {
    return '<h3>Briefing pronto</h3>' +
      '<label class="sr" for="briefing">Briefing para orçamento</label>' +
      '<textarea class="briefing" id="briefing" readonly rows="12">' + Lab.escapar(texto) + '</textarea>' +
      '<div class="acoes"><button class="btn btn--linha btn--sm" type="button" data-copiar>Copiar briefing</button>' +
      '<p class="dica-botao">Copia o texto para colar no WhatsApp ou no sistema da estética.</p></div>';
  }

  function mostrar(ctx) {
    ctxAtual = ctx;
    var d = ctx.dados;
    var titulo = (d.nome ? Lab.escapar(d.nome) + ' · ' : '') + Lab.escapar(CATEGORIAS[d.categoria].rotulo) + ' · ' + Lab.escapar(SERVICOS[d.servico].rotulo);
    var h = TITULO_SR;
    var resumo;

    if (ctx.inspecao) {
      h += '<div class="resultado resultado--atencao">' +
        '<div><p class="resultado__rotulo">' + titulo + '</p>' +
        '<p class="resultado__valor">Precisa de avaliação presencial</p>' +
        '<p class="resultado__sub">' + Lab.escapar(ctx.motivo) + '</p></div>' +
        '<p class="aviso aviso--atencao"><strong>Próximo passo:</strong> agendar uma avaliação de 15 minutos, sem compromisso. O cliente recebe o horário e o dono já sabe o que vai olhar.</p>' +
        htmlRegras(ctx.regras) +
        '<div class="acoes"><button class="btn btn--primario" type="button" data-encaminhar>Encaminhar para avaliação</button>' +
        '<p class="dica-botao">Transforma o briefing em pedido de avaliação, com sugestão de horário.</p></div>' +
        htmlBriefing(montarBriefing(ctx, 'orcamento')) +
        '</div>';
      resumo = 'Resultado: precisa de avaliação presencial. ' + ctx.motivo;
    } else {
      h += '<div class="resultado resultado--ok">' +
        '<div><p class="resultado__rotulo">Faixa demonstrativa</p>' +
        '<p class="resultado__valor">' + Lab.faixa(ctx.min, ctx.max) + '</p>' +
        '<p class="resultado__sub">Valor final depende da avaliação do veículo. ' + titulo + '</p></div>' +
        '<h3>Regras aplicadas</h3>' +
        htmlRegras(ctx.regras) +
        htmlBriefing(montarBriefing(ctx, 'orcamento')) +
        '</div>';
      resumo = 'Faixa demonstrativa de ' + Lab.faixa(ctx.min, ctx.max) + ' para ' + SERVICOS[d.servico].rotulo + ' em ' + CATEGORIAS[d.categoria].rotulo + '. Briefing pronto para copiar.';
    }

    resultado.innerHTML = h;
    Lab.passo(passos, 3);
    Lab.rolarPara(resultado);
    Lab.anunciar(resumo);
  }

  function enviar(ev) {
    if (ev) ev.preventDefault();
    var d = lerDados();
    if (!validar(d)) return;
    Lab.passo(passos, 2);
    mostrar(calcular(d));
  }

  function reiniciar() {
    form.reset();
    Lab.escolherFicha(fichasServico, null);
    Lab.limparErros(form);
    resultado.innerHTML = TITULO_SR + vazioHTML;
    ctxAtual = null;
    Lab.passo(passos, 1);
    selCategoria.focus();
    Lab.anunciar('Formulário reiniciado.');
  }

  function preencher(categoria, servico, condicao, nome) {
    selCategoria.value = categoria;
    Lab.escolherFicha(fichasServico, servico);
    selCondicao.value = condicao;
    inpNome.value = nome || '';
    enviar();
  }

  // Eventos
  form.addEventListener('submit', enviar);
  form.querySelector('[data-reiniciar]').addEventListener('click', reiniciar);
  Lab.ligarFichas(fichasServico, function () {
    // Escolher um serviço limpa o erro desse campo.
    var c = campo('servico');
    if (c.classList.contains('campo--invalido')) {
      c.classList.remove('campo--invalido');
      c.querySelector('.campo__erro').textContent = '';
    }
  });
  document.querySelector('[data-exemplo]').addEventListener('click', function () {
    preencher('suv', 'polimento', 'leves', 'Carla · ABC1D23');
  });
  document.querySelector('[data-exemplo-inspecao]').addEventListener('click', function () {
    preencher('sedan', 'higienizacao', 'manchas', 'Marcos · XYZ9A87');
  });

  resultado.addEventListener('click', function (ev) {
    var copiar = ev.target.closest('[data-copiar]');
    if (copiar) {
      var ta = resultado.querySelector('.briefing');
      if (ta) Lab.copiar(ta.value, copiar);
      return;
    }
    var enc = ev.target.closest('[data-encaminhar]');
    if (enc && ctxAtual) {
      var area = resultado.querySelector('.briefing');
      if (area) {
        area.value = montarBriefing(ctxAtual, 'avaliacao');
        area.focus();
      }
      enc.disabled = true;
      enc.textContent = 'Encaminhado para avaliação';
      Lab.toast('Briefing de avaliação gerado');
      Lab.anunciar('Briefing de avaliação gerado, com sugestão de horário. Copie e envie ao cliente.');
    }
  });
})();
