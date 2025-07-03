// // // routes/tournamentRoutes.js
// // const path = require('path');
// // const sqlite3 = require('sqlite3').verbose();

// // module.exports = async function (fastify, options) {
// //   // Accéder à la base de données SQLite
// //   const dbPath = '/data/data.db';
// //   const db = new sqlite3.Database(dbPath, err => {
// //     if (err) {
// //       fastify.log.error('Erreur ouverture DB dans tournamentRoutes:', err);
// //       throw err;
// //     }
// //     fastify.log.info('tournamentRoutes: connecté à SQLite:', dbPath);

// //     // Création de la table 'tournament' si elle n'existe pas
// //     db.run(
// //       `CREATE TABLE IF NOT EXISTS tournament (
// //          id INTEGER PRIMARY KEY AUTOINCREMENT,
// //          match1 TEXT NOT NULL,
// //          match2 TEXT NOT NULL,
// //          match3 TEXT,
// //          matchid INTEGER
// //        );`,
// //       err => {
// //         if (err) fastify.log.error('Erreur création table tournament:', err);
// //       }
// //     );
// //   });

// //   // Schéma de validation pour POST
// //   const tournamentSchema = {
// //     body: {
// //       type: 'object',
// //       required: ['player1', 'player2', 'player3', 'player4'],
// //       properties: {
// //         player1: { type: 'string' },
// //         player2: { type: 'string' },
// //         player3: { type: 'string' },
// //         player4: { type: 'string' }
// //       }
// //     },
// //     response: {
// //       201: {
// //         type: 'object',
// //         properties: {
// //           id: { type: 'integer' },
// //           match1: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
// //           match2: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 2 },
// //           matchid: { type: 'integer' }
// //         }
// //       }
// //     }
// //   };

// //   // Route POST pour créer un tournoi
// //   fastify.post('/backend/games/tournament', { schema: tournamentSchema }, async (request, reply) => {
// //     const { player1, player2, player3, player4 } = request.body;
// //     const match1 = JSON.stringify([player1, player2]);
// //     const match2 = JSON.stringify([player3, player4]);

// //     // Insérer en base avec matchid initialisé à 1
// //     const insertedId = await new Promise((resolve, reject) => {
// //       const sql = `INSERT INTO tournament (match1, match2, matchid) VALUES (?, ?, 1)`;
// //       db.run(sql, [match1, match2], function(err) {
// //         if (err) return reject(err);
// //         resolve(this.lastID);
// //       });
// //     });

// //     // Répondre avec l'ID et matchid
// //     reply.code(201).send({
// //       id: insertedId,
// //       match1: [player1, player2],
// //       match2: [player3, player4],
// //       matchid: 1
// //     });
// //   });

// //   // Schéma de validation pour GET
// //   const getTournamentSchema = {
// //     params: {
// //       type: 'object',
// //       required: ['id'],
// //       properties: { id: { type: 'integer' } }
// //     },
// //     response: {
// //       200: {
// //         type: 'object',
// //         properties: {
// //           id: { type: 'integer' },
// //           match1: { type: 'array', items: { type: 'string' } },
// //           match2: { type: 'array', items: { type: 'string' } },
// //           match3: { type: ['array', 'null'], items: { type: 'string' } },
// //           matchid: { type: ['integer', 'null'] }
// //         }
// //       }
// //     }
// //   };

// //   // Route GET pour récupérer un tournoi par ID
// //   fastify.get('/backend/games/tournament/:id', { schema: getTournamentSchema }, async (request, reply) => {
// //     const id = request.params.id;
// //     try {
// //       const row = await new Promise((resolve, reject) => {
// //         db.get('SELECT * FROM tournament WHERE id = ?', [id], (err, row) => {
// //           if (err) return reject(err);
// //           resolve(row);
// //         });
// //       });

// //       if (!row) {
// //         return reply.code(404).send({ message: 'Tournoi non trouvé' });
// //       }

// //       // Parse JSON saved fields
// //       const match1 = JSON.parse(row.match1);
// //       const match2 = JSON.parse(row.match2);
// //       const match3 = row.match3 ? JSON.parse(row.match3) : null;
// //       const matchid = row.matchid != null ? row.matchid : null;

