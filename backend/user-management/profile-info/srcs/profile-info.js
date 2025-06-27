// const path = require("path");
// const sqlite3 = require("sqlite3").verbose();
// const fastifyJwt = require("@fastify/jwt");
// const dbPath = path.resolve(__dirname, "/data/data.db");

// // Connexion SQLite
// const db = new sqlite3.Database(dbPath, (err) => {
//   if (err) {
//     console.error("❌ Erreur de connexion à la base de données :", err.message);
//   } else {
//     console.log("📦 Connecté à la base SQLite");
//   }
// });

// module.exports = async function profileRoutes(fastify, options) {
//   fastify.get(
//     "/user-management/profile-info",
//     { preHandler: [fastify.authenticate] },
//     async (request, reply) => {
//       const userId = request.user.id;

//       return new Promise((resolve, reject) => {
//         db.get(
//           `
//       SELECT 
//         id,
//         name AS username,
//         email,
//         google_id,
//         profile_picture AS picture,
//         is_google_user
//       FROM users 
//       WHERE id = ?
//       `,
//           [userId],
//           (err, row) => {
//             if (err) {
//               fastify.log.error(err);
//               reply.code(500).send({ message: "Erreur serveur" });
//               return reject(err);
//             }

//             if (!row) {
//               reply.code(404).send({ message: "Utilisateur non trouvé" });
//               return resolve();
//             }

//             reply.send(row);
//             resolve();
//           }
//         );
//       });
//     }
//   );
// };


const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fastifyJwt = require('@fastify/jwt');
const dbPath = path.resolve(__dirname, '/data/data.db');
require('dotenv').config();

// Connexion SQLite
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erreur de connexion à la base de données :', err.message);
  } else {
    console.log('📦 Connecté à la base SQLite');
  }
});

module.exports = async function profileRoutes(fastify, options) {
  fastify.get('/user-management/profile-info', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const userId = request.user.id; // ↩️ extrait depuis le token JWT

    return new Promise((resolve, reject) => {
      db.get(
        'SELECT name, email FROM users WHERE id = ?',
        [userId],
        (err, row) => {
          if (err) {
            fastify.log.error(err);
            reply.code(500).send({ message: 'Erreur serveur' });
            return reject(err);
          }

          if (!row) {
            reply.code(404).send({ message: 'Utilisateur non trouvé' });
            return resolve();
          }

          reply.send(row); // ⚠️ on ne renvoie pas le mot de passe !
          resolve();
        }
      );
    });
  });
}