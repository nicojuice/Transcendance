const fastify = require('fastify')({ logger: true });
const registerRoutes = require('./srcs/register.js');
const metricsPlugin = require('fastify-metrics');


const fastifyCors = require('@fastify/cors');
fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(registerRoutes, { prefix: '/api' })

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8082;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});