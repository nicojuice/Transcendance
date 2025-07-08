const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const googleAuthRoutes = require('./srcs/google-auth.js');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');

fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.register(googleAuthRoutes, { prefix: '/api' });

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET
});

fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify()
    console.log('Token valide pour', request.user)
  } catch (err) {
    console.error('Erreur auth:', err)
    reply.send(err)
  }
})

fastify.get('/', async (request, reply) => {
  return { message: 'Server is running!', timestamp: new Date().toISOString() };
});

fastify.get('/api/test', async (request, reply) => {
  return { message: 'API is working!', routes: ['GET /api/auth/google', 'GET /api/auth/google/callback', 'POST /api/auth/google/token'] };
});

fastify.ready().then(() => {
  console.log('\nRoutes disponibles:');
  console.log(fastify.printRoutes());
  console.log('\nURLs importantes:');
  console.log(`- Test: http://localhost:8095/`);
  console.log(`- API Test: http://localhost:8095/api/test`);
  console.log(`- Google Auth: http://localhost:8095/api/auth/google`);
  console.log(`- Callback: http://localhost:8095/api/auth/google/callback`);
});

const host = '0.0.0.0';
const port = 8095;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n=====================================');
  console.log(`⭐ Server listening at ${address} ⭐`);
  console.log('=====================================\n');
});

process.on('SIGINT', () => {
  console.log('\nArrêt du serveur...');
  fastify.close().then(() => {
    console.log('Serveur arrêté proprement');
    process.exit(0);
  });
});