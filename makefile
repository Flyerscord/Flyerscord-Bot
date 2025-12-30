bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build --force-recreate -d

bot-clean:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all

bot-db:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build --force-recreate -d adminer

dev-bot:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev up --build --force-recreate -d

dev-bot-clean:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down --volumes --rmi all

dev-bot-tools:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev --profile tools up --build --force-recreate -d