export const types_with_version = ['step', 'mapper'];
export const types_without_version = ['service', 'job', 'workflow', 'config-item-values', 'config-items',
                               'class', 'constant', 'function', 'connection', 'event', 'group',
                               'queue', 'value-map', 'mapper-code', 'type', 'fsm'];
export const types = [...types_with_version, ...types_without_version];

export const root_service = 'QorusService';
export const root_job = 'QorusJob';
export const root_workflow = 'QorusWorkflow';
export const root_processor = 'AbstractDataProcessor';
export const root_steps = ['QorusAsyncStep', 'QorusEventStep', 'QorusNormalStep', 'QorusSubworkflowStep',
                           'QorusAsyncArrayStep', 'QorusEventArrayStep',
                           'QorusNormalArrayStep', 'QorusSubworkflowArrayStep'];
export const all_root_classes = [...root_steps, root_service, root_job, root_workflow, root_processor];

export const default_version = '1.0';

export const classToPythonModule = (class_name: string): string | undefined => {
    switch (class_name) {
        case root_service: return 'svc';
        case root_job: return 'job';
        case root_workflow: return 'wf';
        default: return root_steps.includes(class_name) ? 'wf' : undefined;
    }
};
