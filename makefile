docker:
	bash -c "sed -i 's/\"testMode\": true,/\"testMode\": false,/' config.json" \
	docker-compose -f docker-compose.yml -p nhl-helper-discord down && \
	docker-compose -f docker-compose.yml -p nhl-helper-discord up --build -d

test-docker:
	bash -c "sed -i 's/\"testMode\": false,/\"testMode\": true,/' config.json" \
	docker-compose -f docker-compose.yml -p test-nhl-helper-discord down && \
	docker-compose -f docker-compose.yml -p test-nhl-helper-discord up --build -d

enable-test:
	bash -c "sed -i 's/\"testMode\": false,/\"testMode\": true,/' config.json"

disable-test:
	bash -c "sed -i 's/\"testMode\": true,/\"testMode\": false,/' config.json"