
const path = require('path');
const fastify = require('fastify')({ logger: true });
const fastifyStatic = require('fastify-static');
const registerRoutes = require('./routes/register.js');
const sqlite3 = require('sqlite3').verbose();

// creer la db
const db = new sqlite3.Database('/data/data.db', (err) => {
  if (err) {
    console.error('❌ Erreur ouverture DB', err.message);
  } else {
    console.log('✅ Connexion à SQLite réussie');

    // initialise la db
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
       id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT,
      password TEXT
      )
    `, (err) => {
      if (err) {
        console.error('❌ Erreur création table', err.message);
      } else {
        console.log('✅ Table users créée ou déjà existante');
      }
    });
  }
});

// Donne le front au server
fastify.register(fastifyStatic, {
  root: path.join(__dirname, '..','frontend', 'public',),
  prefix: '/public',
});

// fastify.register(registerRoutes);

// server.js
fastify.register(registerRoutes, { prefix: '/api' });

fastify.get('/', (req, reply) => {
  reply.type('text/html').sendFile('index.html');
});

// askip securite 
fastify.setNotFoundHandler((req, reply) => {
  reply.type('text/html').sendFile('index.html');
});

const host = '0.0.0.0';
const port = 8080;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});
