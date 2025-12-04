#!/bin/bash

PB_VERSION="0.34.1"
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m | sed 's/x86_64/amd64/' | sed 's/aarch64/arm64/')

PB_URL="https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"
PB_ZIP="pocketbase_${PB_VERSION}_${OS}_${ARCH}.zip"

# Download pocketbase
wget -O "${PB_ZIP}" "${PB_URL}"
unzip "${PB_ZIP}" -d ./pb_temp
rm "${PB_ZIP}"
mv ./pb_temp/pocketbase ./pocketbase.bin
rm -rf ./pb_temp