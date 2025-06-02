const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

module.exports = function (fastify, opts, done) {
  // Utilise l'instance partagée si disponible
  const db = fastify.db || new sqlite3.Database('/data/data.db');

  fastify.get('/backend/user_exist', (request, reply) => {
    const { username } = request.query;

    if (!username)
        return (reply.send({ message: 'Pas de connexion courante' }));
    db.get('SELECT * FROM users WHERE name = ?', [username], (err, user) => {
      if (err || !user)
        return (reply.code(500).send({ message: "Utilisateur non existant" }));
      return (reply.send({ message: "Connexion" }));
    })
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

        // Connexion réussie
        return reply.send({ 
          message: 'Connexion réussie', 
          token: fastify.jwt.sign({id: user.id, username: username, email: user.email })
        });
      });
    });
  });

  done();
};