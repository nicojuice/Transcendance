const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fastifyJwt = require("@fastify/jwt");
const { promisify } = require("util");

const dbPath = path.resolve(__dirname, "/data/data.db");
require("dotenv").config();

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("❌ Erreur de connexion à la base de données :", err.message);
  } else {
    console.log("📦 Connecté à la base SQLite");
  }
});

const dbGet = promisify(db.get.bind(db));

module.exports = async function profileRoutes(fastify, options) {
  fastify.get(
    "/user-management/profile-info",
    { preHandler: [fastify.authenticate] },
    async (request, reply) => {
      try {
        const user = await dbGet(
          request.user.google_id
            ? "SELECT * FROM users WHERE google_id = ?"
            : "SELECT * FROM users WHERE id = ?",
          request.user.google_id || request.user.id
        );

        if (!user) {
          return reply.status(404).send({ error: "User not found" });
        }

        return {
          username: user.name,
          email: user.email,
        };
      } catch (err) {
        request.log.error(err);
        return reply.status(500).send({ error: "Erreur serveur" });
      }
    }
  );
};
