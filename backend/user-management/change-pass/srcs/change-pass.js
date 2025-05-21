const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const bcrypt = require('bcrypt');

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');
  const dbGet = promisify(db.get.bind(db));
  const dbRun = promisify(db.run.bind(db));

  fastify.patch('/user-management/change-password', async (request, reply) => {
    const { username, newPassword } = request.body;

    if (!username || !newPassword) {
      return reply.code(400).send({ message: 'Champs requis manquants' });
    }

    try {
      const user = await dbGet('SELECT * FROM users WHERE name = ?', [username]);

      if (!user) {
        return reply.code(404).send({ message: 'Utilisateur introuvable' });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      await dbRun('UPDATE users SET password = ? WHERE name = ?', [hashedPassword, username]);

      return reply.send({ message: 'Mot de passe mis à jour avec succès' });

    } catch (err) {
      fastify.log.error('Erreur SQL :', err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });
};
