bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build --force-recreate -d

bot-clean:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all