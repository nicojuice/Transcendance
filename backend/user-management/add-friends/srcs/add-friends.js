const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

async function registerAddFriendsRoute(fastify, opts) {
  const db = await open({
    filename: '/data/data.db', // adapte au chemin monté dans Docker
    driver: sqlite3.Database,
  });

  fastify.post('/add-friends', async (request, reply) => {
    const { username, friend } = request.body;

    if (!username || !friend) {
      return reply.code(400).send({ message: 'Champs username et friend requis.' });
    }

    try {
      const user = await db.get(`SELECT id FROM users WHERE name = ?`, username);
      if (!user) return reply.code(404).send({ message: `Utilisateur ${username} introuvable.` });

      const friendUser = await db.get(`SELECT id FROM users WHERE name = ?`, friend);
      if (!friendUser) return reply.code(404).send({ message: `Ami ${friend} introuvable.` });

      const existing = await db.get(
        `SELECT 1 FROM friends WHERE user_id = ? AND friend_id = ?`,
        [user.id, friendUser.id]
      );
      if (existing) {
        return reply.code(409).send({ message: `${friend} est déjà ami avec ${username}.` });
      }

      await db.run(
        `INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`,
        [user.id, friendUser.id]
      );

      return reply.send({ message: `${friend} ajouté comme ami à ${username}` });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur lors de l’ajout.' });
    }
  });
}

module.exports = registerAddFriendsRoute;