// //       reply.send({ id: row.id, match1, match2, match3, matchid });
// //     } catch (err) {
// //       fastify.log.error('Erreur DB GET tournoi:', err);
// //       reply.code(500).send({ message: 'Erreur serveur' });
// //     }
// //   });
// // };

// //   // Route PATCH /api/backend/games/tournament/:id/next
// //   fastify.patch('/backend/games/tournament/:id/next', async (request, reply) => {
// //     const id = request.params.id;
// //     try {
// //       // Récupérer l'actuel matchid
// //       const row = await new Promise((resolve, reject) => {
// //         db.get('SELECT matchid FROM tournament WHERE id = ?', [id], (err, row) => {
// //           if (err) return reject(err);
// //           resolve(row);
// //         });
// //       });
// //       if (!row) {
// //         return reply.code(404).send({ message: 'Tournoi non trouvé' });
// //       }

// //       const current = row.matchid || 1;
// //       const next = current + 1;

// //       // Mettre à jour pour passer au match suivant
// //       await new Promise((resolve, reject) => {
// //         db.run(
// //           'UPDATE tournament SET matchid = ? WHERE id = ?',
// //           [next, id],
// //           function(err) {
// //             if (err) return reject(err);
// //             resolve(this.changes);
// //           }
// //         );
// //       });

// //       // Retourner le nouveau matchid
// //       reply.send({ id, matchid: next });
// //     } catch (err) {
// //       fastify.log.error('Erreur DB PATCH tournoi:', err);
// //       reply.code(500).send({ message: 'Erreur serveur' });
// //     }
// //   });
// // routes/tournamentRoutes.js
// const path    = require('path');
// const sqlite3 = require('sqlite3').verbose();

// module.exports = async function (fastify, options) {
//   // 1) Initialisation de la base SQLite
//   const dbPath = '/data/data.db';
//   const db = new sqlite3.Database(dbPath, err => {
//     if (err) {
//       fastify.log.error('Erreur ouverture DB dans tournamentRoutes:', err);
//       throw err;
//     }
//     fastify.log.info('tournamentRoutes: connecté à SQLite:', dbPath);

//     // Création de la table "tournament" si nécessaire
//     db.run(
//       `CREATE TABLE IF NOT EXISTS tournament (
//          id       INTEGER PRIMARY KEY AUTOINCREMENT,
//          match1   TEXT    NOT NULL,
//          match2   TEXT    NOT NULL,
//          match3   TEXT,
//          matchid  INTEGER
//        );`,
//       err => {
//         if (err) fastify.log.error('Erreur création table tournament:', err);
//       }
//     );
//   });

//   // 2) Schéma de validation pour la création (POST)
//   const tournamentSchema = {
//     body: {
//       type: 'object',
//       required: ['player1','player2','player3','player4'],
//       properties: {
//         player1: { type: 'string' },
//         player2: { type: 'string' },
//         player3: { type: 'string' },
//         player4: { type: 'string' }
//       }
//     },
//     response: {
//       201: {
//         type: 'object',
//         properties: {
//           id:       { type: 'integer' },
//           match1:   { type: 'array', items: { type: 'string' }, minItems:2, maxItems:2 },
//           match2:   { type: 'array', items: { type: 'string' }, minItems:2, maxItems:2 },
//           matchid:  { type: 'integer' }
//         }
//       }
//     }
//   };

//   // Route POST /backend/games/tournament
//   fastify.post('/backend/games/tournament', { schema: tournamentSchema }, async (request, reply) => {
//     const { player1, player2, player3, player4 } = request.body;
//     const match1 = JSON.stringify([player1, player2]);
//     const match2 = JSON.stringify([player3, player4]);

//     // Insert avec matchid initialisé à 1
//     const insertedId = await new Promise((resolve, reject) => {
//       const sql = `INSERT INTO tournament (match1, match2, matchid) VALUES (?, ?, 1)`;
//       db.run(sql, [match1, match2], function(err) {
//         if (err) return reject(err);
//         resolve(this.lastID);
//       });
//     });

//     return reply.code(201).send({
//       id: insertedId,
//       match1: [player1, player2],
//       match2: [player3, player4],
//       matchid: 1
//     });
//   });

