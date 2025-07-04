const sqlite3 = require('sqlite3').verbose();
require('dotenv').config();

function runAsync(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve(this);
    });
  });
}

function getAsync(db, sql, params) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

module.exports = async function (fastify, opts) {
  const db = fastify.db || new sqlite3.Database('/data/data.db');

  fastify.patch('/backend/add-avatar', async (request, reply) => {
    const parts = await request.parts();
    let username, avatarBuffer;

    for await (const part of parts) {
      if (part.type === 'file' && part.fieldname === 'avatar') {
        const chunks = [];
        for await (const chunk of part.file) chunks.push(chunk);
        avatarBuffer = Buffer.concat(chunks);
      }
      if (part.type === 'field' && part.fieldname === 'username') {
        username = part.value;
      }
    }

    if (!avatarBuffer)
      return reply.code(400).send({ error: "Missing avatar" });
    if (!username)
      return reply.code(400).send({ error: "Missing username" });

    try {
      await runAsync(db, "UPDATE users SET avatar = ? WHERE name = ?", [avatarBuffer, username]);
      reply.send({ success: true, message: "Avatar updated" });
    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: "Database error" });
    }
  });

  fastify.get('/backend/get-avatar/:username', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const username = request.params.username;

    if (!username)
      return reply.code(400).send({ error: "Missing username" });

    try {
      const row = await getAsync(db, "SELECT avatar FROM users WHERE name = ?", [username]);

      if (!row || !row.avatar)
        return reply.code(404).send({ error: "Avatar not found" });

      reply
        .header('Content-Type', 'image/png')
        .send(row.avatar);

    } catch (err) {
      fastify.log.error(err);
      reply.code(500).send({ error: "Database error" });
    }
  });
};
