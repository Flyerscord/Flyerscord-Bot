docker:
	bash -c "sed -i 's/\"productionMode\": false,/\"productionMode\": true,/' src/config/config.json" && \
	docker-compose -f docker-compose.yml -p discord-bot up --build -d

docker-dev:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/config/config.json" && \
	docker-compose -f dev-docker-compose.yml -p dev-discord-bot up --build -d

docker-dev2:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/config/config.json" && \
	docker-compose -f dev-docker-compose.yml -p dev-discord-bot down && \
	docker-compose -f dev-docker-compose.yml -p dev-discord-bot up --build -d