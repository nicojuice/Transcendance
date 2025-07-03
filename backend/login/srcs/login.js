const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

module.exports = function (fastify, opts, done) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');
fastify.get('/backend/user_exist', { preHandler: [fastify.authenticate] }, (request, reply) => {
  const { username } = request.query;

  if (!username) {
    return reply.code(400).send({ message: 'Nom d’utilisateur manquant' });
  }

  db.get('SELECT * FROM users WHERE name = ?', [username], (err, user) => {
    if (err) {
      fastify.log.error('Erreur DB:', err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }

    if (!user) {
      // Utilisateur non trouvé — pas une erreur serveur
      return reply.send({ exists: false });
    }

    // Utilisateur trouvé
    return reply.send({ exists: true });
  });
});

  fastify.post('/backend/login', (request, reply) => {
    const { username, password } = request.body;

    if (!username || !password) {
      return reply.code(400).send({ message: 'Nom d’utilisateur ou mot de passe manquant' });
    }

    fastify.log.info('Tentative login pour :', username);

    db.get('SELECT * FROM users WHERE name = ?', [username], (err, user) => {
      if (err) {
        fastify.log.error('Erreur DB :', err);
        return reply.code(500).send({ message: 'Erreur serveur' });
      }

      if (!user) {
        return reply.code(401).send({ message: 'Utilisateur non trouvé' });
      }

      bcrypt.compare(password, user.password, (err, match) => {
        if (err) {
          fastify.log.error('Erreur comparaison :', err);
          return reply.code(500).send({ message: 'Erreur serveur' });
        }

        if (!match) {
          return reply.code(401).send({ message: 'Mot de passe incorrect' });
        }

        return reply.send({ 
          message: 'Connexion réussie', 
          token: fastify.jwt.sign({id: user.id, email: user.email })
        });
      });
    });
  });

  done();
};