const fastify = require('fastify')({ logger: true });
const sqlite3 = require('sqlite3').verbose();
const registerRoutes = require('./srcs/register.js');
const metricsPlugin = require('fastify-metrics');


const fastifyCors = require('@fastify/cors');
fastify.register(fastifyCors, {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS']
});

// creer la db
// const db = new sqlite3.Database('/data/data.db', (err) => {
//   if (err) {
//     console.error('❌ Erreur ouverture DB', err.message);
//   } else {
//     console.log('✅ Connexion à SQLite réussie');
    
//     // initialise la db
//     db.run(`
//       CREATE TABLE IF NOT EXISTS users (
//         id INTEGER PRIMARY KEY AUTOINCREMENT,
//         name TEXT,
//         email TEXT,
//         password TEXT
//         avatar BLOB
//         )
//         `, (err) => {
//           if (err) {
//             console.error('❌ Erreur création table', err.message);
//           } else {
//             console.log('✅ Table users créée ou déjà existante');
//           }
//         });
//       }
//     });
    
// route api pour l inscription
fastify.register(registerRoutes, { prefix: '/api' })

fastify.register(require('fastify-metrics'), {
  endpoint: '/metrics',
});

const host = '0.0.0.0';
const port = 8082;

// le serveur en ecoute 
fastify.listen({ host, port }, (err, address) => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log('\n\n')
  fastify.log.info(`⭐ Server listening at ${address} ⭐`);
});