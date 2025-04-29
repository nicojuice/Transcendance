const fastify = require('fastify')({ logger: true });

fastify.register(require('@fastify/websocket'));

const realtimeRoutes = require('./realtime');
fastify.register(realtimeRoutes, { prefix: '/api' });

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = process.env.PORT || 8006;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Realtime WebSocket server listening at ${address}`);
});
