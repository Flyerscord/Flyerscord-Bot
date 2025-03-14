bot:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod up --build -d

bot-clean:
	docker compose -f docker-compose.yml -p flyerscord-discord-prod down --volumes --rmi all