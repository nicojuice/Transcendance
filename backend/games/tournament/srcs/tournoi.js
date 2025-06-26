// routes/tournamentRoutes.js
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

module.exports = async function (fastify, options) {
  // Accéder à la base de données SQLite
  const dbPath = '/data/data.db';
  const db = new sqlite3.Database(dbPath, err => {
    if (err) {
      fastify.log.error('Erreur ouverture DB dans tournamentRoutes:', err);
      throw err;
    }
    fastify.log.info('tournamentRoutes: connecté à SQLite:', dbPath);

    // Création de la table tournoi si elle n'existe pas
    db.run(
      `CREATE TABLE IF NOT EXISTS tournament (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        match1 TEXT NOT NULL,
        match2 TEXT NOT NULL,
        match3 TEXT
      );`,
      err => {
        if (err) fastify.log.error('Erreur création table tournament:', err);
      }
    );
  });

  // Schéma de validation Fastify
  const tournamentSchema = {
    body: {
      type: 'object',
      required: ['player1', 'player2', 'player3', 'player4'],
      properties: {
        player1: { type: 'string' },
        player2: { type: 'string' },
        player3: { type: 'string' },
        player4: { type: 'string' }
      }
    },
    response: {
      201: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          match1: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
          match2: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 }
        }
      }
    }
  };

  // Route POST /api/backend/games/tournament
  fastify.post('/backend/games/tournament', { schema: tournamentSchema }, async (request, reply) => {
    const { player1, player2, player3, player4 } = request.body;

    const match1 = JSON.stringify([player1, player2]);
    const match2 = JSON.stringify([player3, player4]);

    // Insérer en base et récupérer l'ID
    const insertedId = await new Promise((resolve, reject) => {
      const sql = `INSERT INTO tournament (match1, match2) VALUES (?, ?)`;
      db.run(sql, [match1, match2], function(err) {
        if (err) return reject(err);
        resolve(this.lastID);
      });
    });

    reply.code(201).send({ id: insertedId, match1: [player1, player2], match2: [player3, player4] });
  });
};