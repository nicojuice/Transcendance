const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const googleAuthRoutes = require('./srcs/google-auth.js');
const fastifyCors = require('@fastify/cors');

// Configuration CORS
fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

// Enregistrement des routes Google Auth
fastify.register(googleAuthRoutes, { prefix: '/api' });

// Métriques (optionnel)
fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

// Route de test
fastify.get('/', async (request, reply) => {
  return { message: 'Server is running!', timestamp: new Date().toISOString() };
});

// Route de test pour l'API
fastify.get('/api/test', async (request, reply) => {
  return { message: 'API is working!', routes: ['GET /api/auth/google', 'GET /api/auth/google/callback', 'POST /api/auth/google/token'] };
});

// Route pour servir la page de succès
fastify.get('/auth-success', async (request, reply) => {
  const user = request.query.user || 'Utilisateur';
  const token = request.query.token || '';
  console.log('token');
  reply.type('text/html');
  return `
  <style>
    body { font-family: Arial, sans-serif; text-align: center; padding: 2rem; background: #f0f2f5; }
    .container { max-width: 400px; margin: 0 auto; background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .success { color: #4CAF50; font-size: 2rem; margin-bottom: 1rem; }
    .btn { background: #4285f4; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none; }
  </style>

  <div class="container">
    <div class="success">✅</div>
    <h1>Connexion Google réussie !</h1>
    <p>Bienvenue ${user} !</p>
    <button class="btn" id="continueBtn">Continuer vers l'application</button>
  </div>

  <script>
    // Stockage dans le localStorage
    const user = "${user}";
    const token = "${token}";

    if (user) localStorage.setItem("username", user);
    if (token) localStorage.setItem("token", token);
    localStorage.setItem("isConnected", "true");
    localStorage.setItem("isGoogleConnected", "true");

    document.getElementById('continueBtn').addEventListener('click', () => {
      window.location.href = 'https://localhost:8443/profile';
    });
  </script>
`;
});


// Affichage des routes une fois prêt
fastify.ready().then(() => {
  console.log('\n📋 Routes disponibles:');
  console.log(fastify.printRoutes());
  console.log('\n🔗 URLs importantes:');
  console.log(`- Test: http://localhost:8095/`);
  console.log(`- API Test: http://localhost:8095/api/test`);
  console.log(`- Google Auth: http://localhost:8095/api/auth/google`);
  console.log(`- Callback: http://localhost:8095/api/auth/google/callback`);
});

const host = '0.0.0.0';
const port = 8095;

// Démarrage du serveur
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n🚀 =====================================');
  console.log(`⭐ Server listening at ${address} ⭐`);
  console.log('=====================================\n');
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  fastify.close().then(() => {
    console.log('✅ Serveur arrêté proprement');
    process.exit(0);
  });
});