//   // 3) Schéma de validation pour la lecture (GET)
//   const getTournamentSchema = {
//     params: {
//       type: 'object',
//       required: ['id'],
//       properties: { id: { type: 'integer' } }
//     },
//     response: {
//       200: {
//         type: 'object',
//         properties: {
//           id:      { type: 'integer' },
//           match1:  { type: 'array', items: { type: 'string' } },
//           match2:  { type: 'array', items: { type: 'string' } },
//           match3:  { type: ['array','null'], items: { type: 'string' } },
//           matchid: { type: ['integer','null'] }
//         }
//       }
//     }
//   };

//   // Route GET /backend/games/tournament/:id
//   fastify.get('/backend/games/tournament/:id', { schema: getTournamentSchema }, async (request, reply) => {
//     const id = request.params.id;
//     try {
//       const row = await new Promise((resolve, reject) => {
//         db.get('SELECT * FROM tournament WHERE id = ?', [id], (err, row) => {
//           if (err) return reject(err);
//           resolve(row);
//         });
//       });
//       if (!row) {
//         return reply.code(404).send({ message: 'Tournoi non trouvé' });
//       }

//       // On parse les champs JSON
//       const match1  = JSON.parse(row.match1);
//       const match2  = JSON.parse(row.match2);
//       const match3  = row.match3 ? JSON.parse(row.match3) : null;
//       const matchid = row.matchid != null ? row.matchid : null;

//       return reply.send({ id: row.id, match1, match2, match3, matchid });
//     } catch (err) {
//       fastify.log.error('Erreur DB GET tournoi:', err);
//       return reply.code(500).send({ message: 'Erreur serveur' });
//     }
//   });

//   // 4) Route PATCH pour passer au match suivant
//   fastify.patch('/backend/games/tournament/:id/next', async (request, reply) => {
//     const id = request.params.id;
//     try {
//       // Lecture du matchid courant
//       const row = await new Promise((resolve, reject) => {
//         db.get('SELECT matchid FROM tournament WHERE id = ?', [id], (err, row) => {
//           if (err) return reject(err);
//           resolve(row);
//         });
//       });
//       if (!row) {
//         return reply.code(404).send({ message: 'Tournoi non trouvé' });
//       }

//       const current = row.matchid || 1;
//       const next    = current + 1;

//       // Mise à jour
//       await new Promise((resolve, reject) => {
//         db.run(
//           'UPDATE tournament SET matchid = ? WHERE id = ?',
//           [next, id],
//           function(err) {
//             if (err) return reject(err);
//             resolve(this.changes);
//           }
//         );
//       });

//       // On renvoie le nouveau matchid
//       return reply.send({ id, matchid: next });
//     } catch (err) {
//       fastify.log.error('Erreur DB PATCH tournoi:', err);
//       return reply.code(500).send({ message: 'Erreur serveur' });
//     }
//   });
// };
// routes/tournamentRoutes.js
const path    = require('path');
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

    // Création de la table 'tournament' si elle n'existe pas
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

  // Schéma de validation pour POST
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

  // Route POST pour créer un tournoi
  fastify.post('/backend/games/tournament', { schema: tournamentSchema }, async (request, reply) => {
    const { player1, player2, player3, player4 } = request.body;
    const match1 = JSON.stringify([player1, player2]);
    const match2 = JSON.stringify([player3, player4]);

    // Insérer en base avec matchid initialisé à 1
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
  });

  // Schéma de validation pour GET
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

  // Route GET pour récupérer un tournoi par ID
  fastify.get('/backend/games/tournament/:id', { schema: getTournamentSchema }, async (request, reply) => {
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
  });

  // Schéma de validation pour PATCH
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

  // Route PATCH pour passer au match suivant et enregistrer le gagnant
  fastify.patch('/backend/games/tournament/:id/next', { schema: advanceSchema }, async (request, reply) => {
    const id = request.params.id;
    const { winner } = request.body;
    try {
      // Lire matchid et match3 existants
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
      // Placer le gagnant au bon index
      newMatch3[current - 1] = winner;
      const match3Json = JSON.stringify(newMatch3);

      // Mettre à jour matchid et match3
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
  });
}; 