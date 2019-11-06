import { service_creator } from './ServiceCreator';
import { class_creator } from './ClassCreator';
import { qorus_webview } from '../QorusWebview';
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

    editInterface({iface_kind: iface_kinds, interface_info, ...other_params}) {
        const [iface_kind, sub_iface_kind] = iface_kinds.split(/:/);

        switch (sub_iface_kind || iface_kind) {
            case 'service':
                service_creator.edit(other_params);
                break;
            case 'workflow':
            case 'job':
            case 'class':
            case 'step':
            case 'other':
                class_creator.edit({...other_params, iface_kind});
                break;
            case 'config-item':
                interface_info.updateConfigItem({...other_params, iface_kind});
                break;
        }
    }

    fieldAdded({field, iface_id, iface_kind}) {
        switch(field) {
            case 'class-name':
                if (iface_kind === 'workflow') {
                    qorus_webview.postMessage({
                        action: 'creator-add-field',
                        field: 'base-class-name',
                        iface_id,
                        iface_kind
                    });
                }
                break;
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    qorus_webview.postMessage({
                        action: 'creator-add-field',
                        field: 'class-name',
                        iface_id,
                        iface_kind
                    });
                }
                break;
        }
    }

    fieldRemoved({field, interface_info, ...other_params}) {
        switch(field) {
            case 'base-class-name':
                interface_info.removeBaseClass(other_params);
                break;
            case 'classes':
                interface_info.removeClasses(other_params);
                break;
        }
    }

    deleteServiceMethod(params: any) {
        service_creator.deleteMethod(params);
    }
}

export const creator = new InterfaceCreatorDispatcher();
