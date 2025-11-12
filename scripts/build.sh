#!/bin/bash

bun install
bun run build
rm -rfv ./pb_public
mkdir ./pb_public
cp -r ./dist/* ./pb_public/