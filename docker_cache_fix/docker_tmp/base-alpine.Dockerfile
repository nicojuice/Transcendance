# base-alpine.Dockerfile
FROM node:20-alpine
RUN sed -i 's|dl-cdn.alpinelinux.org|mirrors.aliyun.com|g' /etc/apk/repositories && \
    apk update && apk add --no-cache sqlite

