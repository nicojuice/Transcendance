const fastify = require('fastify')({ logger: true });
const db = require('./db');
fastify.decorate('db', db);

const historyRoutes = require('./history');
fastify.register(historyRoutes, { prefix: '/api' });

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const port = process.env.PORT || 8007;
const host = '0.0.0.0';

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`📜 History service listening at ${address}`);
});
