const fastify = require('fastify')({ logger: true });
const loginRoutes = require('./srcs/get_username.js');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');



fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS']
});
    
// route api pour le login
fastify.register(loginRoutes, { prefix: '/api' })

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8083;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});