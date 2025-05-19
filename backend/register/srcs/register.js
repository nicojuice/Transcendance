 const bcrypt = require('bcryptjs');
 const sqlite3 = require('sqlite3').verbose();

 module.exports = async function (fastify, opts) {
   const db = fastify.db || new sqlite3.Database('/data/data.db');

   // Endpoint de test
   fastify.get('/api/ping', async (request, reply) => {
     return { message: 'pong' };
   });

  fastify.patch('/backend/avatar', async (request, reply) => {
    const { username, avatar } = request.body;

    if (!avatar)
      return (reply.code(400).send({ error: "Missing avatar in body" }));
    try {
      await fastify.db.run(
        "UPDATE users SET avatar = ? WHERE name = ?",
        [avatar, username]
      );
      return (reply.send({ success: true, message: "Avatar updated" }));
    } catch (err) {
      fastify.log.error(err);
      return (reply.code(500).send({ error: "Database error" }));
    }
  });

   // Route d'inscription
  fastify.post('/backend/register', (request, reply) => {
    const { username, email, password } = request.body;

    if (!username || !email || !password) {
      return reply.code(400).send({ message: 'Champs manquants' });
    }

    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        fastify.log.error('Erreur de hash :', err);
        return reply.code(500).send({ message: 'Erreur serveur' });
      }

      db.run(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword],
        function (err) {
          if (err) {
            fastify.log.error('Erreur DB :', err);
            return reply.code(500).send({ message: 'Erreur serveur' });
          }
          return reply.send({ message: 'Utilisateur enregistré avec succès', id: this.lastID });
        }
      );
    });
  });
};


//const bcrypt = require('bcryptjs');
//const sqlite3 = require('sqlite3').verbose();
//const fs = require('fs');
//const path = require('path');

//module.exports = async function (fastify, opts) {
//  const db = fastify.db || new sqlite3.Database('/data/data.db');

//  // Plugin multipart pour gérer les fichiers
//  await fastify.register(require('@fastify/multipart'));

//  // Endpoint de test
//  fastify.get('/api/ping', async (request, reply) => {
//    return { message: 'pong' };
//  });

//  fastify.patch('/backend/avatar/:username', async (request, reply) => {
//    const { username } = request.params;
//    const { avatar } = request.body;

//    if (!avatar)
//      return (reply.code(400).send({ error: "Missing avatar in body" }));
//    try {
//      await fastify.db.run(
//        "UPDATE users SET avatar = ? WHERE name = ?",
//        [avatar, username]
//      );
//      return (reply.send({ success: true, message: "Avatar updated" }));
//    } catch (err) {
//      fastify.log.error(err);
//      return (reply.code(500).send({ error: "Database error" }));
//    }
//  });

//  // Route d'inscription avec avatar
//  fastify.post('/backend/register', async (request, reply) => {
//    const parts = await request.parts();

//    let username = '';
//    let email = '';
//    let password = '';
//    let avatarFile = null;

//    for await (const part of parts) {
//      if (part.type === 'file' && part.fieldname === 'avatar') {
//        avatarFile = part;
//      } else if (part.type === 'field') {
//        if (part.fieldname === 'username') username = part.value;
//        if (part.fieldname === 'email') email = part.value;
//        if (part.fieldname === 'password') password = part.value;
//      }
//    }

//    if (!username || !email || !password || !avatarFile) {
//      return reply.code(400).send({ message: 'Champs requis manquants' });
//    }

//    // Enregistrement de l’image PNG
//    const uploadsDir = path.join(__dirname, '..', 'uploads');
//    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

//    const fileName = `${Date.now()}-${avatarFile.filename}`;
//    const filePath = path.join(uploadsDir, fileName);

//    await fs.promises.writeFile(filePath, await avatarFile.toBuffer());

//    // Hash du mot de passe
//    bcrypt.hash(password, 10, (err, hashedPassword) => {
//      if (err) {
//        fastify.log.error('Erreur de hash :', err);
//        return reply.code(500).send({ message: 'Erreur serveur' });
//      }

//      db.run(
//        'INSERT INTO users (name, email, password, avatar) VALUES (?, ?, ?, ?)',
//        [username, email, hashedPassword, fileName],
//        function (err) {
//          if (err) {
//            fastify.log.error('Erreur DB :', err);
//            return reply.code(500).send({ message: 'Erreur serveur' });
//          }
//          return reply.send({ message: 'Utilisateur enregistré avec succès', id: this.lastID });
//        }
//      );
//    });
//  });
//};