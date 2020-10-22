#!/bin/bash

master_wfs="CETIN-PROGRAM CETIN-PORTFOLIO CETIN-PROJECT CETIN-SUBPROJECT"

# create special activate customer wf with customer details
qrest post workflows/CETIN-PROGRAM/createOrder 'staticdata={name="Test Program"}'

for wf in $master_wfs; do
    qrest post workflows/$wf/createOrder staticdata='(a=a)'
done