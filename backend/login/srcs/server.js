const fastify = require('fastify')({ logger: true });
const db = require('./db');

// route api pour le login
const loginRoutes = require('./login.js');
fastify.register(loginRoutes, { prefix: '/api' })

// metrics pour prometheus
const metricsPlugin = require('fastify-metrics');
fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8002;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
