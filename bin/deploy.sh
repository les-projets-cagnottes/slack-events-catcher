#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd $SCRIPTPATH/..
echo "$(date -u) Automatic Deploy"  >> ./console.log
sudo service slack-events-catcher stop
sleep 1
sudo service slack-events-catcher start

exit 0