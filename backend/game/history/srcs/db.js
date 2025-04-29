const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('/data/data.db', (err) => {
  if (err) {
    console.error('❌ Erreur ouverture DB', err.message);
  } else {
    console.log('✅ Connexion à SQLite réussie');

    db.run(`
      CREATE TABLE IF NOT EXISTS matches (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        player1 TEXT,
        player2 TEXT,
        score1 INTEGER,
        score2 INTEGER,
        played_at TEXT
      )
    `, (err) => {
      if (err) {
        console.error('❌ Erreur création table', err.message);
      } else {
        console.log('✅ Table matches prête');
      }
    });
  }
});

module.exports = db;
