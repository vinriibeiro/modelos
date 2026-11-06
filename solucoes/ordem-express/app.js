// Ordem Express · TecnoLar Assistência Técnica (empresa fictícia).
// Classifica o chamado, sugere a equipe pela região e organiza a fila de ordens. Tudo em memória, no navegador.
(function () {
  'use strict';

  var Lab = window.Lab;
  if (!Lab) return;

  // ---------- Tabelas de regras (linguagem simples, fáceis de ajustar) ----------
  var PROBLEMAS = {
    geladeira:  { rotulo: 'Geladeira não gela',               peso: 3, risco: false, gas: false },
    lavadora:   { rotulo: 'Máquina de lavar com vazamento',   peso: 3, risco: true,  gas: false },
    ar:         { rotulo: 'Ar-condicionado sem refrigerar',   peso: 2, risco: false, gas: false },
    microondas: { rotulo: 'Micro-ondas não liga',             peso: 1, risco: false, gas: false },
    gas:        { rotulo: 'Fogão/forno com cheiro de gás',    peso: 5, risco: true,  gas: true },
    outro:      { rotulo: 'Outro',                            peso: 1, risco: false, gas: false }
  };
  var REGIOES = {
    centro: { rotulo: 'Centro',     equipe: 'A', deslocamento: 20 },
    norte:  { rotulo: 'Zona Norte', equipe: 'B', deslocamento: 35 },
    sul:    { rotulo: 'Zona Sul',   equipe: 'A', deslocamento: 30 },
    leste:  { rotulo: 'Zona Leste', equipe: 'C', deslocamento: 45 },
    oeste:  { rotulo: 'Zona Oeste', equipe: 'B', deslocamento: 40 }
  };
  var URGENCIAS = { '0': 'Pode esperar', '1': 'Esta semana', '2': 'Hoje', '3': 'Emergência' };
  var EQUIPES = {
    A: { nome: 'Equipe A', tecnicos: ['Marcos', 'Paula'] },
    B: { nome: 'Equipe B', tecnicos: ['Diego'] },
    C: { nome: 'Equipe C', tecnicos: ['Renata'] }
  };
  var PONTOS_RISCO = 2;          // gás ou vazamento somam 2 pontos
  var MIN_POR_ORDEM_FILA = 10;   // cada ordem "Em atendimento" da mesma equipe atrasa 10 min
  // Faixas de prioridade: pontuação = peso do problema + urgência + risco.
  var FAIXAS = [
    { nivel: 'ALTA',   min: 7, prazo: 'atender hoje',          variante: 'erro',    ordem: 0 },
    { nivel: 'MÉDIA',  min: 4, prazo: 'atender em até 48 h',   variante: 'atencao', ordem: 1 },
    { nivel: 'NORMAL', min: 0, prazo: 'próxima vaga livre',    variante: 'info',    ordem: 2 }
  ];
  var STATUS = {
    'Recebida':       { variante: 'info' },
    'Em atendimento': { variante: 'atencao' },
    'Concluída':      { variante: 'ok' }
  };
  var AVISO_GAS = 'Oriente o cliente a fechar o registro e ventilar o ambiente.';

  // ---------- Elementos ----------
  var form = document.getElementById('formulario');
  var passos = document.querySelector('.passos');
  var resultado = document.getElementById('resultado');
  var vazio = resultado.querySelector('[data-vazio]');
  var saida = document.getElementById('saida');
  var filaEl = document.getElementById('fila');
  var selProblema = document.getElementById('problema');
  var fichasRegiao = document.getElementById('regiao');
  var fichasUrgencia = document.getElementById('urgencia');
  var inpNome = document.getElementById('nome');
  var inpTelefone = document.getElementById('telefone');

  // ---------- Estado ----------
  var ordens = [];
  var proximoNumero;
  var contadorId = 0;
  var atualId = null;

  function minutosAtras(min) { return Lab.horaAgora(new Date(Date.now() - min * 60000)); }

  function faixaDe(pontos, gas) {
    if (gas) return FAIXAS[0];
    for (var i = 0; i < FAIXAS.length; i++) if (pontos >= FAIXAS[i].min) return FAIXAS[i];
    return FAIXAS[FAIXAS.length - 1];
  }
  function nomesEquipe(sigla) {
    var t = EQUIPES[sigla].tecnicos;
    return t.length > 1 ? t.slice(0, -1).join(', ') + ' e ' + t[t.length - 1] : t[0];
  }
  function emAtendimentoDaEquipe(sigla, ignorarId) {
    var n = 0;
    for (var i = 0; i < ordens.length; i++) {
      if (ordens[i].id !== ignorarId && ordens[i].equipe === sigla && ordens[i].status === 'Em atendimento') n++;
    }
    return n;
  }

  // Calcula prioridade, equipe e previsão para um chamado.
  function classificar(dados) {
    var p = PROBLEMAS[dados.problema], r = REGIOES[dados.regiao], urg = Number(dados.urgencia);
    var risco = p.risco ? PONTOS_RISCO : 0;
    var pontos = p.peso + urg + risco;
    var faixa = faixaDe(pontos, p.gas);
    var naFila = emAtendimentoDaEquipe(r.equipe, null);
    return {
      pontos: pontos, risco: risco, faixa: faixa, equipe: r.equipe,
      deslocamento: r.deslocamento, espera: naFila * MIN_POR_ORDEM_FILA, naFila: naFila,
      previsao: r.deslocamento + naFila * MIN_POR_ORDEM_FILA
    };
  }

  function criarOrdem(dados, hora) {
    var c = classificar(dados);
    var o = {
      id: ++contadorId, numero: proximoNumero(), cliente: dados.nome, telefone: dados.telefone || '',
      problema: dados.problema, regiao: dados.regiao, urgencia: String(dados.urgencia),
      pontos: c.pontos, risco: c.risco, faixa: c.faixa, equipe: c.equipe,
      deslocamento: c.deslocamento, espera: c.espera, naFila: c.naFila, previsao: c.previsao,
      status: 'Recebida', historicoAberto: false, historico: []
    };
    o.historico.push({ hora: hora || Lab.horaAgora(), texto: 'Recebida pelo site · prioridade ' + o.faixa.nivel + ' · equipe ' + o.equipe + ' sugerida' });
    ordens.push(o);
    return o;
  }

  // Duas ordens fictícias para a fila não começar vazia.
  function semear() {
    ordens = [];
    contadorId = 0;
    atualId = null;
    proximoNumero = Lab.sequencia('OS-', 1041);
    var a = criarOrdem({ problema: 'lavadora', regiao: 'centro', urgencia: 2, nome: 'Dona Helena', telefone: '' }, minutosAtras(48));
    a.status = 'Em atendimento';
    a.historico.push({ hora: minutosAtras(41), texto: 'Em atendimento · Marcos a caminho' });
    criarOrdem({ problema: 'microondas', regiao: 'leste', urgencia: 0, nome: 'Sr. Jorge', telefone: '' }, minutosAtras(22));
  }

  // ---------- Fila ----------
  function ordenar(lista) {
    return lista.slice().sort(function (x, y) {
      var cx = x.status === 'Concluída' ? 1 : 0, cy = y.status === 'Concluída' ? 1 : 0;
      if (cx !== cy) return cx - cy;
      if (!cx && x.faixa.ordem !== y.faixa.ordem) return x.faixa.ordem - y.faixa.ordem;
      return x.id - y.id;
    });
  }
  function etiqueta(texto, variante) {
    return '<span class="etiqueta etiqueta--' + variante + '">' + Lab.escapar(texto) + '</span>';
  }
  function htmlOrdem(o) {
    var classes = 'os';
    if (o.faixa.nivel === 'ALTA' && o.status !== 'Concluída') classes += ' os--urgente';
    if (o.id === atualId) classes += ' os--atual';
    var h = '<article class="' + classes + '" data-id="' + o.id + '" aria-labelledby="os-num-' + o.id + '">';
    h += '<div class="os__cabeca"><div><div class="os__num" id="os-num-' + o.id + '">' + Lab.escapar(o.numero) + ' · ' + Lab.escapar(o.cliente) + '</div>';
    h += '<div class="os__meta">' + Lab.escapar(PROBLEMAS[o.problema].rotulo) + ' · ' + Lab.escapar(REGIOES[o.regiao].rotulo) + ' · ' + Lab.escapar(EQUIPES[o.equipe].nome) + ' (' + Lab.escapar(nomesEquipe(o.equipe)) + ')</div></div>';
    h += '<div class="acoes">' + etiqueta('Prioridade ' + o.faixa.nivel, o.faixa.variante) + etiqueta(o.status, STATUS[o.status].variante) + '</div></div>';
    h += '<div class="acoes">';
    if (o.status === 'Recebida') {
      h += '<button class="btn btn--primario btn--sm" type="button" data-acao="iniciar" data-id="' + o.id + '" title="Muda o status para Em atendimento e registra a saída da equipe">Iniciar atendimento</button>';
    } else if (o.status === 'Em atendimento') {
      h += '<button class="btn btn--primario btn--sm" type="button" data-acao="concluir" data-id="' + o.id + '" title="Muda o status para Concluída e manda a ordem para o fim da fila">Concluir</button>';
    }
    h += '<button class="btn btn--linha btn--sm" type="button" data-acao="historico" data-id="' + o.id + '" aria-expanded="' + (o.historicoAberto ? 'true' : 'false') + '" aria-controls="hist-' + o.id + '" title="Mostra ou esconde a linha do tempo da ordem">' + (o.historicoAberto ? 'Ocultar histórico' : 'Ver histórico') + '</button>';
    h += '</div>';
    h += '<ol class="linha-tempo" id="hist-' + o.id + '"' + (o.historicoAberto ? '' : ' hidden') + '>';
    for (var i = 0; i < o.historico.length; i++) {
      h += '<li class="evento"><span class="evento__hora">' + Lab.escapar(o.historico[i].hora) + '</span>' + Lab.escapar(o.historico[i].texto) + '</li>';
    }
    h += '</ol></article>';
    return h;
  }
  function renderFila(focoSeletor) {
    var lista = ordenar(ordens), h = '';
    for (var i = 0; i < lista.length; i++) h += htmlOrdem(lista[i]);
    filaEl.innerHTML = h || '<p class="texto texto--pequeno">Nenhuma ordem na fila.</p>';
    if (focoSeletor) { var f = filaEl.querySelector(focoSeletor); if (f) f.focus(); }
  }
  function buscar(id) {
    for (var i = 0; i < ordens.length; i++) if (ordens[i].id === id) return ordens[i];
    return null;
  }

  filaEl.addEventListener('click', function (ev) {
    var b = ev.target.closest('button[data-acao]');
    if (!b) return;
    var o = buscar(Number(b.getAttribute('data-id')));
    if (!o) return;
    var acao = b.getAttribute('data-acao');
    if (acao === 'historico') {
      o.historicoAberto = !o.historicoAberto;
      renderFila('button[data-acao="historico"][data-id="' + o.id + '"]');
      return;
    }
    if (acao === 'iniciar' && o.status === 'Recebida') {
      o.status = 'Em atendimento';
      o.historico.push({ hora: Lab.horaAgora(), texto: 'Em atendimento · ' + EQUIPES[o.equipe].tecnicos[0] + ' a caminho' });
      Lab.passo(passos, 3);
      renderFila('button[data-acao="concluir"][data-id="' + o.id + '"]');
      Lab.anunciar(o.numero + ' em atendimento. ' + EQUIPES[o.equipe].tecnicos[0] + ' a caminho.');
      Lab.toast(o.numero + ' em atendimento');
    } else if (acao === 'concluir' && o.status === 'Em atendimento') {
      o.status = 'Concluída';
      o.historico.push({ hora: Lab.horaAgora(), texto: 'Concluída' });
      Lab.passo(passos, 3);
      renderFila('button[data-acao="historico"][data-id="' + o.id + '"]');
      Lab.anunciar(o.numero + ' concluída e movida para o fim da fila.');
      Lab.toast(o.numero + ' concluída');
    }
  });

  // ---------- Resultado ----------
  function regra(nome, efeito, delta, variante) {
    return '<div class="regra' + (variante ? ' regra--' + variante : '') + '"><span class="regra__nome">' + Lab.escapar(nome) + '</span><span class="regra__efeito">' + Lab.escapar(efeito) + '</span>' + (delta != null ? '<span class="regra__delta">' + Lab.escapar(delta) + '</span>' : '') + '</div>';
  }
  function textoCopia(o) {
    var p = PROBLEMAS[o.problema], r = REGIOES[o.regiao], eq = EQUIPES[o.equipe];
    var t = '*' + o.numero + '* · TecnoLar\n';
    t += 'Cliente: ' + o.cliente + (o.telefone ? ' · ' + o.telefone : '') + '\n';
    t += 'Problema: ' + p.rotulo + '\n';
    t += 'Região: ' + r.rotulo + '\n';
    t += 'Prioridade: ' + o.faixa.nivel + ' (' + o.faixa.prazo + ')\n';
    t += eq.nome + ': ' + nomesEquipe(o.equipe) + ' · chegada prevista em ~' + o.previsao + ' min\n';
    if (p.gas) t += 'ATENÇÃO: ' + AVISO_GAS + '\n';
    t += 'Status: ' + o.status;
    return t;
  }
  function mostrarResultado(o) {
    var p = PROBLEMAS[o.problema], r = REGIOES[o.regiao], eq = EQUIPES[o.equipe];
    var h = '<div class="resultado resultado--' + o.faixa.variante + '">';
    h += '<div class="resultado__cabeca"><div><p class="resultado__rotulo">Ordem criada</p><p class="resultado__valor">' + Lab.escapar(o.numero) + '</p></div>' + etiqueta('Prioridade ' + o.faixa.nivel, o.faixa.variante) + '</div>';
    h += '<p class="resultado__sub">Prioridade <strong>' + Lab.escapar(o.faixa.nivel) + '</strong> (' + Lab.escapar(o.faixa.prazo) + ') · ' + Lab.escapar(eq.nome) + ': ' + Lab.escapar(nomesEquipe(o.equipe)) + ' · chegada prevista em cerca de <strong>' + o.previsao + ' min</strong>.</p>';
    if (p.gas) h += '<p class="aviso aviso--erro"><strong>Segurança:</strong> ' + Lab.escapar(AVISO_GAS) + '</p>';
    h += '<h3>Como a prioridade foi definida</h3><div class="regras">';
    h += regra('Problema: ' + p.rotulo, 'Peso do tipo de problema', '+' + p.peso);
    h += regra('Urgência: ' + URGENCIAS[o.urgencia], 'Informada pelo cliente', '+' + o.urgencia);
    if (o.risco) h += regra('Risco de segurança', (p.gas ? 'Cheiro de gás' : 'Vazamento') + ' soma ' + PONTOS_RISCO + ' pontos', '+' + o.risco, 'atencao');
    else h += regra('Sem risco de segurança', 'Só gás e vazamento somam pontos extras', '+0', 'ok');
    if (p.gas) h += regra('Regra de gás', 'Cheiro de gás é sempre prioridade ALTA, independentemente da pontuação', 'ALTA', 'erro');
    h += regra('Total: ' + o.pontos + (o.pontos === 1 ? ' ponto' : ' pontos'), 'Faixas: 7 ou mais = ALTA (hoje) · 4 a 6 = MÉDIA (até 48 h) · até 3 = NORMAL (próxima vaga)', o.faixa.nivel, o.faixa.variante);
    h += regra(eq.nome + ': ' + nomesEquipe(o.equipe), r.rotulo + ' é atendida pela equipe ' + o.equipe + '. Deslocamento de ' + o.deslocamento + ' min' + (o.naFila ? ' + ' + o.espera + ' min de fila (' + o.naFila + (o.naFila === 1 ? ' ordem' : ' ordens') + ' em atendimento dessa equipe)' : ', sem fila na equipe agora'), '~' + o.previsao + ' min');
    h += '</div>';
    h += '<div class="acoes"><button class="btn btn--linha btn--sm" type="button" data-copiar>Copiar ordem</button><span class="dica-botao">Texto pronto para o WhatsApp interno da equipe.</span></div>';
    h += '</div>';
    saida.innerHTML = h;
    saida.hidden = false;
    vazio.hidden = true;
    var btn = saida.querySelector('[data-copiar]');
    btn.addEventListener('click', function () { Lab.copiar(textoCopia(o), btn); });
  }

  // ---------- Formulário ----------
  function campoDe(el) { return el.closest('.campo'); }
  function limparErroDe(el) {
    var campo = campoDe(el);
    if (!campo || !campo.classList.contains('campo--invalido')) return;
    campo.classList.remove('campo--invalido');
    var m = campo.querySelector('.campo__erro');
    if (m) m.textContent = '';
  }
  function lerFormulario() {
    return {
      problema: selProblema.value,
      regiao: Lab.fichaEscolhida(fichasRegiao),
      urgencia: Lab.fichaEscolhida(fichasUrgencia),
      nome: inpNome.value.trim(),
      telefone: inpTelefone.value.replace(/\D/g, '')
    };
  }
  function validar(d) {
    Lab.limparErros(form);
    var ok = true;
    if (!PROBLEMAS[d.problema]) { Lab.erro(campoDe(selProblema), 'Escolha o tipo de problema.'); ok = false; }
    if (!REGIOES[d.regiao]) { Lab.erro(campoDe(fichasRegiao), 'Escolha a região do cliente.'); ok = false; }
    if (!(d.urgencia in URGENCIAS)) { Lab.erro(campoDe(fichasUrgencia), 'Informe a urgência relatada pelo cliente.'); ok = false; }
    if (!d.nome) { Lab.erro(campoDe(inpNome), 'Informe o nome do cliente.'); ok = false; }
    else if (d.nome.length > 40) { Lab.erro(campoDe(inpNome), 'Use até 40 caracteres.'); ok = false; }
    if (inpTelefone.value.trim() && (d.telefone.length < 10 || d.telefone.length > 11)) { Lab.erro(campoDe(inpTelefone), 'Telefone com DDD: 10 ou 11 dígitos.'); ok = false; }
    if (!ok) Lab.focarPrimeiroErro(form);
    return ok;
  }
  function registrar() {
    var d = lerFormulario();
    if (!validar(d)) return;
    var o = criarOrdem(d);
    atualId = o.id;
    mostrarResultado(o);
    renderFila();
    Lab.passo(passos, 2);
    Lab.rolarPara(resultado);
    Lab.anunciar('Ordem ' + o.numero + ' criada. Prioridade ' + o.faixa.nivel + ', ' + EQUIPES[o.equipe].nome + ', chegada prevista em ' + o.previsao + ' minutos.' + (PROBLEMAS[o.problema].gas ? ' Atenção: ' + AVISO_GAS : ''));
  }

  form.addEventListener('submit', function (ev) { ev.preventDefault(); registrar(); });
  Lab.ligarFichas(fichasRegiao, function () { limparErroDe(fichasRegiao); });
  Lab.ligarFichas(fichasUrgencia, function () { limparErroDe(fichasUrgencia); });

  function preencher(d) {
    selProblema.value = d.problema;
    Lab.escolherFicha(fichasRegiao, d.regiao);
    Lab.escolherFicha(fichasUrgencia, d.urgencia);
    inpNome.value = d.nome;
    inpTelefone.value = d.telefone || '';
    registrar();
  }
  var btnExemplo = document.querySelector('[data-exemplo]');
  if (btnExemplo) btnExemplo.addEventListener('click', function () {
    preencher({ problema: 'geladeira', regiao: 'norte', urgencia: 2, nome: 'Sr. Antônio', telefone: '61999990000' });
  });
  var btnEmergencia = document.querySelector('[data-exemplo-emergencia]');
  if (btnEmergencia) btnEmergencia.addEventListener('click', function () {
    preencher({ problema: 'gas', regiao: 'centro', urgencia: 3, nome: 'Dona Lúcia', telefone: '' });
  });

  function reiniciar() {
    form.reset();
    Lab.escolherFicha(fichasRegiao, null);
    Lab.escolherFicha(fichasUrgencia, null);
    Lab.limparErros(form);
    saida.innerHTML = '';
    saida.hidden = true;
    vazio.hidden = false;
    semear();
    renderFila();
    Lab.passo(passos, 1);
    selProblema.focus();
    Lab.anunciar('Demonstração reiniciada. A fila voltou às duas ordens fictícias.');
  }
  var btnReiniciar = form.querySelector('[data-reiniciar]');
  if (btnReiniciar) btnReiniciar.addEventListener('click', reiniciar);

  // ---------- Início ----------
  semear();
  renderFila();
})();
