#!/bin/bash

# SSH settings
HOST="213.230.125.34"
PORT="15211"
USER="sysadmin2"

# Paths on server
FRONTEND_DIR="/home/sysadmin2/savollar/frontend"
COMPOSE_DIR="/home/sysadmin2/savollar"
COMPOSE_FILE="docker-compose.frontend.yml"

echo "Starting deployment..."

ssh -p $PORT $USER@$HOST "
    echo 'Pulling latest changes...'
    cd $FRONTEND_DIR && git pull

    echo 'Rebuilding Docker containers...'
    cd $COMPOSE_DIR && docker compose -f $COMPOSE_FILE down && docker compose -f $COMPOSE_FILE up -d --build

    echo 'Deployment completed.'
"

echo "Done!"
