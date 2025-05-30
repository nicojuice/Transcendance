const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'votre_client_id.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'votre_client_secret';
const REDIRECT_URI = process.env.REDIRECT_URI || 'https://localhost:8443/api/google-auth';


async function googleAuthRoutes(fastify, options) {
    
    // Route pour initier l'authentification Google
    fastify.get('/google-auth', async (request, reply) => {
        try {
            const state = generateRandomState(); // Pour la sécurité
            
            const authUrl = 'https://accounts.google.com/oauth/v2/auth?' + 
                new URLSearchParams({
                    client_id: CLIENT_ID,
                    redirect_uri: REDIRECT_URI,
                    response_type: 'code',
                    scope: 'openid email profile',
                    state: state,
                    access_type: 'offline',
                    prompt: 'consent'
                }).toString();
            
            fastify.log.info(`Redirecting to Google OAuth: ${authUrl}`);
            
            // Redirection vers Google
            return reply.redirect(authUrl);
            
        } catch (error) {
            fastify.log.error('Error initiating Google auth:', error);
            return reply.code(500).send({ 
                success: false, 
                error: 'Failed to initiate Google authentication' 
            });
        }
    });

    // Route pour traiter le callback de Google (appelée depuis le frontend)
    fastify.post('/google-auth', async (request, reply) => {
        try {
            const { code, state } = request.body;
            
            if (!code) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Authorization code is required' 
                });
            }

            // Échanger le code contre un access token
            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    code: code,
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    grant_type: 'authorization_code'
                }).toString()
            });

            const tokens = await tokenResponse.json();
            
            if (!tokenResponse.ok) {
                fastify.log.error('Token exchange failed:', tokens);
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Failed to exchange authorization code' 
                });
            }

            // Récupérer les informations utilisateur
            const userResponse = await fetch(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`);
            const userInfo = await userResponse.json();
            
            if (!userResponse.ok) {
                fastify.log.error('Failed to get user info:', userInfo);
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Failed to retrieve user information' 
                });
            }

            fastify.log.info(`Google auth successful for user: ${userInfo.email}`);

            // Ici vous pourriez sauvegarder l'utilisateur en base ou générer un JWT
            const userData = {
                google_id: userInfo.id,
                email: userInfo.email,
                name: userInfo.name,
                given_name: userInfo.given_name,
                family_name: userInfo.family_name,
                picture: userInfo.picture,
                locale: userInfo.locale,
                verified_email: userInfo.verified_email
            };

            // TODO: Sauvegarder en base de données si nécessaire
            // await saveUserToDatabase(userData);

            return reply.send({
                success: true,
                user: userData,
                message: 'Google authentication successful'
            });

        } catch (error) {
            fastify.log.error('Error processing Google callback:', error);
            return reply.code(500).send({ 
                success: false, 
                error: 'Internal server error during authentication' 
            });
        }
    });

    // Route pour vérifier un token Google (optionnel)
    fastify.post('/google-auth/verify', async (request, reply) => {
        try {
            const { id_token } = request.body;
            
            if (!id_token) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'ID token is required' 
                });
            }

            // Vérifier le token avec Google
            const verifyResponse = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${id_token}`);
            const tokenInfo = await verifyResponse.json();
            
            if (!verifyResponse.ok || tokenInfo.aud !== CLIENT_ID) {
                return reply.code(400).send({ 
                    success: false, 
                    error: 'Invalid token' 
                });
            }

            return reply.send({
                success: true,
                user: {
                    google_id: tokenInfo.sub,
                    email: tokenInfo.email,
                    name: tokenInfo.name,
                    picture: tokenInfo.picture
                }
            });

        } catch (error) {
            fastify.log.error('Error verifying Google token:', error);
            return reply.code(500).send({ 
                success: false, 
                error: 'Token verification failed' 
            });
        }
    });

    // Route de health check
    // fastify.get('/auth/health', async (request, reply) => {
    //     return reply.send({ 
    //         status: 'OK', 
    //         service: 'google-auth',
    //         timestamp: new Date().toISOString()
    //     });
    // });
}

// Fonction utilitaire pour générer un state aléatoire
function generateRandomState() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
}

// Fonction utilitaire pour sauvegarder en base (à implémenter selon vos besoins)
async function saveUserToDatabase(userData) {
    try {
        // TODO: Implémenter la logique de sauvegarde
        // Exemple avec SQLite (vous avez déjà sqlite3 importé)
        /*
        const db = new sqlite3.Database('./users.db');
        return new Promise((resolve, reject) => {
            db.run(`INSERT OR REPLACE INTO users 
                    (google_id, email, name, picture) 
                    VALUES (?, ?, ?, ?)`, 
                   [userData.google_id, userData.email, userData.name, userData.picture],
                   function(err) {
                       if (err) reject(err);
                       else resolve(this.lastID);
                   });
        });
        */
        return Promise.resolve();
    } catch (error) {
        console.error('Error saving user to database:', error);
        throw error;
    }
}

module.exports = googleAuthRoutes;
