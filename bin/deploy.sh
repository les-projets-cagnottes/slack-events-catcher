#!/bin/bash

cd $1
echo "$(date -u) Automatic Deploy"  >> ./console.log
./slack-events-catcher.sh stop
sleep 1
./slack-events-catcher.sh start