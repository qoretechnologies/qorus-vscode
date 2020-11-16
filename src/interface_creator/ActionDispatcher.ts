import * as flattenDeep from 'lodash/flattenDeep';
import { interface_without_methods_creator } from './InterfaceWithoutMethodsCreator';
import { interface_with_methods_creator } from './InterfaceWithMethodsCreator';
import { classFields } from './common_constants';
import { serviceFields, service_methods } from './service_constants';
import { jobFields } from './job_constants';
import { workflowFields } from './workflow_constants';
import { stepFields } from './step_constants';
import { mapperFields, mapperCodeFields, mapper_method_fields } from './mapper_constants';
import { connectionFields } from './connection_constants';
import { configItemFields } from './config_item_constants';
import { groupFields, eventFields, queueFields, valueMapFields } from './other_constants';
import { gettext } from 'ttag';


export class ActionDispatcher {
    private static getFields = (params: any): any[] => {
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
            case 'connection':
                return connectionFields(params);
            case 'config-item':
                return configItemFields(params);
            case 'mapper-code':
                return mapperCodeFields(params);
            case 'mapper-methods':
                return mapper_method_fields;
            case 'group':
                return groupFields(params);
            case 'event':
                return eventFields(params);
            case 'queue':
                return queueFields(params);
            case 'value-map':
                return valueMapFields(params);
            default:
                return [];
        }
    }

    static getSortedFields = (params: any): any[] => {
        const not_to_sort = ['target_dir', 'name', 'class-class-name', 'description', 'desc', 'lang'];
        let unsorted = [ ...ActionDispatcher.getFields(params) ];
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
                interface_with_methods_creator.edit({...other_params, iface_kind});
                break;
            case 'workflow':
            case 'job':
            case 'class':
            case 'step':
            case 'group':
            case 'event':
            case 'queue':
            case 'mapper':
            case 'type':
            case 'fsm':
            case 'pipeline':
            case 'connection':
                interface_without_methods_creator.edit({...other_params, iface_kind});
                break;
            case 'config-item':
                interface_info.updateConfigItem({...other_params, iface_kind});
                break;
        }
    }

    static deleteMethod(data: any, iface_kind: string) {
        interface_with_methods_creator.deleteMethod(data, iface_kind);
    }
}
