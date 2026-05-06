#!/bin/bash
set -e

TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "Build tukhtarov-api..."
cd ./tukhtarov-api
./gradlew build

echo "Copy jar to release..."
mkdir -p release
cp ./build/libs/tukhtarov-api-0.0.1-SNAPSHOT.jar ./release/app.jar

cd ..

echo "Git commit and push..."
git add .
git commit -m "update $TIMESTAMP" || echo "Nothing to commit"
git push

echo "Deploy on server..."
ssh root@45.128.205.5 '
  set -e
  cd /opt/tukhtarov
  git pull
  cd /opt
  docker compose up tukhtarov-api -d --build
'

echo "Done"
