const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
require('dotenv').config();

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');
  const dbGet = promisify(db.get.bind(db));
  const dbRun = promisify(db.run.bind(db));

  fastify.patch('/user-management/change-user', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username, edit } = request.body;

    if (!username || !edit) {
      return reply.code(400).send({ message: 'Champs requis manquants' });
    }

    try {
      const row = await dbGet('SELECT * FROM users WHERE name = ?', [username]);

      if (!row) {
        return reply.code(404).send({ message: 'Utilisateur introuvable' });
      }

      await dbRun('UPDATE users SET name = ? WHERE name = ?', [edit, username]);

      return reply.send({ message: `Username mis à jour avec succès en "${edit}"` });

    } catch (err) {
      fastify.log.error('Erreur SQL :', err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });
};
