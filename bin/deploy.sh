#!/bin/bash

cd $1
echo "$(date -u) Automatic Deploy"  >> ./console.log
bin/slack-events-catcher.sh stop
sleep 1
bin/slack-events-catcher.sh start