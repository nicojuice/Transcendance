echo "📦 Installation des dépendances..."
npm install

echo "🛠 Compilation TypeScript → JavaScript..."
npx tsc

echo "🚀 Lancement du serveur..."
node server.js