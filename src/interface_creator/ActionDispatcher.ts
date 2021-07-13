import { flattenDeep } from 'lodash';
import { gettext } from 'ttag';
import { isLangClientAvailable } from '../qore_vscode';
import { default_lang } from '../qorus_constants';
import { classFields } from './common_constants';
import { configItemFields } from './config_item_constants';
import { connectionFields } from './connection_constants';
import { interface_with_methods_creator } from './InterfaceWithMethodsCreator';
import { interface_without_methods_creator } from './InterfaceWithoutMethodsCreator';
import { jobFields } from './job_constants';
import { mapperCodeFields, mapperFields, mapperMethodFields } from './mapper_constants';
import { errorsFields, error_fields, eventFields, groupFields, queueFields, valueMapFields } from './other_constants';
import { serviceFields, serviceMethodFields } from './service_constants';
import { stepFields } from './step_constants';
import { workflowFields } from './workflow_constants';

export class ActionDispatcher {
    private static getFields = (params: any): any[] => {
        switch (params.iface_kind) {
            case 'service':
                return serviceFields(params);
            case 'service-methods':
                return serviceMethodFields(params);
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
                return mapperMethodFields(params);
            case 'group':
                return groupFields(params);
            case 'event':
                return eventFields(params);
            case 'queue':
                return queueFields(params);
            case 'value-map':
                return valueMapFields(params);
            case 'errors':
                return errorsFields(params);
            case 'error':
                return error_fields;
            default:
                return [];
        }
    };

    static getSortedFields = async (params: any): Promise<any[]> => {
        params.limited_editing =
            params.is_editing && (params.lang || default_lang) === 'qore' && !(await isLangClientAvailable());

        const not_to_sort = ['target_dir', 'name', 'class-class-name', 'description', 'desc', 'lang'];
        let unsorted = [...ActionDispatcher.getFields(params)];
        let at_the_beginning = [];
        not_to_sort.forEach((field_name) => {
            const index = unsorted.findIndex(({ name }) => name === field_name);
            if (index > -1) {
                at_the_beginning.push(unsorted.splice(index, 1));
            }
        });
        const sorter = (a, b) => {
            const nameA = gettext(`field-label-${a.name}`).toUpperCase();
            const nameB = gettext(`field-label-${b.name}`).toUpperCase();
            return nameA < nameB ? -1 : nameA > nameB ? 1 : 0;
        };

        return Promise.resolve([...flattenDeep(at_the_beginning), ...unsorted.sort(sorter)]);
    };

    static editInterface({ iface_kind: iface_kinds, interface_info, ...other_params }) {
        const [iface_kind, sub_iface_kind] = iface_kinds.split(/:/);

        switch (sub_iface_kind || iface_kind) {
            case 'service':
            case 'mapper-code':
                interface_with_methods_creator.edit({ ...other_params, iface_kind });
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
            case 'value-map':
            case 'errors':
                interface_without_methods_creator.edit({ ...other_params, iface_kind });
                break;
            case 'config-item':
                interface_info.updateConfigItem({ ...other_params, iface_kind });
                break;
        }
    }

    static deleteMethod(data: any, iface_kind: string) {
        interface_with_methods_creator.deleteMethod(data, iface_kind);
    }
}
