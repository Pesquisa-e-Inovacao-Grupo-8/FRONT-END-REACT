const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('./mock/db.json');
const middlewares = jsonServer.defaults();
const PORT = 3001;

server.use(middlewares);

// Permite CORS para o Vite dev server
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Custom route: POST /auth/login -> valida credenciais contra /usuarios
server.post('/auth/login', jsonServer.bodyParser, (req, res) => {
  const { email, senha } = req.body || {};
  if (!email || !senha) return res.status(400).json({ message: 'Email e senha required' });

  const db = router.db; // lowdb instance
  const usuarios = db.get('usuarios').value() || [];

  const user = usuarios.find(u => (u.email || '').toLowerCase() === (email || '').toLowerCase());

  if (!user) return res.status(401).json({ message: 'Usuário não encontrado' });

  // For mock, accept raw senha match or if stored hashed, accept specific test passwords
  const senhaMatches = user.senha === senha || senha === user.senha;

  if (!senhaMatches) return res.status(401).json({ message: 'Credenciais inválidas' });

  // Retorna um token simples de mock
  const token = `mock-token-${user.id}`;
  return res.json({ token });
});

function encontrarCliente(db, usuarioId) {
  return (db.get('clientes').value() || []).find(cliente =>
    cliente.id === usuarioId || cliente.fk_usuario === usuarioId
  );
}

function montarMeusPacotes(db, usuarioId) {
  const cliente = encontrarCliente(db, usuarioId);
  if (!cliente) return [];

  const pacotes = db.get('pacotes').value() || [];
  const clientePacotes = (db.get('clientePacotes').value() || []).filter(clientePacote =>
    clientePacote.fk_cliente === cliente.id || clientePacote.clienteId === cliente.id
  );
  const vinculos = db.get('cliente_pacote_servico').value() || [];
  const pacoteServicos = db.get('pacoteServicos').value() || [];
  const servicos = db.get('servicos').value() || [];

  return clientePacotes.map(clientePacote => {
    const pacote = pacotes.find(item => item.id === (clientePacote.fk_pacote || clientePacote.pacoteId));
    const saldos = vinculos.filter(vinculo => vinculo.fk_cliente_pacote === clientePacote.id);
    const servicosDoPacote = pacoteServicos
      .filter(vinculo => vinculo.fk_pacote === pacote?.id)
      .map(vinculo => {
        const servico = servicos.find(item => item.id === vinculo.fk_servico);
        const saldo = saldos.find(item => item.fk_servico === vinculo.fk_servico);
        return {
          id: servico?.id,
          nome: servico?.nome,
          descricao: servico?.descricao,
          preco: servico?.preco,
          duracaoMinutos: servico?.duracaoMinutos,
          clientePacoteServicoId: saldo?.id || null,
          quantidadeDisponivel: saldo?.quantidade_disponivel ?? saldo?.quantidadeDisponivel ?? 0,
          quantidadeConfigurada: saldo?.quantidade_configurada ?? saldo?.quantidadeConfigurada ?? 0
        };
      });

    return {
      id: clientePacote.id,
      nome: pacote?.nome || 'Pacote não encontrado',
      descricao: pacote?.descricao || '',
      precoTotal: pacote?.precoTotal ?? pacote?.preco_total ?? 0,
      ativo: clientePacote.ativo !== false && clientePacote.status !== 'INATIVO',
      dtExpiracao: clientePacote.dtExpiracao || clientePacote.dt_expiracao || null,
      servicos: servicosDoPacote
    };
  });
}

server.get('/clientePacotes/meus/:usuarioId', (req, res) => {
  return res.json(montarMeusPacotes(router.db, req.params.usuarioId));
});

server.post('/clientePacotes', jsonServer.bodyParser, (req, res) => {
  const db = router.db;
  const cliente = encontrarCliente(db, req.query.clienteId);
  const pacote = (db.get('pacotes').value() || []).find(item => item.id === req.query.pacoteId);

  if (!cliente || !pacote) {
    return res.status(404).json({ message: 'Cliente ou pacote não encontrado' });
  }

  const clientePacote = {
    id: `cp-${Date.now()}`,
    fk_cliente: cliente.id,
    fk_pacote: pacote.id,
    status: 'ATIVO',
    ativo: true,
    data_compra: new Date().toISOString(),
    dt_expiracao: req.body?.dtExpiracao || null
  };
  const quantidadePorServico = req.body?.quantidadePorServico || {};
  const pacoteServicos = (db.get('pacoteServicos').value() || []).filter(item => item.fk_pacote === pacote.id);
  const saldos = db.get('cliente_pacote_servico').value() || [];

  pacoteServicos.forEach(vinculo => {
    const quantidade = Number(quantidadePorServico[vinculo.fk_servico] ?? vinculo.quantidadeUsos ?? req.body?.qtdUsos ?? 0);
    saldos.push({
      id: `cps-${Date.now()}-${vinculo.fk_servico}`,
      fk_cliente_pacote: clientePacote.id,
      fk_servico: vinculo.fk_servico,
      quantidade_disponivel: quantidade,
      quantidade_configurada: quantidade
    });
  });

  db.get('clientePacotes').push(clientePacote).write();
  db.set('cliente_pacote_servico', saldos).write();
  return res.status(201).json(clientePacote);
});

