const path    = require('path');
const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

module.exports = async function (fastify, options) {
  const dbPath = '/data/data.db';
  const db = new sqlite3.Database(dbPath, err => {
    if (err) {
      fastify.log.error('Erreur ouverture DB dans tournamentRoutes:', err);
      throw err;
    }
    fastify.log.info('tournamentRoutes: connecté à SQLite:', dbPath);

    db.run(
      `CREATE TABLE IF NOT EXISTS tournament (
         id       INTEGER PRIMARY KEY AUTOINCREMENT,
         match1   TEXT    NOT NULL,
         match2   TEXT    NOT NULL,
         match3   TEXT,
         matchid  INTEGER
       );`,
      err => {
        if (err) fastify.log.error('Erreur création table tournament:', err);
      }
    );
  });

  const tournamentSchema = {
    body: {
      type: 'object',
      required: ['player1','player2','player3','player4'],
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
          id:      { type: 'integer' },
          match1:  { type: 'array', items: { type: 'string' }, minItems:2, maxItems:2 },
          match2:  { type: 'array', items: { type: 'string' }, minItems:2, maxItems:2 },
          matchid: { type: 'integer' }
        }
      }
    }
  };

  fastify.post(
    '/backend/games/tournament', 
    { 
      preHandler: [fastify.authenticate], 
      schema: tournamentSchema 
    }, 
    async (request, reply) => {
      const { player1, player2, player3, player4 } = request.body;
      const match1 = JSON.stringify([player1, player2]);
      const match2 = JSON.stringify([player3, player4]);

      const insertedId = await new Promise((resolve, reject) => {
        const sql = `INSERT INTO tournament (match1, match2, matchid) VALUES (?, ?, 1)`;
        db.run(sql, [match1, match2], function(err) {
          if (err) return reject(err);
          resolve(this.lastID);
        });
      });

      return reply.code(201).send({
        id: insertedId,
        match1: [player1, player2],
        match2: [player3, player4],
        matchid: 1
      });
    }
  );

  const getTournamentSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'integer' } }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id:      { type: 'integer' },
          match1:  { type: 'array', items: { type: 'string' } },
          match2:  { type: 'array', items: { type: 'string' } },
          match3:  { type: ['array','null'], items: { type: 'string' } },
          matchid: { type: ['integer','null'] }
        }
      }
    }
  };

  fastify.get(
    '/backend/games/tournament/:id', 
    { 
      schema: getTournamentSchema 
    }, 
    async (request, reply) => {
      const id = request.params.id;
      try {
        const row = await new Promise((resolve, reject) => {
          db.get('SELECT * FROM tournament WHERE id = ?', [id], (err, row) => err ? reject(err) : resolve(row));
        });
        if (!row) return reply.code(404).send({ message: 'Tournoi non trouvé' });

        const match1  = JSON.parse(row.match1);
        const match2  = JSON.parse(row.match2);
        const match3  = row.match3 ? JSON.parse(row.match3) : null;
        const matchid = row.matchid != null ? row.matchid : null;

        return reply.send({ id: row.id, match1, match2, match3, matchid });
      } catch (err) {
        fastify.log.error('Erreur DB GET tournoi:', err);
        return reply.code(500).send({ message: 'Erreur serveur' });
      }
    }
  );

  const advanceSchema = {
    params: {
      type: 'object',
      required: ['id'],
      properties: { id: { type: 'integer' } }
    },
    body: {
      type: 'object',
      required: ['winner'],
      properties: { winner: { type: 'string' } }
    },
    response: {
      200: {
        type: 'object',
        properties: {
          id:      { type: 'integer' },
          matchid: { type: 'integer' },
          match3:  { type: 'array', items: { type: 'string' }, minItems:2, maxItems:2 }
        }
      }
    }
  };

  fastify.patch(
    '/backend/games/tournament/:id/next', 
    { 
      schema: advanceSchema 
    }, 
    async (request, reply) => {
      const id = request.params.id;
      const { winner } = request.body;
      try {
        const row = await new Promise((resolve, reject) => {
          db.get('SELECT matchid, match3 FROM tournament WHERE id = ?', [id], (err, row) => err ? reject(err) : resolve(row));
        });
        if (!row) return reply.code(404).send({ message: 'Tournoi non trouvé' });

        const current = row.matchid || 1;
        const next    = current + 1;

        // Construire nouveau match3
        let newMatch3;
        if (row.match3) {
          newMatch3 = JSON.parse(row.match3);
        } else {
          newMatch3 = ['', ''];
        }
        newMatch3[current - 1] = winner;
        const match3Json = JSON.stringify(newMatch3);

        await new Promise((resolve, reject) => {
          db.run(
            'UPDATE tournament SET matchid = ?, match3 = ? WHERE id = ?',
            [next, match3Json, id],
            function(err) {
              if (err) return reject(err);
              resolve(this.changes);
            }
          );
        });

        return reply.send({ id, matchid: next, match3: newMatch3 });
      } catch (err) {
        fastify.log.error('Erreur DB PATCH tournoi:', err);
        return reply.code(500).send({ message: 'Erreur serveur' });
      }
    }
  );
};
