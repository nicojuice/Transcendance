/* GAME LOGIC ICI */

module.exports = async function (fastify, opts) {
  fastify.get("/ping", async (req, reply) => {
    reply.send({ pong: true });
  });
};
