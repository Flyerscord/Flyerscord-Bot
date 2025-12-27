bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build --force-recreate -d

bot-clean:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all

test-bot:
	docker compose -f docker-compose-test.yml -p flyerscord-discord-test up --build --force-recreate -d

test-bot-clean:
	docker compose -f docker-compose-test.yml -p flyerscord-discord-test down --volumes --rmi all