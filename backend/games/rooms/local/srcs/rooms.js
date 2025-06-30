require('dotenv').config();

module.exports = async function (fastify, opts) {
  class Room {
    constructor(players, custom) {
      this.id = Math.random().toString(36).substring(2, 10);
      this.players = players;
      this.custom = custom;
    }
  }

  const rooms = [];

  fastify.post('/api/rooms/local', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { players, custom } = request.body;

    if (typeof players !== 'number' || players <= 0 || players > 10) {
      return reply.code(400).send({ message: "Nombre de joueurs invalide" });
    }
    if (typeof custom !== 'boolean') {
      return reply.code(400).send({ message: "Format de 'custom' invalide" });
    }

    const room = new Room(players, custom);
    rooms.push(room);

    fastify.log.info(`Nouvelle room créée: ${room.id} (${players} joueurs, bonus: ${custom})`);

    return reply.code(201).send({
      message: "Room créée avec succès",
      room,
    });
  });

  fastify.get('/api/rooms/local', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    return reply.code(200).send({
      message: "Liste des rooms locales",
      rooms,
    });
  });
};



