FROM node:23-slim

WORKDIR /usr/src/app

RUN npm install -g typescript

COPY package*.json ./
RUN npm install

COPY . .

RUN tsc
RUN npm run build:css
RUN npm run build

EXPOSE 8443

CMD ["npx", "vite", "preview", "--port", "8443", "--host"]
