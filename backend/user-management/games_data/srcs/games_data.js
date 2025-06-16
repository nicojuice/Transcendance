const sqlite3 = require('sqlite3').verbose();

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');

  // Endpoint pour mettre à jour les statistiques de jeu
  fastify.patch('/user-management/games_data', async (request, reply) => {
    const { username, isWin } = request.body;

    if (!username || typeof isWin === 'undefined') {
      return reply.code(400).send({ message: 'Paramètres manquants' });
    }

    try {
      // 1. D'abord récupérer l'ID de l'utilisateur à partir du username
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT id FROM users WHERE name = ?', [username], (err, row) => {
          if (err) reject(err);
          resolve(row);
        });
      });

      if (!user) {
        return reply.code(404).send({ message: 'Utilisateur non trouvé' });
      }

      // 2. Mettre à jour les statistiques avec l'ID trouvé
      let updateQuery;
      if (isWin) {
        updateQuery = 'UPDATE users SET wins = wins + 1, all_games = all_games + 1 WHERE id = ?';
      } else {
        updateQuery = 'UPDATE users SET all_games = all_games + 1 WHERE id = ?';
      }

      const result = await new Promise((resolve, reject) => {
        db.run(updateQuery, [user.id], function(err) {
          if (err) reject(err);
          resolve(this.changes);
        });
      });

      if (result === 0) {
        return reply.code(500).send({ message: 'Échec de la mise à jour' });
      }

      return reply.send({ 
        message: 'Statistiques mises à jour avec succès',
        username: username,
        updated: result
      });

    } catch (err) {
      fastify.log.error('Erreur DB:', err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });

  fastify.get('/user-management/games_data/:username', async (request, reply) => {
    const { username } = request.params;

    if (!username) {
      return reply.code(400).send({ message: 'Nom d\'utilisateur manquant' });
    }

    try {
      // Récupérer les statistiques de l'utilisateur
      const stats = await new Promise((resolve, reject) => {
        db.get(
          'SELECT wins, all_games FROM users WHERE name = ?',
          [username],
          (err, row) => {
            if (err) reject(err);
            resolve(row);
          }
        );
      });

      if (!stats) {
        return reply.code(404).send({ message: 'Utilisateur non trouvé' });
      }

      return reply.send({
        username: username,
        wins: stats.wins,
        losses: stats.all_games - stats.wins,
        win_rate: stats.all_games > 0 
          ? Math.round((stats.wins / stats.all_games) * 100) 
          : 0
      });

    } catch (err) {
      fastify.log.error('Erreur DB:', err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });
};