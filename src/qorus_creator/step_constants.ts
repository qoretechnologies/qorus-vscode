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
    }
];
