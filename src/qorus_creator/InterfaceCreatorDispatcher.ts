import { service_creator } from './ServiceCreator';
import { job_creator } from './JobCreator';
import { workflow_creator } from './WorkflowCreator';
import { serviceFields, service_methods } from './service_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';


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
            default:
                return [];
        }
    }

    editInterface(iface_kind: string, edit_type: string, data: any) {
        switch (iface_kind) {
            case 'service':
                service_creator.edit(data, edit_type);
                break;
            case 'job':
                job_creator.edit(data, edit_type);
                break;
            case 'workflow':
                workflow_creator.edit(data, edit_type);
                break;
        }
    }

    deleteServiceMethod(data: any) {
        service_creator.deleteMethod(data);
    }
}

export const creator = new InterfaceCreatorDispatcher();
