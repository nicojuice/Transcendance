FROM node:23-slim

WORKDIR /usr/srcs/app

COPY package*.json ./
RUN npm install --production

COPY ./srcs ./srcs

ENV NODE_ENV=production

EXPOSE 8007

CMD ["node", "srcs/server.js"]
