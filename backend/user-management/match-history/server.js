const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const ApiRoutes = require('./srcs/match-history.js');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');
const fastifyJwt = require('@fastify/jwt');

fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(ApiRoutes, { prefix: '/api' })

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

fastify.register(metricsPlugin, { endpoint: '/metrics' });

const host = '0.0.0.0';
const port = 8091;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
