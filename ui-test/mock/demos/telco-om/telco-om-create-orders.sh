#!/bin/bash

master_wfs="TELCO-SUSPEND-CUSTOMER TELCO-RESUME-CUSTOMER TELCO-RETIRE-CUSTOMER TELCO-CHANGE-MSISDN TELCO-SIM-SWAP TELCO-CHANGE-TARIFF-ACCOUNT TELCO-MNP-PORT-IN TELCO-MNP-PORT-OUT TELCO-MNP-PORT-ACROSS TELCO-PREACTIVATION TELCO-UPDATE-ACCOUNT"

url=$1
if [ -n "$url" -a -z "`echo $url|grep api/`" ]; then
    url="${url}/api/latest"
fi

# create special activate customer wf with customer details
qrest post $url/workflows/TELCO-ACTIVATE-CUSTOMER/createOrder '(
    staticdata=(
        pos-code=1238593,
        customer=(
            data=@party-1,
            customer-category=SOHO,
            accounts=(
                type=BUSINESS,
                payment-info=@payment-1,
                account-password=@party-1,
                account-pin=@party-1,
                payment-terms=NET30,
                bill-cycle=BUSINESS-30-15,
                services=(
                    type=MOBILE-CONVERGENT,
                    tariff="Premium Business+",
                    options=(DATA+,SMS+,MMS+,VPN),
                    network-profile=FAST,
                    roaming-profile=STD-INTL0,
                    msisdn=@msisdn-1,
                    iccid=@iccid-1,
                    activation-date=2019-04-01T11:28:43,
                    service-level=BUSINESS-STANDARD+,
                )
            )
        ),
    ),
    sensitive_data=(
        tax-number=(
            A793873.234=(
                data=(
                    business_name=,
                    given_names=John,
                    family_name=Customer,
                    street_address="10 Orange Street",
                    city="London",
                    postal_code="WC2N 5DU",
                    country="UK",
                    email=john@customer.com,
                    home-tel=0149391234,
                    contact-preference=email,
                    party-password="example-password",
                    party-pin=0123,
                    credit-checked=true,
                    credit-score=850,
                ),
                aliases=party-1,
            )
        ),
        credit-card-info=(
            1234-5678-9999-9999=(
                data=(
                    type=credit-card,
                    card-type=VISA,
                    card-expiration-date=12-25,
                    CVV2=000,
                    name=John Customer,
                    billing-address="10 Orange Street, London WC2N 5DU",
                    contact-tel=0149391234,
                    contact-email=john@customer.com
                ),
                aliases=payment-1,
            )
        ),
        msisdn=(
            9012345677=(
                data={
                    type=STD,
                    provisioning-status=PREPROVISIONED
                },
                aliases=msisdn-1,
            )
        ),
        iccid=(
            131432423404094=(
                data={
                    type=STD,
                    provisioning-status=PREPROVISIONED
                },
                aliases=iccid-1
            )
        )
    )
)'

for wf in $master_wfs; do
    qrest post $url/workflows/$wf/createOrder staticdata='(a=a)'
done
