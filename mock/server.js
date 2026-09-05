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
