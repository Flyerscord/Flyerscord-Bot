prod:
	bash -c "sed -i 's/\"productionMode\": false,/\"productionMode\": true,/' src/config/config.json" && \
	docker compose -f docker-compose.yml -p discord-prod-bot up --build -d

np:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/config/config.json" && \
	docker compose -f docker-compose.yml -p discord-np-bot up --build -d

dev:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/config/config.json" && \
	docker compose -f dev-docker-compose.yml -p discord-dev-bot up --build

