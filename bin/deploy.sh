#!/bin/bash

SCRIPTPATH="$( cd "$(dirname "$0")" ; pwd -P )"
cd $SCRIPTPATH/..
echo "$(date -u) Automatic Deploy"  >> ./console.log
bin/slack-events-catcher.sh stop
sleep 1
bin/slack-events-catcher.sh start

exit 0