#!/bin/bash

TAG_NAME=$1
DEPLOY_LOCATION="$( cd "$(dirname "$0")" ; pwd -P )"/..
FINAL_LOCATION=/opt/les-projets-cagnottes/core

echo "$(date -u) Automatic Deploy"  >> ./console.log

sudo service les-projets-cagnottes-slack stop
sleep 1

mkdir -p ${FINAL_LOCATION}/${TAG_NAME}
sudo cp ${DEPLOY_LOCATION}/bin/les-projets-cagnottes-slack.service /etc/systemd/system/les-projets-cagnottes-slack.service
cp ${DEPLOY_LOCATION}/bin/setenv.sh.template ${FINAL_LOCATION}/setenv.template
cp ${DEPLOY_LOCATION}/bin/les-projets-cagnottes-slack.sh ${FINAL_LOCATION}/les-projets-cagnottes-slack.sh
cp -R ${DEPLOY_LOCATION} ${FINAL_LOCATION}/${TAG_NAME}

sudo systemctl daemon-reload
sudo service les-projets-cagnottes-slack start

exit 0
