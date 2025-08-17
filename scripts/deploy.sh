#!/bin/bash

set -e

echo "Backing up current DB..."
sudo /home/matt/dockers/flyerscord/scripts/cron/backupDBFile.sh flyerscord-discord-prod-bot-1 /home/matt/backups/flyerscord-discord-prod-bot
echo "Back up complete!"

echo "Building new image and deploying..."
make bot
echo "New image built and deployed!"