const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const loginRoutes = require('./srcs/add-friends.js');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');


// const path = require('path');
// const loginRoutes = require(path.join(__dirname, 'srcs', 'add-friends.js'));


fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(loginRoutes, { prefix: '/api/user-management' });

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8087;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
