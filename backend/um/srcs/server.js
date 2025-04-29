const fastify = require('fastify')({ logger: true });
const db = require('./db');

// route api pour le User Management
const umRoutes = require('./routes/um.js');
fastify.register(umRoutes, { prefix: '/api' });

// metrics pour prometheus
const metricsPlugin = require('fastify-metrics');
fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8003;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
