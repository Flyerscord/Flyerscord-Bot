bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --pull always --force-recreate -d

bot-db:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --force-recreate -d adminer

db-backup:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod exec pgbackups /backup.sh

dev-bot:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev up --build --force-recreate -d

dev-bot-bot:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev up --build --force-recreate -d bot migrate

dev-bot-db:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev up -d adminer pgbouncer

dev-bot-clean:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down --volumes --rmi all

dev-bot-down:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down
