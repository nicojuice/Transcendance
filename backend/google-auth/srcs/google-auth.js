const fetch = require('node-fetch');
const querystring = require('querystring');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

async function routes(fastify, options) {
  // Vérification des variables d'environnement
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !REDIRECT_URI) {
    console.error('❌ Variables d\'environnement manquantes');
    throw new Error('Google OAuth credentials not configured');
  }

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
    console.log('🔄 Redirection vers Google:', url);
    reply.redirect(url);
  });

  // Step 2: Callback de Google
 // Dans votre google-auth.js, remplacez le callback GET par ceci :

fastify.get('/auth/google/callback', async (request, reply) => {
  const { code, error } = request.query;

  if (error) {
    console.error('❌ Erreur OAuth:', error);
    return reply.redirect(`http://localhost:8081/api/backend/login`);
  }

  if (!code) {
    return reply.redirect('http://localhost:8081/api/backend/login');
  }

  try {
    console.log('🔄 Échange du code contre un token...');

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

    if (!tokenRes.ok) {
      console.error('❌ Erreur token response:', tokenData);
      return reply.redirect(`http://localhost:8081/api/backend/login`);
    }

    if (!tokenData.access_token) {
      console.error('❌ Pas de access_token:', tokenData);
      return reply.redirect('http://localhost:8081/api/backend/login');
    }

    console.log('✅ Token obtenu, récupération des infos utilisateur...');

    const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userRes.json();

    if (!userRes.ok) {
      console.error('❌ Erreur user data:', userData);
      return reply.redirect('http://localhost:8081/api/backend/login');
    }

    console.log('✅ Utilisateur connecté:', userData.email);

    // Génération du JWT ici !
    const JWT_SECRET = process.env.JWT_SECRET;
    const customToken = jwt.sign(
      { email: userData.email, name: userData.name },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Redirection avec le token dans l'URL
    return reply.redirect(`http://localhost:8095/auth-success?user=${encodeURIComponent(userData.name)}&token=${customToken}`);

  } catch (err) {
    console.error('❌ Erreur OAuth2:', err);
    return reply.redirect('http://localhost:8081/api/backend/login');
  }
});


  // Step 3: Endpoint POST pour échanger le code (pour les apps mobiles/SPA)
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

      if (!tokenRes.ok || !tokenData.access_token) {
        return reply.status(401).send({ success: false, message: 'Token exchange failed', error: tokenData });
      }

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        return reply.status(401).send({ success: false, message: 'Failed to get user data' });
      }

      const JWT_SECRET = process.env.JWT_SECRET;
      const customToken = jwt.sign(
        { email: userData.email, name: userData.name },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      return reply.send({
        success: true,
        user: userData,
        token: customToken,
      });

    } catch (err) {
      console.error('❌ Erreur OAuth2:', err);
      return reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });
}

module.exports = routes;