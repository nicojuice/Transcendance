FROM hoosin/alpine-nginx-nodejs:latest

WORKDIR /usr/src/app/frontend

COPY ./conf/nginx.conf /etc/nginx/nginx.conf
COPY . .

RUN chmod 777 /usr/src/app/frontend/script/setupstatic.sh

EXPOSE 8443

RUN sh ./script/setupstatic.sh
RUN npm install
RUN npm run build:css
RUN npm run build
CMD ["nginx", "-g", "daemon off;"]