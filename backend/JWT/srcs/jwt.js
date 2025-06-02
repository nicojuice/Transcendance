const sqlite3 = require('sqlite3').verbose();

//class User {
//	constructor({ id, name, email, avatar, enabled_fa, status })
//	{
//		this.id = id;
//		this.name = name;
//		this.email = email;
//		this.avatar = avatar;
//		this.enabled_fa = enabled_fa;
//		this.status = status;
//	}
//}

//module.exports = User;

module.exports = async function (fastify, opts) {
	const db = fastify.db || new sqlite3.Database('/data/data.db');

	fastify.post('/jwt/verify-token', async (req, reply) => {
		const { token } = req.body;

		if (!token)
			return (reply.status(400).send({ message: "Token invalide" }));
	});

	fastify.post('/jwt/get-user', async (req, reply) => {
		const { token } = req.body;

		if (!token)
			return (reply.status(400).send({ message: "Token invalide" }));

		try {
			const payload = fastify.jwt.verify(token);
			const userID = payload.id;
			if (!userID)
				return (reply.status(400).send({ error: "Payload de token invalide" }));
			const user = await new Promise((resolve, reject) => {
				db.get('SELECT * FROM users WHERE id = ?', [userID], (err, row) => {
					if (err) return (reject(err));
					resolve(row);
				});
			})
			if (!user)
				return (reply.status(404).send({ message: "User not found" }));
			return (reply.send({ user }));
		} catch (err) {
			fastify.log.error(err);
			return (reply.status(401).send({ error: "Token invalide" }));
		}
	});
};
