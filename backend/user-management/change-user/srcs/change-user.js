const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');
  const dbGet = promisify(db.get.bind(db));
  const dbRun = promisify(db.run.bind(db));

  fastify.patch('/user-management/change-user', async (request, reply) => {
    const { username, edit } = request.body;

    if (!username || !edit) {
      return reply.code(400).send({ message: 'Champs requis manquants' });
    }

    try {
      const row = await dbGet('SELECT * FROM users WHERE name = ?', [username]);

      if (!row) {
        return reply.code(404).send({ message: 'Utilisateur introuvable' });
      }

      await dbRun('UPDATE users SET name = ? WHERE name = ?', [edit, username]);

      return reply.send({ message: `Username mis à jour avec succès en "${edit}"` });

    } catch (err) {
      fastify.log.error('Erreur SQL :', err);
      return reply.code(500).send({ message: 'Erreur serveur' });
    }
  });
};


// const sqlite3 = require('sqlite3').verbose();

// module.exports = async function (fastify, opts) {
//   const db = fastify.db || new sqlite3.Database('/data/data.db');

//   console.log('gogogog');
//   fastify.patch('/user-management/change-user', async (request, reply) => {
//     const { username, edit } = request.body;

//     if (!username || !edit) {
//       return reply.code(400).send({ message: 'Champs requis manquants' });
//     }

//     db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
//       if (err) {
//         fastify.log.error('Erreur SELECT :', err);
//         return reply.code(500).send({ message: 'Erreur serveur' });
//       }

//       if (!row) {
//         return reply.code(404).send({ message: 'Utilisateur introuvable' });
//       }

//       db.run('UPDATE users SET username = ? WHERE username = ?', [edit, username], function (err) {
//         if (err) {
//           fastify.log.error('Erreur UPDATE :', err);
//           return reply.code(500).send({ message: 'Erreur lors de la mise à jour du username' });
//         }

//         // ✅ Seul endroit où on envoie la réponse finale
//         reply.send({ message: `Username mis à jour avec succès en "${edit}"` });
//       });
//     });
//   });
// };


// const sqlite3 = require('sqlite3').verbose();

// module.exports = async function (fastify, opts) {
//   const db = fastify.db || new sqlite3.Database('/data/data.db');

//   console.log('gogogog');
//   fastify.patch('/user-management/change-user', async (request, reply) => {
//   const { username, edit } = request.body;

//   if (!username || !edit) {
//     return reply.code(400).send({ message: 'Champs requis manquants' });
//   }

//   // Vérifie que l’utilisateur existe
//   db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
//     if (err) {
//       fastify.log.error('Erreur SELECT :', err);
//       return reply.code(500).send({ message: 'Erreur serveur' });
//     }

//     if (!row) {
//       return reply.code(404).send({ message: 'Utilisateur introuvable' });
//     }

//     // Mise à jour du username
//     db.run('UPDATE users SET username = ? WHERE username = ?', [edit, username], function (err) {
//       if (err) {
//         fastify.log.error('Erreur UPDATE :', err);
//         return reply.code(500).send({ message: 'Erreur lors de la mise à jour du username' });
//       }

//       // ✅ IMPORTANT : on utilise *return* pour éviter les réponses multiples
//       return reply.send({ message: `Username mis à jour avec succès en "${edit}"` });
//     });
//   });
// });
//   fastify.patch('/user-management/change-user', async (request, reply) => {
//     const { username, edit } = request.body;

//     if (!username || !edit) {
//       return reply.code(400).send({ message: 'Champs requis manquants' });
//     }

//     // Vérifie que l’utilisateur existe
//     db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
//       if (err) {
//         fastify.log.error('Erreur SELECT :', err);
//         return reply.code(500).send({ message: 'Erreur serveur' });
//       }

//       if (!row) {
//         return reply.code(404).send({ message: 'Utilisateur introuvable' });
//       }

//       // Mise à jour du username
//       db.run('UPDATE users SET username = ? WHERE username = ?', [edit, username], function (err) {
//         if (err) {
//           fastify.log.error('Erreur UPDATE :', err);
//           return reply.code(500).send({ message: 'Erreur lors de la mise à jour du username' });
//         }

//         return reply.send({ message: `Username mis à jour avec succès en "${edit}"` });
//       });
//     });
//   });
// };