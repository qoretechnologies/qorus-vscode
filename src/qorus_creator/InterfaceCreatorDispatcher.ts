import { service_creator } from './ServiceCreator';
import { class_creator } from './ClassCreator';
import { qorus_webview } from '../QorusWebview';
import { classFields } from './common_constants';
import { serviceFields, service_methods } from './service_constants';
import { libraryFields, function_fields } from './function_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';
import { stepFields } from './step_constants';
import { mapperFields } from './mapper_constants';
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
            case 'mapper':
                return mapperFields(params);
            case 'config-item':
                return configItemFields(params.interface_info);
            case 'library':
                return libraryFields(params);
            case 'function':
                return function_fields;
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
        const addField = field =>
            qorus_webview.postMessage({ action: 'creator-add-field', field, iface_id, iface_kind });

        switch(field) {
            case 'class-name':
                if (iface_kind === 'workflow') {
                    addField('base-class-name');
                }
                break;
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    addField('class-name');
                }
                break;
        }
    }

    fieldRemoved({field, interface_info, ...other_params}) {
        const {iface_id, iface_kind} = other_params;

        const removeField = field =>
            qorus_webview.postMessage({ action: 'creator-remove-field', field, iface_id, iface_kind });

        switch(field) {
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    removeField('class-name');
                }
                interface_info.removeBaseClass(other_params);
                break;
            case 'class-name':
                if (iface_kind === 'workflow') {
                    removeField('base-class-name');
                }
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
