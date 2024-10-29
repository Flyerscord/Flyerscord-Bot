prod:
	bash -c "sed -i 's/\"productionMode\": false,/\"productionMode\": true,/' src/common/config/configFile.js" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-prod-bot up --build -d

np:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/common/config/configFile.js" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np-bot up --build -d

np-clean:
	bash -c "sed -i 's/\"productionMode\": true,/\"productionMode\": false,/' src/common/config/configFile.js" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np-bot down --volumes --rmi all && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np-bot up --build -d

