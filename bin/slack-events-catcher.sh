#!/bin/bash

function d_start ()
{
    echo "slack-events-catcher: starting service"
    BASEDIR=$(dirname "$0")/..
    cd "$BASEDIR" && . bin/setenv.sh && npm i && node src/index.js &
    sleep 5
}

function d_stop ()
{
    echo "slack-events-catcher: stopping service"
    ps -ef | grep node | grep -v grep | awk '{print $2}' | xargs kill -9
 }

function d_status ( )
{
    ps -ef | grep node | grep -v grep
}

case "$1" in
    start)
            d_start
            ;;
    stop)
            d_stop
            ;;
    reload)
            d_stop
            sleep 2
            d_start
            ;;
    status)
            d_status
            ;;
    * )
    echo "Usage: $0 {start | stop | reload | status}"
    exit 1
    ;;
esac

exit 0