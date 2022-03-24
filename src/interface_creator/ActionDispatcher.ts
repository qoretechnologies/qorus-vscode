import { flattenDeep } from 'lodash';
import { gettext } from 'ttag';
import { default_lang } from '../qorus_constants';
import { classFields } from './common_constants';
import { configItemFields } from './config_item_constants';
import { connectionFields } from './connection_constants';
import { interface_with_methods_creator } from './InterfaceWithMethodsCreator';
import { interface_without_methods_creator } from './InterfaceWithoutMethodsCreator';
import { jobFields } from './job_constants';
import { mapperCodeFields, mapperFields, mapperMethodFields } from './mapper_constants';
import {
  errorsFields,
  error_fields,
  eventFields,
  groupFields,
  queueFields,
  valueMapFields,
} from './other_constants';
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

  /**
   * Get the fields from the params object,
   * remove the fields that shouldn't be sorted, and sort the remaining fields.
   */
  static getSortedFields = async (params: any): Promise<any[]> => {
    const lang = params.lang || default_lang;

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

    let fields = [...flattenDeep(at_the_beginning), ...unsorted.sort(sorter)];

    // Inject any default values from the params object
    if (params.context?.default_values) {
      fields = fields.map((field) => {
        if (params.context?.default_values[field.name]) {
          field.default_value = params.context?.default_values[field.name];
        }
        return field;
      });
    }

    console.log(params, fields);

    return Promise.resolve(fields);
  };

  /**
   * * The `editInterface` function is called when the user clicks the "Edit" button in the interface list.
   * * The `iface_kinds` parameter is a string that contains the interface kind and sub-interface kind separated by a colon.
   * * The `interface_info` parameter is an object that contains information about the interface.
   * * The `other_params` parameter is an object that contains other parameters that are passed to the `edit` function.
   * * The `iface_kind` parameter is the interface kind.
   * * The `sub
   */
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
