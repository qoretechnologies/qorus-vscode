export const project_template = {
    "name": "",
    "description": "",
    "wiki": "",
    "issue_tracker": "",
    "qorus_instances": {
        "local": [
            {
                "url": "http://localhost:8001",
                "name": "local Qorus instance",
                "custom_urls": []
            }
        ],
        "dev": [
            {
                "version": "3.1.1",
                "url": "https://213.94.68.237:10580",
                "name": "dev 1",
                "custom_urls": [
                    {
                        "url": "sftp://erp_gsi_uk_scm@sftp-t.drei.at/dev",
                        "name": "sftp-scm"
                    },
                    {
                        "url": "sftp://erp_gsi_uk_finance@sftp-t.drei.at/dev",
                        "name": "sftp-finance"
                    }
                ]
            },
            {
                "url": "https://213.94.68.237:10591",
                "name": "dev 2",
                "custom_urls": [
                    {
                        "url": "sftp://erp_gsi_uk_hr@sftp-t.drei.at/dev",
                        "name": "sftp-hr"
                    }
                ]
            }
        ],
        "test": [
            {
                "url": "http://1.2.3.4:5678",
                "name": "test 1",
            },
            {
                "url": "http://2.3.4.5:6789",
                "name": "test 2",
            }
        ],
        "prod": [
            {
                "url": "http://255.254.253.252:9876",
                "name": "prod",
            }
        ]
    }
};
