FROM alpine:latest

RUN apk update && apk add sqlite

WORKDIR /db

RUN echo "DB conteneur is running"

RUN sqlite3

CMD ["tail", "-f", "/dev/null"] 