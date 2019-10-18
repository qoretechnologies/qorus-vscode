import { service_creator } from './ServiceCreator';
import { class_creator } from './ClassCreator';
import { serviceFields, service_methods } from './service_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';
import { stepFields } from './step_constants';
import { classFields } from './common_constants';
import { configItemFields } from './config_item_constants';
import { otherFields } from './other_constants';


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
                return configItemFields(params.interface_info);
            case 'other':
                return otherFields(params);
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
            case 'other':
                class_creator.edit(params);
                break;
            case 'config-item':
                params.interface_info.updateConfigItem(params);
                break;
        }
    }

    deleteServiceMethod(params: any) {
        service_creator.deleteMethod(params);
    }
}

export const creator = new InterfaceCreatorDispatcher();
