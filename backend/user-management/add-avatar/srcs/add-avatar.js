const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();

module.exports = function (fastify, opts, done) {
	fastify.patch('/backend/add-avatar', async (request, reply) => {
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

	done();
};
