#!/bin/bash

SCRIPT_DIR="$(realpath "$(dirname "${BASH_SOURCE[0]}")")"

# Change to script directory
pushd "$SCRIPT_DIR"

sudo apt install cron
sudo systemctl enable cron
sudo systemctl start cron

sudo mkdir -p /etc/cron.d
pushd /etc/cron.d

sudo echo "0 5 * * 1 root $SCRIPT_DIR/backupDBFile.sh flyerscord-discord-prod-bot-1 $HOME/backups/flyerscord-discord-prod-bot" > weekly_task
sudo chmod 644 weekly_task

popd

popd

echo "Cron job installed!"