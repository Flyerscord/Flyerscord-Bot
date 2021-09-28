docker-prod:
	docker-compose -f docker-compose.yml -p nhl-helper-discord down && \
	docker-compose -f docker-compose.yml -p nhl-helper-discord up --build -d