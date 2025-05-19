FROM alpine:latest

RUN apk update && apk add sqlite

WORKDIR /db

COPY . ./

RUN echo "DB conteneur is running"

RUN sqlite3

RUN chmod 777 create_db.sh

RUN sh ./create_db.sh

VOLUME ["/data"]

CMD ["tail", "-f", "/dev/null"] 