const fastify = require('fastify')({ logger: true });
const twofa_route = require('./srcs/2fa.js');
const fastifyCors = require('@fastify/cors');
const cookie = require('@fastify/cookie');
//const metrics = require('fastify-metrics'); //require('fastify-metrics')

fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(cookie);

fastify.register(twofa_route, { prefix: '/api' })

//fastify.register(metrics, {
//  endpoint: '/metrics',
//});

const host = '0.0.0.0';
const port = 8100;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
