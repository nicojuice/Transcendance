const fastify = require('fastify')({ logger: true });

const gameEngineRoutes = require('./game-engine');
fastify.register(gameEngineRoutes, { prefix: '/api' });

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const port = process.env.PORT || 8005;
const host = '0.0.0.0';

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🎮 Game Engine service listening at ${address}`);
});
