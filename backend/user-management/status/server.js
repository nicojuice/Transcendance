const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const ApiRoutes = require('./srcs/status.js');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');

fastify.register(fastifyCors, {
    origin: '*',
    methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(ApiRoutes, { prefix: '/api' })

fastify.register(metricsPlugin, { endpoint: '/metrics' });


const host = '0.0.0.0';
const port = 8094;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});