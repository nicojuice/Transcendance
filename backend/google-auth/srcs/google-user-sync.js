const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function syncGoogleUserToDB(userData) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('/data/data.db');

    const checkUserSQL = `
      SELECT id, name FROM users 
      WHERE email = ? OR google_id = ?
    `;

    db.get(checkUserSQL, [userData.email, userData.id], (err, existingUser) => {
      if (err) {
        console.error('Erreur vérification utilisateur:', err);
        db.close();
        return reject(err);
      }

      if (existingUser) {
        const updateSQL = `
          UPDATE users SET 
            google_id = ?,
            email = ?,
            profile_picture = ?,
            is_google_user = 1
          WHERE id = ?
        `;

        db.run(updateSQL, [userData.id, userData.email, userData.picture, existingUser.id], function(err) {
          if (err) {
            console.error('Erreur mise à jour utilisateur:', err);
            db.close();
            return reject(err);
          }

          console.log('Utilisateur Google mis à jour:', existingUser.name);
          db.close();
          resolve({
            id: existingUser.id,
            username: existingUser.name,
            email: userData.email,
            isNewUser: false
          });
        });

      } else {
        // Nouvel utilisateur, le créer
        // Générer un username unique basé sur le nom Google
        let baseUsername = userData.name.replace(/\s+/g, '').toLowerCase();
        baseUsername = baseUsername.replace(/[^a-z0-9]/g, '');
        
        if (!baseUsername) {
          baseUsername = 'user';
        }

        const findUniqueUsername = (username, attempt = 0) => {
          const testUsername = attempt === 0 ? username : `${username}${attempt}`;
          
          const checkUsernameSQL = `SELECT id FROM users WHERE name = ?`;
          
          db.get(checkUsernameSQL, [testUsername], (err, existingUsername) => {
            if (err) {
              console.error('Erreur vérification username:', err);
              db.close();
              return reject(err);
            }

            if (existingUsername) {
              findUniqueUsername(baseUsername, attempt + 1);
            } else {

              const insertSQL = `
                INSERT INTO users (
                  name, email, password, avatar, enabled_fa, status, wins, all_games,
                  google_id, profile_picture, is_google_user
                ) VALUES (?, ?, '', NULL, 0, 1, 0, 0, ?, ?, 1)
              `;

              db.run(insertSQL, [testUsername, userData.email, userData.id, userData.picture], function(err) {
                if (err) {
                  console.error('Erreur création utilisateur:', err);
                  db.close();
                  return reject(err);
                }

                console.log('Nouvel utilisateur Google créé:', testUsername);
                db.close();
                resolve({
                  id: this.lastID,
                  username: testUsername,
                  email: userData.email,
                  isNewUser: true
                });
              });
            }
          });
        };

        findUniqueUsername(baseUsername);
      }
    });
  });
}

function ensureGoogleColumns() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database('/data/data.db');

    // Vérifier d'abord quelles colonnes existent
    db.all("PRAGMA table_info(users)", (err, columns) => {
      if (err) {
        db.close();
        return reject(err);
      }

      const existingColumns = columns.map(col => col.name);

      const columnsToAdd = [
        { name: 'google_id', sql: "ALTER TABLE users ADD COLUMN google_id TEXT" },
        { name: 'profile_picture', sql: "ALTER TABLE users ADD COLUMN profile_picture TEXT" },
        { name: 'is_google_user', sql: "ALTER TABLE users ADD COLUMN is_google_user INTEGER DEFAULT 0" }
      ];

      const missingColumns = columnsToAdd.filter(col => !existingColumns.includes(col.name));
      
      if (missingColumns.length === 0) {
        db.close();
        return resolve();
      }

      let completed = 0;
      const total = missingColumns.length;

      missingColumns.forEach(column => {
        db.run(column.sql, (err) => {
          if (err) {
            console.error(`Erreur ajout colonne ${column.name}:`, err);
            db.close();
            return reject(err);
          }
          completed++;
          if (completed === total) {
            db.close();
            resolve();
          }
        });
      });
    });
  });
}

module.exports = { syncGoogleUserToDB, ensureGoogleColumns };