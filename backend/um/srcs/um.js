const sqlite3 = require('sqlite3').verbose();

module.exports = async function (fastify, opts) {
	const db = fastify.db || new sqlite3.Database('/data/data.db');

		// change username
	fastify.post('/user-management/su', async (request, reply) => {
		const { username, email } = request.body;

		if (!email || !username) {
			return reply.code(400).send({ error: 'Email et username requis.' });
		}

		db.get(
			'SELECT * FROM users WHERE email = ?',
			[ email ],
			(err, row) =>
			{
				if (err)
				{
					console.error(err);
					return (reply.code(500)	.send({ error: 'Erreur SQL' }));
				}
				else if (!row)
				{
					return (reply.code(404).send({ error: 'Utilisateur non trouve... '}));
				}
				db.run(
					'UPDATE users SET name = ? WHERE email = ?',
					[ username, email ],
					(err) =>
					{
						if (err)
						{
							console.error(err);
							return (reply.code(500)	.send({ error: 'Erreur SQL' }));
						}
						return (reply.send({ success: true, updatedRows: this.changes }));
					}
				);
			}
		)}
	);




		// change password
	fastify.post('/user-management/sp', async (request, reply) => {
		const { password, email } = request.body;

		if (!email || !password) {
			return reply.code(400).send({ error: 'Email et password requis.' });
		}

		db.get(
			'SELECT * FROM users WHERE email = ?',
			[ email ],
			(err, row) =>
			{
				if (err)
				{
					console.error(err);
					return (reply.code(500)	.send({ error: 'Erreur SQL' }));
				}
				else if (!row)
				{
					return (reply.code(404).send({ error: 'Utilisateur non trouve... '}));
				}
				db.run(
					'UPDATE users SET password = ? WHERE email = ?',
					[ password, email ],
					(err) =>
					{
						if (err)
						{
							console.error(err);
							return (reply.code(500)	.send({ error: 'Erreur SQL' }));
						}
						return (reply.send({ success: true, updatedRows: this.changes }));
					}
				);
			}
		)}
	);
};
