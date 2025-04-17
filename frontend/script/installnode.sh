apt update
echo "🛠 Install Nodejs..."
apt install -y nodejs npm
echo "🛠 Install TypeScript..."
npm install typescript
echo "🛠 Compilation TypeScript → JavaScript..."
npx tsc