apt update
apt add openssl
mkdir -p /certs
openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
       -subj "/C=FR/ST=Paris/L=Paris/O=42/CN=localhost" \
       -out  /certs/cert.crt\
       -keyout  /certs/cert.key\
 echo "🚀 Lancement du Front..."
