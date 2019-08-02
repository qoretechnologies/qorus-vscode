import { service_creator } from './ServiceCreator';
import { serviceFields, service_methods } from './service_code';
import { jobFields } from './job_code';


class InterfaceCreator {
    getFields(iface_kind: string, default_target_dir?: string): any[] {
        switch (iface_kind) {
            case 'service':
                return serviceFields(default_target_dir);
            case 'service-methods':
                return service_methods;
            case 'job':
                return jobFields(default_target_dir);
            default:
                return [];
        }
    }

    editInterface(iface_kind: string, data: any) {
        switch (iface_kind) {
            case 'service':
                service_creator.edit(data);
                break;
        }
    }

    deleteServiceMethod(data: any) {
        service_creator.deleteMethod(data);
    }
}

export const creator = new InterfaceCreator();
