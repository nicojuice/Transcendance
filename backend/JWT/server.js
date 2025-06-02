const fastify = require('fastify')({ logger: true });
const jwt_route = require('./srcs/jwt.js');
const fastifyCors = require('@fastify/cors');
const cookie = require('@fastify/cookie');
const fastifyJwt = require('@fastify/jwt');
//const metrics = require('fastify-metrics'); //require('fastify-metrics')

fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(cookie);

fastify.register(jwt_route, { prefix: '/api' })

//fastify.register(metrics, {
//  endpoint: '/metrics',
//});

fastify.register(fastifyJwt, {
  secret: 'supersecret'
});

// Décorateur pour protéger les routes (à utiliser dans d'autres services)
fastify.decorate("authenticate", async function (request, reply) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ message: 'Non autorisé' });
  }
});

const host = '0.0.0.0';
const port = 8101;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
