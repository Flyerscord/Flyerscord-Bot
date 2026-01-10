bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build --force-recreate -d

bot-clean:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all

bot-db:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build --force-recreate -d adminer

db-backup:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod exec pgbackups /backup.sh

dev-bot:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev up --build --force-recreate -d

dev-bot-clean:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down --volumes --rmi all

dev-bot-down:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down
