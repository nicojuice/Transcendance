# Étape 1 : build
FROM node:20-alpine AS builder
WORKDIR /app
# Copier package.json et package-lock.json
COPY package*.json ./
RUN npm install
# Copier tout le reste des fichiers du projet
COPY . .
# Compiler le projet avec Vite
RUN npm run build

# Étape 2 : nginx
FROM nginx:alpine
# Installer openssl pour générer les certificats directement dans Nginx
RUN apk update && apk add --no-cache openssl

# Créer un dossier pour les certificats
RUN mkdir -p /etc/nginx/certs

# Générer un certificat SSL auto-signé directement dans l'image Nginx
RUN openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/certs/cert.key \
    -out /etc/nginx/certs/cert.crt \
    -subj "/CN=localhost"

# Copier ta config nginx personnalisée
COPY ./conf/nginx.conf /etc/nginx/nginx.conf

# Copier le contenu du build Vite dans le dossier nginx
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8443

# Démarrer nginx
CMD ["nginx", "-g", "daemon off;"]