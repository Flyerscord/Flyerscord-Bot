#!/bin/bash

set -e

containerName=$1
backupLocation=$2

if [ -z "$containerName" ]; then
  echo "Container name is required"
  exit 1
fi

if [ -z "$backupLocation" ]; then
  echo "Backup location is required"
  exit 1
fi

mkdir -p $backupLocation

timestamp=$(date +"%Y-%m-%d_%H-%M-%S")
newFileName="enmap_$timestamp.sqlite"
backupPath="$backupLocation/$newFileName"

echo "Backing up database file from container $containerName to $backupPath"

echo "Stopping container $containerName"
docker stop $containerName

docker cp $containerName:/usr/src/app/data/enmap.sqlite $backupPath

echo "Starting container $containerName"
docker start $containerName

echo "Backup complete!"
