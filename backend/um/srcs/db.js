
// creer la db
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/data/data.db', (err) => {
  if (err) {
    console.error('❌ Erreur ouverture DB', err.message);
  } else {
    console.log('✅ Connexion à SQLite réussie');
    
    // initialise la db
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        password TEXT
        )
        `, (err) => {
          if (err) {
            console.error('❌ Erreur création table', err.message);
          } else {
            console.log('✅ Table users créée ou déjà existante');
          }
        });
      }
    });

module.exports = db;
