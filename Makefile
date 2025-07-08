all: up

detach:
	docker compose up --build -d

up:
	docker compose up --build

down:
	docker compose down -v

list:
	docker compose ps -a
	docker ps -a

kill_sleepy:
	docker rm -f $(docker ps -aq)

prune:
	docker compose down -v
	docker system prune -af

re: down up

.PHONY: all detach up down kill_sleepy list prune re
