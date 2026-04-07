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
