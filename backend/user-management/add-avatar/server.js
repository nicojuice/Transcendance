const fastify = require('fastify')({ logger: true });
// const sqlite3 = require('sqlite3').verbose();
const add_avatar_route = require('./srcs/add-avatar.js');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');
const multipart = require('@fastify/multipart');
const fastifyJwt = require('@fastify/jwt');


fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(multipart, {
  limits: {
    fileSize: 50 * 1024 * 1024, // 50 MB par fichier
    files: 1, // nombre max de fichiers
  }
});

fastify.register(add_avatar_route, { prefix: '/api' })

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
const port = 8086;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});