#!/bin/bash

# Runs on a clean Ubuntu 24.04 install and requires root

apt update
apt install git wget unzip -y

# Install Bun
curl -fsSL https://bun.sh/install | bash
export PATH="$HOME/.bun/bin:$PATH"

bun --version

git clone https://github.com/pikapower9080/minimini
cd minimini
bun install
cp .env.template .env
chmod +x ./scripts/pb_init.sh
./scripts/pb_init.sh

cat << EOF > /etc/systemd/system/minimini.service
[Unit]
Description=Minimini PocketBase Service
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=$(pwd)
ExecStart=$(pwd)/scripts/pb_start.sh
Restart=on-failure
RestartSec=5s
Environment="PATH=$HOME/.bun/bin:$PATH"

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable minimini.service
systemctl start minimini.service