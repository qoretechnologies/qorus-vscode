import { service_creator } from './ServiceCreator';
import { class_creator } from './ClassCreator';
import { serviceFields, service_methods } from './service_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';
import { stepFields } from './step_constants';
import { classFields } from './common_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class InterfaceCreatorDispatcher {
    getFields(iface_kind: string, default_target_dir?: string): any[] {
        switch (iface_kind) {
            case 'service':
                return serviceFields(default_target_dir);
            case 'service-methods':
                return service_methods;
            case 'job':
                return jobFields(default_target_dir);
            case 'workflow':
                return workflowFields(default_target_dir);
            case 'class':
                return classFields(default_target_dir);
            case 'step':
                return stepFields(default_target_dir);
            default:
                return [];
        }
    }

    editInterface(params) {
        if (params.edit_type === 'edit' && !params.orig_data) {
            msg.error(t`MissingEditData`);
            return;
        }
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
