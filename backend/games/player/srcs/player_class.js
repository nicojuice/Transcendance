require('dotenv').config();

class Player {
  constructor({ id, name, email, avatar }) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.avatar = avatar;
  }
}

async function playerRoutes(fastify, options) {
  fastify.get('/api/player_class', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    try {
      const users = await fastify.db.all('SELECT * FROM users');
      const players = users.map(user => new Player(user));
      return players;
    } catch (err) {
      fastify.log.error(err);
      return reply.status(500).send({ error: 'Erreur serveur' });
    }
  });
}

module.exports = playerRoutes;
module.exports.Player = Player;
