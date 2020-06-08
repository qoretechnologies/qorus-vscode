import { QorusProjectCodeInfo} from '../QorusProjectCodeInfo';


export const mandatoryStepMethods = (code_info: QorusProjectCodeInfo, base_class, lang) => {
    let { primary, array } = stepTriggerSignatures(code_info, base_class, lang);
    if (!primary) {
        return {};
    }

    primary.body = lang === 'python' ? 'pass' : '';

    if (!array) {
        return { primary };
    }

    const array_body = {
        qore: 'return ();',
        python: 'return [];',
        java: 'return new Object[0];'
    };

    array.body = array_body[lang] || '';
    return { primary, array };
}

export const triggers = (code_info: QorusProjectCodeInfo, {iface_kind, 'base-class-name': base_class = undefined}) => {
    switch (iface_kind) {
        case 'service': return ['start', 'stop', 'init'];
        case 'job':     return ['run'];
        case 'step':    return Object.keys(stepTriggerSignatures(code_info, base_class)); // only keys: does not depend on lang
        default:        return [];
    }
}

export const stepTriggerSignatures = (code_info: QorusProjectCodeInfo, base_class, lang = 'qore') => {
    let stepTriggerSignatures: any = {};

    stepTriggerSignatures.qore = base_class => {
        switch (code_info.stepType(base_class)) {
            case 'QorusNormalStep':
                return {
                    primary: {signature: 'primary()'},
                    validation: {signature: 'string validation()'}
                };
            case 'QorusNormalArrayStep':
                return {
                    primary: {signature: 'primary(auto array_arg)', arg_names: ['array_arg']},
                    validation: {signature: 'string validation(auto array_arg)', arg_names: ['array_arg']},
                    array: {signature: 'softlist<auto> array()'}
                };
            case 'QorusEventStep':
            case 'QorusSubworkflowStep':
                return {
                    primary: {signature: 'primary()'}
                };
            case 'QorusEventArrayStep':
            case 'QorusSubworkflowArrayStep':
                return {
                    primary: {signature: 'primary(auto array_arg)', arg_names: ['array_arg']},
                    array: {signature: 'softlist<auto> array()'}
                };
            case 'QorusAsyncStep':
                return {
                    primary: {signature: 'primary()'},
                    validation: {signature: 'string validation(*string async_key)', arg_names: ['async_key']},
                    end: {signature: 'end(auto queue_data)', arg_names: ['queue_data']}
                };
            case 'QorusAsyncArrayStep':
                return {
                    primary: {signature: 'primary(auto array_arg)', arg_names: ['array_arg']},
                    validation: {signature: 'string validation(*string async_key, auto array_arg)', arg_names: ['async_key', 'array_arg']},
                    end: {signature: 'end(auto queue_data, auto array_arg)', arg_names: ['queue_data', 'array_arg']},
                    array: {signature: 'softlist<auto> array()'}
                };
            default:
                return {};
        }
    };

    stepTriggerSignatures.python = base_class => {
        switch (code_info.stepType(base_class)) {
            case 'QorusNormalStep':
                return {
                    primary: {signature: 'primary(self)'},
                    validation: {signature: 'validation(self)'}
                };
            case 'QorusNormalArrayStep':
                return {
                    primary: {signature: 'primary(self, array_arg)', arg_names: ['array_arg']},
                    validation: {signature: 'validation(self, array_arg)', arg_names: ['array_arg']},
                    array: {signature: 'array(self)'}
                };
            case 'QorusEventStep':
            case 'QorusSubworkflowStep':
                return {
                    primary: {signature: 'primary(self)'}
                };
            case 'QorusEventArrayStep':
            case 'QorusSubworkflowArrayStep':
                return {
                    primary: {signature: 'primary(self, array_arg)', arg_names: ['array_arg']},
                    array: {signature: 'array(self)'}
                };
            case 'QorusAsyncStep':
                return {
                    primary: {signature: 'primary(self)'},
                    validation: {signature: 'validation(self, async_key)', arg_names: ['async_key']},
                    end: {signature: 'end(self, queue_data)', arg_names: ['queue_data']}
                };
            case 'QorusAsyncArrayStep':
                return {
                    primary: {signature: 'primary(self, array_arg)', arg_names: ['array_arg']},
                    validation: {signature: 'validation(self, async_key, array_arg)', arg_names: ['async_key', 'array_arg']},
                    end: {signature: 'end(self, queue_data, array_arg)', arg_names: ['queue_data', 'array_arg']},
                    array: {signature: 'array(self)'}
                };
            default:
                return {};
        }
    };

    stepTriggerSignatures.java = base_class => {
        const fixSignature = triggers => {
            Object.keys(triggers).forEach(trigger => {
                triggers[trigger].signature = `public ${triggers[trigger].signature} throws Throwable`;
            });
            return triggers;
        };

        switch (code_info.stepType(base_class)) {
            case 'QorusNormalStep':
                return fixSignature({
                    primary: {signature: 'void primary()'},
                    validation: {signature: 'String validation()'}
                });
            case 'QorusNormalArrayStep':
                return fixSignature({
                    primary: {signature: 'void primary(Object array_arg)', arg_names: ['array_arg']},
                    validation: {signature: 'String validation(Object array_arg)', arg_names: ['array_arg']},
                    array: {signature: 'Object[] array()'}
                });
            case 'QorusEventStep':
            case 'QorusSubworkflowStep':
                return fixSignature({
                    primary: {signature: 'void primary()'}
                });
            case 'QorusEventArrayStep':
            case 'QorusSubworkflowArrayStep':
                return fixSignature({
                    primary: {signature: 'void primary(Object array_arg)', arg_names: ['array_arg']},
                    array: {signature: 'Object[] array()'}
                });
            case 'QorusAsyncStep':
                return fixSignature({
                    primary: {signature: 'void primary()'},
                    validation: {signature: 'String validation(String async_key)', arg_names: ['async_key']},
                    end: {signature: 'void end(Object queue_data)', arg_names: ['queue_data']}
                });
            case 'QorusAsyncArrayStep':
                return fixSignature({
                    primary: {signature: 'void primary(Object array_arg)', arg_names: ['array_arg']},
                    validation: {signature: 'String validation(String async_key, Object array_arg)', arg_names: ['async_key', 'array_arg']},
                    end: {signature: 'void end(Object queue_data, Object array_arg)', arg_names: ['queue_data', 'array_arg']},
                    array: {signature: 'Object[] array()'}
                });
            default:
                return {};
        }
    };

    return stepTriggerSignatures[lang](base_class);
}
