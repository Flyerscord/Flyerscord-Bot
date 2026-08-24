bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --pull always --force-recreate -d bot migrate

bot-full:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --pull always --force-recreate -d

bot-db:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --force-recreate -d adminer

db-backup:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod exec pgbackups /backup.sh

config:
	docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:set

config-view:
	docker exec -it flyerscord-discord-prod-bot-1 pnpm run config:view

# Shared dev infra (postgres/pgbouncer/adminer). Run this once from the
# worktree you use as the main checkout; every worktree's bot runs on the
# host (pnpm run start:dev) against this same stack via DATABASE_URL_POOLED.
dev-infra:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev up --force-recreate -d

dev-infra-clean:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down --volumes --rmi all

dev-infra-down:
	docker compose -f docker-compose-dev.yml -p flyerscord-discord-dev down

dev-config:
	pnpm run config:set

dev-config-view:
	pnpm run config:view
