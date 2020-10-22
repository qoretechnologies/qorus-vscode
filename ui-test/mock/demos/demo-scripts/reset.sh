#!/bin/bash

if [ "$1" = "-x" ]; then
    echo deleting interfaces
    oload -Xworkflow:ERP-ORDERS-TO-CRM:1.0 -Xjob:erp-orders-to-crm:1.0 -lvR
else
    echo deleting ERP-ORDERS-TO-CRM orders
    oload -Xwfinstances:ERP-ORDERS-TO-CRM:1.0 -lvR
fi

if [ "$1" = "-a" ]; then
    echo resetting job db-orders-to-erp pstate
    qrest put jobs/db-orders-to-erp/setPersistentStateData value=
fi

echo resetting job erp-orders-to-crm pstate
qrest put jobs/erp-orders-to-crm/setPersistentStateData value=

echo deleting draft orders in salesforce
qdp sfrests-demo/Order delete Status=draft
