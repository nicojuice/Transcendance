const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

module.exports = async function (fastify, opts) {
  const db = new sqlite3.Database('/data/data.db');

  fastify.post('/login', async (request, reply) => {
    const { username, password } = request.body;

    // Vérification des champs
    if (!username || !password) {
      return reply.status(400).send({ message: 'Nom d’utilisateur ou mot de passe manquant' });
    }

    console.log('le user ', username);
    console.log('le password ', password);
    // Recherche de l'utilisateur avec le username
    db.get('SELECT * FROM users WHERE name = ?', [username], async (err, user) => {
      if (err) {
        console.error('Erreur DB :', err);
        return reply.status(500).send({ message: 'Erreur serveur' });
      }

      // Vérifie si l'utilisateur existe
      if (!user) {
        return reply.status(401).send({ message: 'Utilisateur non trouvé' });
      }

      // Comparaison du mot de passe
      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return reply.status(401).send({ message: 'Mot de passe incorrect' });
      }

      // Connexion réussie
      return reply.send({ message: 'Connexion réussie', id: user.id, email: user.email });
    });
  });
};

