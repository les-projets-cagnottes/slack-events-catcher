#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd $SCRIPTPATH
echo "$(date -u) Automatic Deploy"  >> ./console.log
./slack-events-catcher.sh stop
cd ..
npm i
./slack-events-catcher.sh start