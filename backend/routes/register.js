module.exports = async function (fastify, opts) {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('/data/data.db');

  fastify.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.status(400).send({ message: 'Champs manquants' });
    }

    // Insertion dans la base
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    stmt.run([username, email, password], function (err) {
      if (err) {
        console.error('Erreur DB :', err);
        return reply.status(500).send({ message: 'Erreur serveur' });
      }

      return reply.send({ message: 'Utilisateur enregistré avec succès', id: this.lastID });
    });
  });
};
  