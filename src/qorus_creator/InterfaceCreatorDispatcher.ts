import { service_creator } from './ServiceCreator';
import { class_creator } from './ClassCreator';
import { serviceFields, service_methods } from './service_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';
import { stepFields } from './step_constants';
import { classFields } from './common_constants';
import { config_item_fields } from './config_item_constants';


class InterfaceCreatorDispatcher {
    getFields(params: any): any[] {
        switch (params.iface_kind) {
            case 'service':
                return serviceFields(params);
            case 'service-methods':
                return service_methods;
            case 'job':
                return jobFields(params);
            case 'workflow':
                return workflowFields(params);
            case 'class':
                return classFields(params);
            case 'step':
                return stepFields(params);
            case 'config-item':
                return config_item_fields;
            default:
                return [];
        }
    }

    editInterface(params) {
        switch (params.iface_kind) {
            case 'service':
                service_creator.edit(params);
                break;
            case 'workflow':
            case 'job':
            case 'class':
            case 'step':
                class_creator.edit(params);
                break;
        }
    }

    deleteServiceMethod(data: any) {
        service_creator.deleteMethod(data);
    }
}

export const creator = new InterfaceCreatorDispatcher();
