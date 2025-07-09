const fetch = require('node-fetch');
const querystring = require('querystring');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { syncGoogleUserToDB, ensureGoogleColumns } = require('./google-user-sync');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI;

async function routes(fastify, options) {
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !REDIRECT_URI) {
    console.error('Variables d\'environnement manquantes');
    throw new Error('Google OAuth credentials not configured');
  }
  try {
    await ensureGoogleColumns();
    console.log('Colonnes Google vérifiées dans la DB');
  } catch (err) {
    console.error('Erreur initialisation DB:', err);
  }

  console.log('OAuth Config:', {
    client_id: GOOGLE_CLIENT_ID ? 'SET' : 'MISSING',
    client_secret: GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING',
    redirect_uri: REDIRECT_URI
  });

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
    console.log('Redirection vers Google:', url);
    reply.redirect(url);
  });

  fastify.get('/auth/google/callback', async (request, reply) => {
    const { code, error } = request.query;

    if (error) {
      console.error('Erreur OAuth:', error);
      return reply.redirect(`http://localhost:8081/api/backend/login`);
    }

    if (!code) {
      console.log('No code provided');
      return reply.redirect('http://localhost:8081/api/backend/login');
    }

    try {
      console.log('Échange du code contre un token...');

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
        console.error('Erreur token response:', tokenData);
        return reply.redirect(`http://localhost:8081/api/backend/login`);
      }

      if (!tokenData.access_token) {
        console.error('Pas de access_token:', tokenData);
        return reply.redirect('http://localhost:8081/api/backend/login');
      }

      console.log('Token obtenu, récupération des infos utilisateur...');

      const userRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      const userData = await userRes.json();

      if (!userRes.ok) {
        console.error('Erreur user data:', userData);
        return reply.redirect('http://localhost:8081/api/backend/login');
      }

      console.log('Utilisateur connecté:', userData.email);

      const JWT_SECRET = process.env.JWT_SECRET;
      if (!JWT_SECRET) {
        console.error('JWT_SECRET not configured');
        return reply.redirect('http://localhost:8081/api/backend/login');
      }

      try {
        const dbUser = await syncGoogleUserToDB(userData);
        console.log('Utilisateur synchronisé avec la DB:', dbUser);

        const customToken = fastify.jwt.sign(
          { 
            id: dbUser.id,
            username: dbUser.username,
            email: dbUser.email, 
            name: userData.name,
            google_id: userData.id,
            picture: userData.picture,
            isNewUser: dbUser.isNewUser
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );

        const redirectUrl = `https://localhost:8443/auth-success?user=${encodeURIComponent(dbUser.username)}&token=${customToken}`;
        console.log('Redirecting to:', redirectUrl);
        return reply.redirect(redirectUrl);

      } catch (dbError) {
        console.error('Erreur synchronisation DB:', dbError);
        // Fallback: créer le JWT sans sync DB
        const customToken = fastify.jwt.sign(
          { 
            email: userData.email, 
            name: userData.name,
            google_id: userData.id,
            picture: userData.picture
          },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        
        const redirectUrl = `https://localhost:8443/auth-success?user=${encodeURIComponent(userData.name)}&token=${customToken}`;
        return reply.redirect(redirectUrl);
      }

    } catch (err) {
      console.error('Erreur OAuth2:', err);
      return reply.redirect('http://localhost:8081/api/backend/login');
    }
  });

  fastify.get('/auth/verify', { preHandler: [fastify.authenticate] }, async (request, reply) => {
    const authHeader = request.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ valid: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    
    try {
      const JWT_SECRET = process.env.JWT_SECRET;
      const decoded = fastify.jwt.verify(token, JWT_SECRET);
      
      return reply.send({ 
        valid: true, 
        user: {
          id: decoded.id,
          username: decoded.username, 
          email: decoded.email,
          name: decoded.name,
          google_id: decoded.google_id,
          picture: decoded.picture
        }
      });
    } catch (err) {
      console.error('Token verification failed:', err.message);
      return reply.status(401).send({ valid: false, message: 'Invalid token' });
    }
  });
}

module.exports = routes;