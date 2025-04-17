
module.exports = async function (fastify, opts) {
    fastify.post('/api/register', async (request, reply) => {
      const { username, email, password } = request.body;
      reply.send({ message: 'Utilisateur enregistré avec succès' });
    });
  };
  