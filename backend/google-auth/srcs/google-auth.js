const fetch = require('node-fetch');
const querystring = require('querystring');
require('dotenv').config();


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

async function routes(fastify, options) {
    // Step 1: Redirection vers Google OAuth
    fastify.get('/auth/google', async (request, reply) => {
        const params = {
            client_id: GOOGLE_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: 'openid email profile',
            access_type: 'offline',
            prompt: 'consent'
        };
        const url = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify(params)}`;
        reply.redirect(url);
    });

    // Step 2: Callback de Google
fastify.get('/auth/google/callback', async (request, reply) => {
  const code = request.query.code;
  if (!code) {
    return reply.status(400).send({ success: false, message: 'No code provided' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: querystring.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });
    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return reply.status(401).send({ success: false, message: 'Invalid token data' });
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const userData = await userRes.json();

    // Par exemple, créer utilisateur, générer JWT, etc.

    return reply.send({ success: true, user: userData, token: tokenData.access_token });
  } catch (err) {
    console.error('❌ Erreur OAuth2:', err);
    return reply.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});


fastify.post('/auth/google/token', async (request, reply) => {
  const { code } = request.body;

  if (!code) {
    return reply.status(400).send({ success: false, message: 'No code provided' });
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: querystring.stringify({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: REDIRECT_URI,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return reply.status(401).send({ success: false, message: 'Invalid token data' });
    }

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userRes.json();

    return reply.send({
      success: true,
      user: userData,
      token: tokenData.access_token
    });
  } catch (err) {
    console.error('❌ Erreur lors de l’échange du token Google:', err);
    return reply.status(500).send({ success: false, message: 'Internal Server Error' });
  }
});

}

module.exports = routes;