#!/bin/bash
set -e

rm -rf .deliver
mkdir .deliver
cp -R www .deliver
echo 'Deploy.sh'