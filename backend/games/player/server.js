// server.js
require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const fastifyCors = require('@fastify/cors');
const metricsPlugin = require('fastify-metrics');
const multipart = require('@fastify/multipart');
const fastifyJwt = require('@fastify/jwt');
const playerRoutes = require('./srcs/player_class');

let db;

async function initDb() {
  db = await open({
    filename: '/data/data.db',
    driver: sqlite3.Database,
  });
  fastify.decorate('db', db);
}

fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS', 'PATCH']
});

fastify.register(metricsPlugin, {
  endpoint: '/metrics',
});

fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET
});

fastify.decorate('authenticate', async function(request, reply) {
  try {
    await request.jwtVerify();
    console.log('Token valide pour', request.user);
  } catch (err) {
    console.error('Erreur auth:', err);
    reply.send(err);
  }
});

fastify.register(playerRoutes);

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
