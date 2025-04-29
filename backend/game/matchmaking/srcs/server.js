const fastify = require('fastify')({ logger: true });
const { createClient } = require('redis');

// Connexion Redis
const redisClient = createClient({ url: 'redis://redis:6379' });

redisClient.connect()
  .then(() => fastify.log.info('✅ Connecté à Redis'))
  .catch((err) => {
    fastify.log.error('❌ Erreur connexion Redis :', err);
    process.exit(1);
  });

// Partage Redis dans fastify
fastify.decorate('redis', redisClient);

// Import des routes matchmaking
const matchmakingRoutes = require('./matchmaking');
fastify.register(matchmakingRoutes, { prefix: '/api' });

// Metrics Prometheus
fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

// Start server
const host = '0.0.0.0';
const port = process.env.PORT || 8004;

fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  fastify.log.info(`🚀 Matchmaking service listening at ${address}`);
});
