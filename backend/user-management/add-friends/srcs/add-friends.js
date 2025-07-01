const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
require('dotenv').config();

async function registerAddFriendsRoute(fastify, opts) {
  const db = await open({
    filename: '/data/data.db',
    driver: sqlite3.Database,
  });

  fastify.get('/get-friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username } = request.query;

    if (!username)
      return (reply.status(400).send({ error: "Erreur, aucun utilisateur" }));
    try {
      const userRow = await db.get('SELECT id FROM users WHERE name = ?', username);
      if (!userRow) {
        return (reply.status(404).send({ error: 'User not found' }));
      }
      const friends = await db.all(
        `SELECT u.id, u.name
         FROM friends f
         JOIN users u ON u.id = f.friend_id
         WHERE f.user_id = ?`,
        userRow.id
      );
      const friendNames = friends.map(friend => friend.name);
      return (reply.send({ friends: friendNames || [] }));
    } catch(err) {
      console.log(err);
      return (reply.status(500).send({ error: "Internal error" }));
    }
  });

  fastify.post('/add-friends', { preHandler: [fastify.authenticate] }, async (request, reply) => {
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
        return reply.code(409).send({ message: `Vous suivez déja ${friend}.` });
      }

      await db.run(
        `INSERT INTO friends (user_id, friend_id) VALUES (?, ?)`,
        [user.id, friendUser.id]
      );

      return reply.send({ message: `${friend} a été ajouté comme ami` });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur lors de l’ajout.' });
    }
  });
  fastify.delete('/remove-friend/:username/:friend', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username, friend } = request.params;


    if (!username || !friend) {
      return reply.code(400).send({ message: 'Champs username et friend requis.' });
    }

    try {
      const user = await db.get(`SELECT id FROM users WHERE name = ?`, username);
      if (!user) return reply.code(404).send({ message: `Utilisateur ${username} introuvable.` });

      const friendUser = await db.get(`SELECT id FROM users WHERE name = ?`, friend);
      if (!friendUser) return reply.code(404).send({ message: `Ami ${friend} introuvable.` });

      const deleted = await db.run(
        `DELETE FROM friends WHERE user_id = ? AND friend_id = ?`,
        [user.id, friendUser.id]
      );

      if (deleted.changes === 0) {
        return reply.code(404).send({ message: `${friend} n'était pas dans la liste d'amis de ${username}` });
      }

      return reply.send({ message: `${friend} supprimé de la liste d'amis de ${username}` });
    } catch (err) {
      fastify.log.error(err);
      return reply.code(500).send({ message: 'Erreur lors de la suppression.' });
    }
  });
}

module.exports = registerAddFriendsRoute;