const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');

  // Endpoint de test
  fastify.get('/ping', async (request, reply) => {
    return { message: 'pong' };
  });

  // Route d'inscription
  fastify.post('/register', (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.code(400).send({ message: 'Champs manquants' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        fastify.log.error('Erreur de hash :', err);
        return reply.code(500).send({ message: 'Erreur serveur' });
      }

      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            fastify.log.error('Erreur DB :', err);
            return reply.code(500).send({ message: 'Erreur serveur' });
          }
          return reply.send({ message: 'Utilisateur enregistré avec succès', id: this.lastID });
        }
      );
    });
  });
};


  