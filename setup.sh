#!/bin/bash
set -e


echo "[DEBUG] Updating apt package lists..."
sudo apt update 
echo "[DEBUG] Upgrading packages..."
sudo apt upgrade -y 
echo "[DEBUG] Installing dependencies..."
sudo apt install -y git curl python3-pip python3-venv ca-certificates gnupg lsb-release
echo "[DEBUG] Installing Docker..."
curl -fsSL https://get.docker.com | sudo sh
echo "[DEBUG] Adding user to docker group..."
sudo usermod -aG docker $USER
echo "[DEBUG] Installing docker-compose..."
sudo pip3 install docker-compose

# docker kill $(docker ps -q)

# Delete all stopped containers
# docker rm $(docker ps -a -q)

# Delete all images
# docker rmi $(docker images -q)

# Remove unused data
# docker system prune

# And some more
# docker system prune -af


echo "[DEBUG] Cleaning up old GhostNet directory..."
cd ~
sudo rm -rf GhostNet 2>/dev/null 
cd ~
echo "[DEBUG] Cloning GhostNet repository..."
git clone --branch main https://github.com/Revenberg/GhostNet.git


echo "[DEBUG] Stopping any running GhostNet Docker containers..."
cd ~/GhostNet/docker
docker compose down


echo "[DEBUG] Copying update.sh to home directory..."
cd ~/GhostNet
cp update.sh ~/update.sh
chmod +x ~/update.sh


echo "[DEBUG] Detecting USB device..."
TTY_DEV=$(ls /dev/ttyUSB* | head -n 1 || echo "/dev/ttyUSB0")
echo "TTY_DEVICE=$TTY_DEV" > .env

# Haal het IP-adres van de host op

echo "[DEBUG] Detecting host IP address..."
HOST_IP=$(hostname -I | awk '{print $1}')

# Vervang <HOST_IP> in index.html door het werkelijke IP-adres
#sed -i "s/<HOST_IP>/$HOST_IP/g" docker/webserver/index.html

# cd docker && docker compose up -d --build --remove-orphans

echo "[DEBUG] Starting Docker Compose build and up..."
cd docker && docker compose up --build --remove-orphans
echo "✅ Installatie voltooid"

