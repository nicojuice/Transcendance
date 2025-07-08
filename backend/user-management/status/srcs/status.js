const fp = require('fastify-plugin');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
require('dotenv').config();

module.exports = fp(async function (fastify, opts) {
  let db;

  db = await open({
    filename: '/data/data.db',
    driver: sqlite3.Database
  });

  fastify.patch('/api/status', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username, status } = request.body;

    if (typeof username !== 'string' || (status !== 0 && status !== 1)) {
      return reply.code(400).send({ error: 'Requête invalide' });
    }

    try {
      const result = await db.run(
        'UPDATE users SET status = ? WHERE name = ?',
        [status, username]
      );

      if (result.changes === 0) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      return reply.send({ message: `Statut de ${username} mis à jour à ${status}` });
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });
  
  fastify.get('/api/status', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username } = request.query;

    if (typeof username !== 'string') {
      return reply.code(400).send({ error: 'Paramètre "username" manquant ou invalide' });
    }

    try {
      const user = await db.get(
        'SELECT status FROM users WHERE name = ?',
        [username]
      );

      if (!user) {
        return reply.code(404).send({ error: 'Utilisateur non trouvé' });
      }

      return reply.send({ username, status: user.status });
    } catch (err) {
      request.log.error(err);
      return reply.code(500).send({ error: 'Erreur serveur' });
    }
  });
});
