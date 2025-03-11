bot:
	bash -c "sed -i 's/productionMode: false,/productionMode: true,/' src/common/config/configFile.ts" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build -d

bot-clean:
	bash -c "sed -i 's/productionMode: false,/productionMode: true,/' src/common/config/configFile.ts" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all

config:
	docker compose -f docker-compose-defaultConfig.yml -p flyerscord-discord-config up --build

config-detach:
	docker compose -f docker-compose-defaultConfig.yml -p flyerscord-discord-config up --build -d