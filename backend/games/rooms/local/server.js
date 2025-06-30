const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const roomRoutes = require('./srcs/rooms.js');
const fastifyCors = require('@fastify/cors');
const fastifyJwt = require('@fastify/jwt');
const metricsPlugin = require('fastify-metrics');


fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS']
});

fastify.register(roomRoutes)

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

const host = '0.0.0.0';
const port = 8096;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n🚀 Serveur login en écoute sur :', address, '\n');
});