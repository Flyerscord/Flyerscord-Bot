prod:
	bash -c "sed -i 's/productionMode: false,/productionMode: true,/' src/common/config/configFile.ts" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build -d

prod-clean:
	bash -c "sed -i 's/productionMode: false,/productionMode: true,/' src/common/config/configFile.ts" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all
	

np:
	bash -c "sed -i 's/productionMode: true,/productionMode: false,/' src/common/config/configFile.ts" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np up --build -d

np-clean:
	bash -c "sed -i 's/productionMode: true,/productionMode: false,/' src/common/config/configFile.ts" && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np down --volumes --rmi all && \
	docker compose -f docker-compose.yml -p flyerscord-discord-np up --build -d

