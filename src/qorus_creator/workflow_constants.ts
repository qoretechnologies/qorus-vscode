import { commonFields } from './common_constants';

export const workflowFields = default_target_dir => [
    ... commonFields(default_target_dir),
    {
        name: 'base_class_name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'workflow-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'workflow-base-class',
            return_value: 'objects',
        },
    },
    {
        name: 'workflow_autostart',
        type: 'number',
        mandatory: false,
        default_value: 1,
    },
    {
        name: 'sla_threshold',
        type: 'number',
        mandatory: false,
        default_value: 1800,
    },
    {
        name: 'max_instances',
        type: 'number',
        mandatory: false,
    },
    {
        name: 'attach',
        mandatory: false,
    },
    {
        name: 'detach',
        mandatory: false,
    },
    {
        name: 'onetimeinit',
        mandatory: false,
    },
    {
        name: 'error_handler',
        mandatory: false,
    },
    {
        name: 'errorfunction',
        mandatory: false,
    },
    {
        name: 'options',
        type: 'array-of-pairs',
        fields: ['key', 'value'],
        mandatory: false,
    },
    {
        name: 'key_list',
        type: 'array',
        mandatory: false,
    },
    {
        name: 'statuses',
        type: 'array-of-pairs',
        fields: ['code', 'desc'],
        mandatory: false,
    },
];

export const fake_create_data = {
    "author": [
        {
            "name": "Qore Technologies, s.r.o."
        }
    ],
    "base_class_name": "QorusWorkflow",
    "class_name": "WorkFloat",
    "classes": [
        {
            "desc": "Polls SFTP server for files and creates wf orders to process them",
            "name": "RebusSftpPoller"
        },
        {
            "desc": "CSV file iterator class with extra methods to get the current line",
            "name": "CsvFileIteratorWithLineGetter"
        }
    ],
    "desc": "asdf qwer",
    "functions": [
        {
            "desc": "Inbound Data Validation",
            "name": "uk-validation-gen-open_period"
        },
        {
            "desc": "common helper/mock functions for testing UK",
            "name": "uk-lib-test-common"
        },
        {
            "desc": "Merges received ASN quantities with their expected counterparts on expected shipments.",
            "name": "uk-qite_rcv_merge_received_asn"
        }
    ],
    "lang": "qore",
    "methods": [
        {
            "author": [
                {
                    "name": "Qore Technologies (Taras Petrychkovych)"
                }
            ],
            "desc": "gggg",
            "name": "g"
        }
    ],
    "name": "work-float",
    "target_dir": "/home/martin/src/drei/erp-quk/src/010-RECODE_ADJUSTMENT-ANOVO-IN",
    "version": "2",
    "steps": [
        'step 1:1.0',
        [
          'step 2:1.0',
          ['step 3:1.0', 'step 4:1.0']
        ],
        'step 5:1.0',
    ]
};
