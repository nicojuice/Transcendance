all:
	docker build -f base-alpine.Dockerfile -t node:20-alpine .
	docker build -f latest-alpine.Dockerfile -t alpine:latest .
	docker build -f hoosin-alpine.Dockerfile -t hoosin/alpine-nginx-nodejs:latest .