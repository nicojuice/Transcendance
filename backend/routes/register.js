const fp = require('fastify-plugin');
const bcrypt = require('bcryptjs');

module.exports = async function (fastify, opts) {
  const sqlite3 = require('sqlite3').verbose();
  const db = new sqlite3.Database('/data/data.db');

  fastify.get('/ping', async (req, reply) => {
    return { message: 'pong ' };
  });

  fastify.post('/register', async (request, reply) => {
    const { username, email, password } = request.body;
    
    console.log("request body ", request.body, "\n");
    
    if (!username || !email || !password) {
      return reply.status(400).send({ message: 'Champs manquants' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    // Insertion dans la base
    const stmt = db.prepare('INSERT INTO users (name, email, password) VALUES (?, ?, ?)');
    stmt.run([username, email, hashedPassword], function (err) {
      if (err) {
        console.error('Erreur DB :', err);
        return reply.status(500).send({ message: 'Erreur serveur' });
      }

      return reply.send({ message: 'Utilisateur enregistré avec succès', id: this.lastID });
    });
  });
};
  