
const path = require('path');
const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('fastify-static');
const registerRoutes = require('./routes/register.js');

// Donne le front au server
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..','frontend', 'public'),
  prefix: '/public',
});

fastify.register(registerRoutes);

fastify.get('/', (req, reply) => {
  reply.type('text/html').sendFile('index.html');
});

// askip securite 
fastify.setNotFoundHandler((req, reply) => {
  reply.type('text/html').sendFile('index.html');
});

const host = '0.0.0.0';
const port = 8080;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
