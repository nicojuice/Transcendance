const sqlite3 = require('sqlite3').verbose();
const crypto = require("crypto");
const nodemailer = require("nodemailer");
require('dotenv').config();
const jwt = require('jsonwebtoken');

module.exports = async function (fastify, opts) {
	const db = fastify.db || new sqlite3.Database('/data/data.db');

	fastify.post('/verify-2fa', { preHandler: [fastify.authenticate] }, async (req, reply) => {
		const { username, code } = req.body;

		if (!username || !code)
			return (reply.status(400).send({ error: 'Missing fields' }));

		try {
			const user = await new Promise((resolve, reject) => {
			db.get("SELECT id FROM users WHERE name = ?", [username], (err, row) => {
				if (err) return reject(err);
				if (!row) return resolve(null);
				resolve(row);
				});
			});
			if (!user)
				return reply.status(404).send({ error: 'User not found' });
			const otpEntry = await new Promise((resolve, reject) => {
				db.get(
					"SELECT code, expires FROM otp_codes WHERE user_id = ?",
					[user.id],
					(err, row) => {
						if (err) return reject(err);
						resolve(row);
					}
				);
			});
			if (!otpEntry)
				return reply.status(404).send({ error: 'OTP not found' });
			const now = Date.now();
			if (otpEntry.code !== code)
				return reply.status(401).send({ error: 'Invalid OTP code' });
		
			if (now > otpEntry.expires)
				return reply.status(410).send({ error: 'OTP code expired' });

			reply.send({ success: true });
		} catch (err) {
			fastify.log.error(err);
			return reply.status(500).send({ error: 'Internal server error' });
		}
	});

	fastify.post('/send-2fa-code', { preHandler: [fastify.authenticate] }, async (req, reply) => {
		const { username } = req.body;

		const OTPcode = await crypto.randomInt(100000, 999999).toString();

			// get email
		try {
			const email = await new Promise((resolve, reject) => {
				db.get(
					"SELECT email FROM users WHERE name = ?",
					[username],
					(err, row) => {
						if (err) return reject(err);
						if (!row) return resolve(null);
						resolve(row.email);
					}
				);
			});
			if (email === null)
				return reply.code(404).send({ error: "email not found" });

			const transporter = nodemailer.createTransport({
				service: "gmail",
				auth: {
					user: "no.reply.transcendance.42@gmail.com",
					pass: "vswp jumy czri rtzd",
				},
			});
			transporter.sendMail({
				from: '"Security" <no.reply.transcendance.42@gmail.com>',
				to: email,
				subject: "Votre code 2FA",
				text: `Voici votre code de vérification : ${OTPcode}`,
			});
				// mettre le code dans la database
			const user = await new Promise((resolve, reject) => {
				db.get("SELECT id FROM users WHERE name = ?", [username], (err, row) => {
					if (err) return reject(err);
					if (!row) return resolve(null);
					resolve(row);
					});
			});
			const otpEntry = await new Promise((resolve, reject) => {
				db.run(
					`INSERT INTO otp_codes (user_id, code, expires)
					VALUES (?, ?, ?)
					ON CONFLICT(user_id) DO UPDATE SET code = excluded.code, expires = excluded.expires`,
					[user.id, OTPcode, Date.now() + 5 * 60 * 1000],
					function (err) {
						if (err) {
							return (reject(err));
						}
						resolve(this.lastID);
					}
				);
			});
			//const otpEntry = await new Promise((resolve, reject) => {
			//	db.run(
			//		"UPDATE otp_codes SET code = ?, expires = ? WHERE user_id = ?",
			//		[OTPcode, Date.now() + 5 * 60 * 1000, user.id],
			//		function (err) {
			//			if (err) {
			//				return (reject(err));
			//			}
			//			resolve(this.lastID);
			//		}
			//	);
			//});
			return (reply.send({ message: "2FA activée avec succès!" }));
		}  catch (err) {
			fastify.log.error(err);
			return (reply.status(500).send({ error: "Db error" }));
		}
	});

	fastify.post('/active-2fa', { preHandler: [fastify.authenticate] }, (req, reply) => {
		const { username } = req.body;

		if (!username)
			return (reply.status(400).send({ error: 'Missing fields' }));
		db.run(
        	'UPDATE users SET enabled_fa = ? WHERE name = ?',
        	["true", username],
        	function (err) {
        	  if (err) {
        	    fastify.log.error('Erreur DB :', err);
        	    return reply.code(500).send({ message: 'Erreur serveur' });
        	  }
        	  return reply.send({ message: '2FA activee avec success!', id: this.lastID });
        	}
     	);
	});

	fastify.get('/is-2fa-active/:username', { preHandler: [fastify.authenticate] }, async (req, reply) => {
		const username = req.params.username;

		try {
			const enabled_2fa = await new Promise((resolve, reject) => {
				db.get(
					"SELECT enabled_fa FROM users WHERE name = ?",
					[username],
					(err, row) => {
						if (err) return reject(err);
						if (!row) return resolve(null);
						resolve(!!row.enabled_fa);
					}
				);
			});

			if (enabled_2fa === null)
				return reply.code(404).send({ error: "enabled_2fa not found" });

			reply.send({ enabled: enabled_2fa });
		} catch (err) {
			fastify.log.error(err);
			return (reply.status(500).send({ error: "Db error" }));
		}
	});
};
