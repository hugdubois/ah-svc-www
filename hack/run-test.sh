#!/bin/sh

SCRIPT=$(readlink -f "$0")
SCRIPTPATH=$(dirname "$SCRIPT")
cd $SCRIPTPATH/..
make test -s 2>/dev/null | grep -v "ah_svc_www:" | grep -v -e '^$'

