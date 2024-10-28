prod:
	bash -c "sed -i 's/\"productionMode\": false,/\"productionMode\": true,/' src/common/config/config.json" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-prod-bot up --build -d

np:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/common/config/config.json" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np-bot up --build -d