server.post('/agendamentos', jsonServer.bodyParser, (req, res, next) => {
  const clientePacoteServicoId = req.body?.clientePacoteServicoId;
  if (!clientePacoteServicoId) return next();

  const db = router.db;
  const saldo = (db.get('cliente_pacote_servico').value() || []).find(item => item.id === clientePacoteServicoId);
  if (!saldo || Number(saldo.quantidade_disponivel ?? saldo.quantidadeDisponivel ?? 0) <= 0) {
    return res.status(400).json({ message: 'Este serviço não possui agendamentos disponíveis no pacote' });
  }

  const clientePacote = (db.get('clientePacotes').value() || []).find(item => item.id === saldo.fk_cliente_pacote);
  const expiracao = clientePacote?.dtExpiracao || clientePacote?.dt_expiracao;
  if (!clientePacote?.ativo || clientePacote.status === 'INATIVO' || (expiracao && new Date(expiracao) < new Date())) {
    return res.status(400).json({ message: 'Este pacote está inativo ou expirado' });
  }

  const agendamento = {
    ...req.body,
    id: req.body.id || `agd-${Date.now()}`,
    pacoteConsumoConfirmado: false
  };
  db.get('agendamentos').push(agendamento).write();
  return res.status(201).json(agendamento);
});

server.post('/pagamentos/confirmar', jsonServer.bodyParser, (req, res) => {
  const db = router.db;
  const agendamento = (db.get('agendamentos').value() || []).find(item => item.id === req.body?.agendamentoId);
  if (!agendamento) return res.status(404).json({ message: 'Agendamento não encontrado' });
  if (agendamento.pacoteConsumoConfirmado) return res.json(agendamento);

  const vinculo = (db.get('agendamentoServicos').value() || []).find(item =>
    item.agendamentoId === agendamento.id || item.fk_agendamento === agendamento.id
  );
  const saldoId = vinculo?.clientePacoteServicoId || vinculo?.fk_cliente_pacote_servico || agendamento.clientePacoteServicoId;
  const saldos = db.get('cliente_pacote_servico').value() || [];
  const saldo = saldos.find(item => item.id === saldoId);
  if (saldo) {
    const quantidade = Number(saldo.quantidade_disponivel ?? saldo.quantidadeDisponivel ?? 0);
    saldo.quantidade_disponivel = Math.max(0, quantidade - 1);
  }

  agendamento.pacoteConsumoConfirmado = true;
  db.set('cliente_pacote_servico', saldos).write();
  db.set('agendamentos', db.get('agendamentos').value()).write();
  return res.json(agendamento);
});

// Simula o vínculo de serviços do profissional usado pela área administrativa.
server.get('/profissionais/meus-servicos/:usuarioId', (req, res) => {
  const db = router.db;
  const profissional = (db.get('profissionais').value() || []).find(prof =>
    prof.id === req.params.usuarioId ||
    prof.fk_usuario === req.params.usuarioId ||
    prof.usuario?.id === req.params.usuarioId
  );
  const servicoIds = profissional?.servicos || [];
  const servicos = (db.get('servicos').value() || []).filter(servico => servicoIds.includes(servico.id));

  return res.json(servicos);
});

server.post('/profissionais/vincular-servicos/:usuarioId', jsonServer.bodyParser, (req, res) => {
  const servicoIds = Array.isArray(req.body) ? req.body : [];
  const db = router.db;
  const profissionais = db.get('profissionais').value() || [];
  const profissional = profissionais.find(prof =>
    prof.id === req.params.usuarioId ||
    prof.fk_usuario === req.params.usuarioId ||
    prof.usuario?.id === req.params.usuarioId
  );

  if (!profissional) {
    return res.status(404).json({ message: 'Profissional não encontrado' });
  }

  const servicos = db.get('servicos').value() || [];
  const servicosValidos = servicoIds.filter(id => servicos.some(servico => servico.id === id));
  profissional.servicos = servicosValidos;
  db.set('profissionais', profissionais).write();

  return res.json({ ...profissional, servicos: servicosValidos });
});

server.use(router);

server.listen(PORT, () => {
  console.log(`[Mock API] Rodando em http://localhost:${PORT}`);
  console.log(`  GET  /funcionarias`);
  console.log(`  POST /funcionarias`);
  console.log(`  PUT  /funcionarias/:id`);
  console.log(`  GET  /agendamentos`);
  console.log(`  POST /agendamentos`);
  console.log(`  PUT  /agendamentos/:id`);
});
