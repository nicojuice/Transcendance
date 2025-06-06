const fp = require('fastify-plugin');
const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');

module.exports = fp(async function (fastify, opts) {
  let db;

  // Ouverture de la base de données
  db = await open({
    filename: '/data/data.db',
    driver: sqlite3.Database
  });

  // Route PATCH pour mettre à jour le statut de connexion
  fastify.patch('/api/status', async (request, reply) => {
    const { username, status } = request.body;

    // Vérification basique
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
  fastify.get('/api/status', async (request, reply) => {
    const { username } = request.query;
    console.log('GET /api/status called for:', username);

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
