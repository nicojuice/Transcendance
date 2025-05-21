FROM alpine:latest

RUN apk update && apk add sqlite

WORKDIR /db/

COPY . .

RUN echo "DB conteneur is running"

RUN sqlite3
RUN chmod +x /db/create_db.sh

VOLUME ["/data"]

CMD ["sh", "-c", "/db/create_db.sh"]
