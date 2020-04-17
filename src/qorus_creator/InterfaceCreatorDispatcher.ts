import * as flattenDeep from 'lodash/flattenDeep';
import { class_creator } from './ClassCreator';
import { class_with_methods_creator } from './ClassWithMethodsCreator';
import { qorus_webview } from '../QorusWebview';
import { classFields } from './common_constants';
import { serviceFields, service_methods } from './service_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';
import { stepFields } from './step_constants';
import { mapperFields, mapperCodeFields, mapper_method_fields } from './mapper_constants';
import { configItemFields } from './config_item_constants';
import { otherFields } from './other_constants';
import { gettext } from 'ttag';


export class InterfaceCreatorDispatcher {
    static getFields = (params: any): any[] => {
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
            case 'mapper-code':
                return mapperCodeFields(params);
            case 'mapper-methods':
                return mapper_method_fields;
            case 'other':
                return otherFields(params);
            default:
                return [];
        }
    }

    static getSortedFields = (params: any): any[] => {
        const not_to_sort = ['target_dir', 'name', 'class-class-name', 'description', 'desc'];
        let unsorted = [ ...InterfaceCreatorDispatcher.getFields(params) ];
        let at_the_beginning = [];
        not_to_sort.forEach(field_name => {
            const index = unsorted.findIndex(({name}) => name === field_name);
            if (index > -1) {
                at_the_beginning.push(unsorted.splice(index, 1));
            }
        });
        const sorter = (a, b) => {
            const nameA = gettext(`field-label-${a.name}`).toUpperCase();
            const nameB = gettext(`field-label-${b.name}`).toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        };
        return [...flattenDeep(at_the_beginning), ...unsorted.sort(sorter)];
    }

    static editInterface({iface_kind: iface_kinds, interface_info, ...other_params}) {
        const [iface_kind, sub_iface_kind] = iface_kinds.split(/:/);

        switch (sub_iface_kind || iface_kind) {
            case 'service':
            case 'mapper-code':
                class_with_methods_creator.edit({...other_params, iface_kind});
                break;
            case 'workflow':
            case 'job':
            case 'class':
            case 'step':
            case 'other':
            case 'mapper':
            case 'type':
                class_creator.edit({...other_params, iface_kind});
                break;
            case 'config-item':
                interface_info.updateConfigItem({...other_params, iface_kind});
                break;
        }
    }

    static configItemTypeChanged({type, iface_id, iface_kind}) {
        const postMessage = (action, fields) => fields.forEach(field =>
            qorus_webview.postMessage({
                action: `creator-${action}-field`,
                field,
                iface_id,
                iface_kind
            })
        );

        if (type === 'any') {
            postMessage('remove', ['can_be_undefined', 'allowed_values']);
            postMessage('disable', ['can_be_undefined', 'allowed_values']);
        } else {
            postMessage('enable', ['can_be_undefined', 'allowed_values']);
            postMessage('add', ['can_be_undefined']);
        }
    }

    static fieldAdded({field, iface_id, iface_kind}) {
        const addField = field =>
            qorus_webview.postMessage({ action: 'creator-add-field', field, iface_id, iface_kind });

        switch(field) {
            case 'class-name':
                if (iface_kind === 'workflow') {
                    addField('base-class-name');
                    addField('lang');
                }
                break;
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    addField('class-name');
                    addField('lang');
                }
                break;
            case 'lang':
                if (iface_kind === 'workflow') {
                    addField('class-name');
                    addField('base-class-name');
                }
                break;
        }
    }

    static fieldRemoved({field, interface_info, ...other_params}) {
        const {iface_id, iface_kind} = other_params;

        const removeField = field =>
            qorus_webview.postMessage({ action: 'creator-remove-field', field, iface_id, iface_kind });

        switch(field) {
            case 'base-class-name':
                if (iface_kind === 'workflow') {
                    removeField('class-name');
                    removeField('lang');
                }
                interface_info.removeBaseClass(other_params);
                interface_info.getConfigItems(other_params);
                break;
            case 'class-name':
                if (iface_kind === 'workflow') {
                    removeField('base-class-name');
                    removeField('lang');
                }
                break;
            case 'lang':
                if (iface_kind === 'workflow') {
                    removeField('base-class-name');
                    removeField('class-name');
                }
                break;
            case 'classes':
            case 'requires':
                interface_info.removeAllClasses(other_params);
                break;
        }
    }

    static deleteMethod(data: any, iface_kind: string) {
        class_with_methods_creator.deleteMethod(data, iface_kind);
    }
}
