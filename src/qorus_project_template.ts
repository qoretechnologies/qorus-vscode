export const project_template = {
    "name": "",
    "description": "",
    "wiki": "",
    "issue_tracker": "",
    "qorus_instances": {
        "local": [
            {
                "url": "http://localhost:8001",
                "name": "main local Qorus instance",
                "custom_urls": []
            },
            {
                "url": "https://localhost:8011",
                "name": "local Qorus instance"
            }
        ],
        "dev": [
            {
                "url": "http://1.2.3.4:5678",
                "name": "dev 1",
                "custom_urls": [
                    {
                        "url": "sftp://abc@def/ghi",
                        "name": "abc"
                    },
                    {
                        "url": "sftp://xyz@uvw",
                        "name": "xyz"
                    }
                ]
            },
            {
                "url": "https://2.3.4.5:6789",
                "name": "dev 2"
            }
        ]
    }
};
