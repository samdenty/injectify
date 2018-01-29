#!/bin/bash
set -e

echo "Tarring build files"
tar -C ~ -zcvf injectify.tar.gz injectify

echo "Cleaning remote tar"
ssh injectify@ssh.samdd.me "rm -f injectify.tar.gz"
echo "Moving tar to server"
scp injectify.tar.gz injectify@ssh.samdd.me:./

echo "Deploying to server"
ssh injectify@ssh.samdd.me "yarn run deploy:tar"