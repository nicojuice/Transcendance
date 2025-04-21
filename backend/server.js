
const path = require('path');
const fastify = require('fastify')({ logger: true });
const fastifyCors = require('fastify-cors');
const fastifyStatic = require('fastify-static');
const registerRoutes = require('./routes/register.js');
const loginRoutes = require('./routes/login.js');
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

fastify.register(fastifyCors, {
  origin: ['https://172.18.0.4:8443'], // Autoriser l'origine de ton frontend
});

// fastify.register(registerRoutes);

// server.js
fastify.register(registerRoutes, { prefix: '/api' });

fastify.register(loginRoutes, { prefix: '/api' });

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
