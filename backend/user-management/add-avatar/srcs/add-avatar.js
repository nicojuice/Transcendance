const sqlite3 = require('sqlite3').verbose();

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
			await db.run(
				"UPDATE users SET avatar = ? WHERE name = ?",
				[avatarBuffer, username]
			);
			reply.send({ success: true, message: "Avatar updated" });
		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: "Database error" });
		}
	});

	fastify.get('/backend/get-avatar/:username', async (request, reply) => {
		const username = request.params.username;

		if (!username)
			return reply.code(400).send({ error: "Missing username" });

		try {
			const avatarBuffer = await new Promise((resolve, reject) => {
				db.get(
					"SELECT avatar FROM users WHERE name = ?",
					[username],
					(err, row) => {
						if (err) return reject(err);
						if (!row || !row.avatar) return resolve(null);
						resolve(row.avatar);
					}
				);
			});

			if (!avatarBuffer)
				return reply.code(404).send({ error: "Avatar not found" });

			// Envoie l’image brute (content-type à ajuster selon ton usage, ici on suppose un PNG)
			reply
				.header('Content-Type', 'image/png')
				.send(avatarBuffer);

		} catch (err) {
			fastify.log.error(err);
			reply.code(500).send({ error: "Database error" });
		}
	});
};