FROM node:23-slim

WORKDIR /usr/srcs/app

COPY package*.json ./
RUN npm install --production

COPY ./srcs ./srcs

ENV NODE_ENV=production

EXPOSE 8002

CMD ["node", "srcs/server.js"]
