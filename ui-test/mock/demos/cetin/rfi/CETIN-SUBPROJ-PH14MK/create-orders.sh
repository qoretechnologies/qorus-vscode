#!/bin/bash

print_help() {
    echo "$0 PARENT_WFIID [ORDERS_NUMBER]"
}

if [[ $1 == "-h" ]]
then
    print_help
    exit 0
fi

if [[ $# -lt 1 ]]
then
    print_help
    echo "ERROR: Parent WFIID must be provided"
    exit 1
fi

PWFIID=$1

COUNT=$2
if [[ $# -lt 2 ]]
then
    COUNT="1"
fi


WF="CETIN-SUBPROJ-PH14MK"

for i in `seq 1 $COUNT`; do
    qrest post workflows/$WF/createOrder staticdata='(a=a)',parent_workflow_instanceid=$PWFIID
done
