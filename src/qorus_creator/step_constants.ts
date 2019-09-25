import { classFields } from './common_constants';

export const stepFields = default_target_dir => [
    ... classFields(default_target_dir),
    {
        name: 'base-class-name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'step-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'step-base-class',
            return_value: 'objects',
        },
        on_change: 'get-config-items'
    },
    {
        name: 'config_target_dir',
        mandatory: false,
        type: 'file-string',
        default_value: default_target_dir,
        get_message: {
            action: 'creator-get-directories',
            object_type: 'target_dir',
        },
        return_message: {
            action: 'creator-return-directories',
            object_type: 'target_dir',
            return_value: 'directories',
        },
    },
    {
        name: 'config_target_file',
        mandatory: false,
    }
];
