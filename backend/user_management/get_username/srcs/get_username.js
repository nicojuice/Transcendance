const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 📁 Connexion à la base de données
const dbPath = path.resolve('/data/data.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur ouverture DB', err.message);
  } else {
    console.log('✅ Connexion à SQLite réussie (get_username)');
  }
});

module.exports = async function (fastify, opts) {
  fastify.get('/get_username', async (request, reply) => {
    const email = request.query.email;

    if (!email) {
      return reply.code(400).send({ error: 'Email requis' });
    }

    return new Promise((resolve, reject) => {
      const query = `SELECT name FROM users WHERE email = ?`;
      db.get(query, [email], (err, row) => {
        if (err) {
          console.error('❌ Erreur DB', err.message);
          return reject(reply.code(500).send({ error: 'Erreur DB' }));
        }

        if (!row) {
          return resolve(reply.code(404).send({ error: 'Utilisateur non trouvé' }));
        }

        return resolve({ username: row.name });
      });
    });
  });
};
