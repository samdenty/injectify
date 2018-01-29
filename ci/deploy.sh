#!/bin/bash
set -e

echo -e "\e[35m[deploy.sh]\e[0m \e[93mTarring build files\e[0m"
tar -C ~ -zcvf ~/injectify.tar.gz injectify

echo -e "\e[35m[deploy.sh]\e[0m \e[93mCleaning remote tar\e[0m"
ssh injectify@ssh.samdd.me "rm -f injectify.tar.gz"
echo -e "\e[35m[deploy.sh]\e[0m \e[93mUploading tar to server\e[0m"
scp ~/injectify.tar.gz injectify@ssh.samdd.me:./

echo -e "\e[35m[deploy.sh]\e[0m \e[93mRunning deploy script on server\e[0m"
ssh injectify@ssh.samdd.me "yarn run deploy:tar"