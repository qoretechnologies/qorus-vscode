#!/bin/bash

# create roles
qrest post roles/superuser/clone target=cetin,desc="Cetin demo role"
qrest put roles/cetin groups=demo-cetin
qrest post roles/read-only/clone target=cetin-ro,desc="Cetin demo read-only role"
qrest put roles/cetin-ro groups=demo-cetin

# create users
qrest post users username=cetin,pass=cetin,name="Cetin demo user",roles=cetin
qrest post users username=cetin-ro,pass=cetin-ro,name="Cetin demo read-only user",roles=cetin-ro