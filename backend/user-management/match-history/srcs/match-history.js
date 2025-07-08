const sqlite3 = require("sqlite3").verbose();
require("dotenv").config();

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database("/data/data.db");

  fastify.post('/user-management/match-history', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username, game, winlose, date } = request.body;

    if (!username || typeof winlose === 'undefined' || !date || !game) {
      return reply.code(400).send({ message: 'Paramètres requis manquants' });
    }

    try {
      const userExists = await new Promise((resolve, reject) => {
        db.get("SELECT 1 FROM users WHERE name = ?", [username], (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        });
      });

      if (!userExists) {
        return reply.code(404).send({ message: 'Utilisateur non trouvé' });
      }

      // Insert dans matchhistory avec username directement
      await new Promise((resolve, reject) => {
        const query = `
          INSERT INTO matchhistory (username, game, winlose, date)
          VALUES (?, ?, ?, ?)
        `;
        db.run(query, [username, game, winlose, date], function (err){
          if (err) {
            fastify.log.error(`Erreur insertion matchhistory: ${err.message}`);
            return reject(err);
          }
          resolve(this.lastID);
        });
      });

      return reply.code(201).send({ message: 'Match enregistré avec succès' });
    } catch (err) {
      fastify.log.error(`Erreur DB: ${err?.message || err}`);
      return reply.code(500).send({ message: 'Erreur lors de l’enregistrement du match' });
    }
  });

  fastify.get('/user-management/match-history/:username', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const { username } = request.params;

    if (!username) {
      return reply.code(400).send({ message: "Nom d'utilisateur manquant" });
    }

    try {
      const matches = await new Promise((resolve, reject) => {
        db.all(
          "SELECT game, winlose, date FROM matchhistory WHERE username = ? ORDER BY date DESC",
          [username],
          (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          }
        );
      });

      return reply.send({ username, matches });
    } catch (err) {
      fastify.log.error(`Erreur DB: ${err?.message || err}`);
      return reply.code(500).send({ message: "Erreur serveur" });
    }
  });
};
