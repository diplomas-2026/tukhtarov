#!/bin/bash
set -e

SERVER=root@45.128.205.5
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "Build tukhtarov-api..."
cd ./tukhtarov-api
./gradlew build

echo "Copy jar to release..."
mkdir -p release
cp ./build/libs/tukhtarov-api-0.0.1-SNAPSHOT.jar ./release/tukhtarov-api-0.0.1-SNAPSHOT.jar

cd ..

echo "Build web..."
cd ./web
npm run build
cd ..

echo "Git commit and push..."
git add .
git commit -m "update $TIMESTAMP" || echo "Nothing to commit"
git push

echo "Deploy backend on server..."
ssh $SERVER '
  set -e
  cd /opt/tukhtarov
  git pull
  cd /opt
  docker compose up tukhtarov-api -d --build
'

echo "Deploy frontend..."
ssh $SERVER 'mkdir -p /var/www/projects/tukhtarov.danbel.ru'
scp -r ./web/build/* $SERVER:/var/www/projects/tukhtarov.danbel.ru/

echo "Done"
