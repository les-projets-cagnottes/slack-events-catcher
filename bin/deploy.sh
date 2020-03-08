#!/bin/bash

TAG_NAME=$1
DEPLOY_LOCATION="$( cd "$(dirname "$0")" ; pwd -P )"/..
FINAL_LOCATION=/opt/les-projets-cagnottes/slack-events-catcher

echo "$(date -u) Automatic Deploy"  >> ./console.log

sudo service les-projets-cagnottes-slack stop
sleep 1

mkdir -p ${FINAL_LOCATION}/current
sudo cp ${DEPLOY_LOCATION}/bin/les-projets-cagnottes-slack.service /etc/systemd/system/les-projets-cagnottes-slack.service
cp ${FINAL_LOCATION}/current/bin/setenv.sh ${DEPLOY_LOCATION}/bin/setenv.sh
cp -R ${DEPLOY_LOCATION} ${FINAL_LOCATION}/current

mkdir -p ${FINAL_LOCATION}/${TAG_NAME}
cp -R ${DEPLOY_LOCATION} ${FINAL_LOCATION}/${TAG_NAME}

sudo systemctl daemon-reload
sudo service les-projets-cagnottes-slack start

exit 0
