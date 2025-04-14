const path = require('path');
const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('fastify-static');

// Sert les fichiers statiques depuis /public (ton build front)
fastify.register(fastifyStatic, {
  root: path.join(__dirname, 'App'),
  prefix: '/',
  wildcard: false,
});

// Pour toutes les routes non trouvées (ex: /dashboard, /profile), renvoie index.html
fastify.setNotFoundHandler((req, reply) => {
  reply.type('text/html').sendFile('index.html');
});

fastify.listen({ port: 3000 }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
