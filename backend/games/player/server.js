const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');
const multipart = require('@fastify/multipart');
const Player = require('./srcs/player_class'); // supposé être une classe Player

let db;

fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

async function initDb() {
  db = await open({
    filename: '/data/data.db',
    driver: sqlite3.Database,
  });
}

fastify.get('/api/player_class', async (request, reply) => {
  try {
    const users = await db.all('SELECT * FROM users');
    const players = users.map(user => new Player(user));
    return players; // Fastify stringify automatiquement
  } catch (err) {
    fastify.log.error(err);
    return reply.status(500).send({ error: 'Erreur serveur' });
  }
});

fastify.register(metricsPlugin, {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8092;

async function start() {
  try {
    await initDb();
    await fastify.listen({ host, port });
    fastify.log.info(`⭐ Server listening at http://${host}:${port} ⭐`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();


// const fastify = require('fastify')({ logger: true });
// const sqlite3 = require('sqlite3').verbose();
// const fastifyCors = require('@fastify/cors');
// const metricsPlugin = require('fastify-metrics');
// const multipart = require('@fastify/multipart');
// const player_class = require('./srcs/player_class')
// let db;

// fastify.register(fastifyCors, {
//   origin: '*',
//   methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
// });

// async function initDb() {
//   db = await open({
//     filename: '/data/data.db', // adapte à ton chemin docker
//     driver: sqlite3.Database,
//   });
// }

// astify.get('/api/player_class', async (request, reply) => {
//   try {
//     const users = await db.all('SELECT * FROM users');
//     const player_class = users.map(user => new Player(user));
//     return player_class; // Fastify va automatiquement JSON.stringify
//   } catch (err) {
//     fastify.log.error(err);
//     return reply.status(500).send({ error: 'Erreur serveur' });
//   }
// });


// // fastify.register(add_avatar_route, { prefix: '/api' })

// fastify.register(require('fastify-metrics'), {
//   endpoint: '/metrics',
// });

// const host = '0.0.0.0';
// const port = 8092;

// await initDb();


// // le serveur en ecoute 
// fastify.listen({ host, port }, (err, address) => {
//   if (err) {
//     fastify.log.error(err);
//     process.exit(1);
//   }
//   console.log('\n\n')
//   fastify.log.info(`⭐ Server listening at ${address} ⭐`);
// })

// start();