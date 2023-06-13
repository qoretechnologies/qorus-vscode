import * as jsyaml from 'js-yaml';
import { flattenDeep } from 'lodash';
import { t } from 'ttag';
import { getTargetFile } from './QorusDraftsTree';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { QorusProjectYamlInfo } from './QorusProjectYamlInfo';
import { qorus_webview } from './QorusWebview';
import { configItemFields, defaultValue } from './interface_creator/config_item_constants';
import { default_version } from './qorus_constants';
import * as msg from './qorus_message';
import { deepCopy, hasConfigItems } from './qorus_utils';
const md5 = require('md5');

export class QorusProjectInterfaceInfo {
  private code_info: QorusProjectCodeInfo;
  private yaml_info: QorusProjectYamlInfo;
  public iface_by_id = {};

  private last_target_dir: string | undefined;
  private last_conf_group: string | undefined;
  private last_language: string | undefined;

  constructor(code_info: QorusProjectCodeInfo) {
    this.code_info = code_info;
    this.yaml_info = code_info.yaml_info;
  }

  private hasSpecificData = (iface_kind) => ['fsm', 'pipeline'].includes(iface_kind);

  /**
   * If the interface is a pipeline, return the processor id. If the interface is a state machine, return the state id. Otherwise, return undefined.
   */
  private specificDataId = (iface_kind, state_id, processor_id) => {
    switch (iface_kind) {
      case 'fsm':
        if (state_id) {
          return state_id;
        }
        break;
      case 'pipeline':
        if (processor_id) {
          return processor_id;
        }
        break;
    }

    return undefined;
  };

  /**
   * If we haven't seen this interface before, we'll create a new object for it. If we have seen it before, we'll just reference the existing object.
   */
  private maybeInitIfaceId = ({
    iface_id,
    iface_kind,
    state_id = undefined,
    processor_id = undefined,
  }) => {
    if (!this.iface_by_id[iface_id]) {
      this.iface_by_id[iface_id] = {};
    }

    this.iface_by_id[iface_id].type = iface_kind;

    if (hasConfigItems(iface_kind) && !this.iface_by_id[iface_id]['config-items']) {
      this.iface_by_id[iface_id]['config-items'] = [];
    }
    if (iface_kind === 'workflow' && !this.iface_by_id[iface_id]['config-item-values']) {
      this.iface_by_id[iface_id]['config-item-values'] = [];
    }

    if (this.hasSpecificData(iface_kind)) {
      if (!this.iface_by_id[iface_id].specific_data) {
        this.iface_by_id[iface_id].specific_data = {};
      }

      const specific_data_id = this.specificDataId(iface_kind, state_id, processor_id);
      if (specific_data_id) {
        this.maybeInitSpecificDataId(iface_id, specific_data_id);
      }
    }
  };

  private maybeInitSpecificDataId = (iface_id, specific_data_id) => {
    if (!this.iface_by_id[iface_id].specific_data[specific_data_id]) {
      this.iface_by_id[iface_id].specific_data[specific_data_id] = {};
    }
  };

  /**
   * If the interface type has specific data, then reset the config items to the original config items for the specific data. Otherwise, reset the config items to the original config items for the interface.
   */
  resetConfigItemsToOrig = ({ iface_id, state_id, processor_id }) => {
    if (!this.checkIfaceId(iface_id)) {
      return;
    }

    const iface = this.iface_by_id[iface_id];
    if (this.hasSpecificData(iface.type)) {
      const specific_data_id = this.specificDataId(iface.type, state_id, processor_id);
      const specific_data_ids = specific_data_id
        ? [specific_data_id]
        : Object.keys(iface.specific_data) || [];
      specific_data_ids.forEach((id) => {
        const specific_data = iface.specific_data[id];
        specific_data['config-items'] = deepCopy(specific_data?.['orig-config-items'] || []);
      });
    } else {
      iface['config-items'] = deepCopy(iface?.['orig-config-items'] || []);
    }
  };

  /**
   * If the interface has specific data, then the specific data has a config-items property. If the interface has specific data, then the specific data has a config-items property.
   */
  // set the original config items for an interface
  setOrigConfigItems = (
    { iface_id, state_id = undefined, processor_id = undefined },
    report_unknown_iface_id = true
  ) => {
    if (!this.checkIfaceId(iface_id, report_unknown_iface_id)) {
      return;
    }

    const iface = this.iface_by_id[iface_id];

    if (this.hasSpecificData(iface.type)) {
      const specific_data_id = this.specificDataId(iface.type, state_id, processor_id);
      const specific_data_ids = specific_data_id
        ? [specific_data_id]
        : Object.keys(iface.specific_data) || [];
      specific_data_ids.forEach((id) => {
        const specific_data = iface.specific_data[id] || {};
        specific_data['orig-config-items'] = deepCopy(specific_data?.['config-items'] || []);
      });
    } else {
      iface['orig-config-items'] = deepCopy(iface?.['config-items'] || []);
    }
  };

  // check if an interface id is known
  /**
   * "This is a function that checks if the iface_id is valid."
   */
  private checkIfaceId = (iface_id, report_unknown_iface_id = true): boolean => {
    if (!this.iface_by_id[iface_id]) {
      if (report_unknown_iface_id) {
        msg.log(t`UnexpectedIfaceId`);
      }
      return false;
    }
    return true;
  };

  /**
   * "Add an interface to the
   * iface_by_id map, and add the interface's specific data to the
   * specific_data_by_id map."
   */
  /*
  add interface by id
  Args:
   - states:{  }={  }

  */
  addIfaceById = (data: any, iface_kind: string): string => {
    const iface_id = md5(getTargetFile(data));
    this.maybeInitIfaceId({ iface_id, iface_kind });
    this.iface_by_id[iface_id] = {
      ...this.iface_by_id[iface_id],
      ...data,
      type: iface_kind,
    };

    if (iface_kind === 'fsm') {
      const addStateData = (states: {} = {}) => {
        Object.keys(states).forEach((state_id) => {
          const state = states[state_id];

          switch (state.type) {
            case 'block':
              addStateData(state.states);
              break;
            case 'state':
              if (!state.id) {
                break;
              }
              this.maybeInitSpecificDataId(iface_id, state.id);
              if (state.id && state?.action?.value?.class) {
                this.iface_by_id[iface_id].specific_data[state.id].class_name =
                  state.action.value.class;
              }

              if (state['config-items']?.length) {
                this.iface_by_id[iface_id].specific_data[state.id]['config-items'] =
                  state['config-items'];
              }
              break;
          }
        });
      };
      addStateData(data.states);
    } else if (iface_kind === 'pipeline') {
      const addChildrenData = (children: any[] = []) => {
        children.forEach((child) => {
          switch (child.type) {
            case 'queue':
              addChildrenData(child.children);
              break;
            case 'processor':
              if (child.pid) {
                this.maybeInitSpecificDataId(iface_id, child.pid);
                this.iface_by_id[iface_id].specific_data[child.pid].class_name = child.name;
                if (child['config-items']?.length) {
                  this.iface_by_id[iface_id].specific_data[child.pid]['config-items'] =
                    child['config-items'];
                }
              }
              if (child.children) {
                addChildrenData(child.children);
              }
              break;
          }
        });
      };
      addChildrenData(data.children);
    }

    this.setOrigConfigItems({ iface_id });
    return iface_id;
  };

  getInfo = (id: string): any => {
    return this.iface_by_id[id];
  };

  deleteInfo = (id: string) => {
    delete this.iface_by_id[id];
  };

  get last_config_group(): string | undefined {
    return this.last_conf_group;
  }

  get last_target_directory(): string | undefined {
    return this.last_target_dir;
  }

  set last_target_directory(last_target_dir: string | undefined) {
    this.last_target_dir = last_target_dir;
  }

  get last_lang(): string | undefined {
    return this.last_language;
  }

  set last_lang(last_language: string | undefined) {
    this.last_language = last_language;
  }

  updateConfigItemValue = ({
    iface_id,
    iface_kind,
    name,
    value,
    level,
    parent_class,
    remove,
    is_templated_string,
    value_true_type,
    state_id,
    processor_id,
  }) => {
    this.maybeInitIfaceId({ iface_id, iface_kind, state_id, processor_id });

    value_true_type =
      value_true_type === 'null' || value_true_type === null
        ? `"${value_true_type}"`
        : value_true_type;

    const specific_data_id = this.specificDataId(iface_kind, state_id, processor_id);
    const state_data = { id: state_id };
    const processor_data = { pid: processor_id };

    if (!level) {
      msg.log(t`LevelNeededToUpdateCIValue`);

      if (parent_class) {
        this.addClassConfigItems(iface_id, parent_class);
      }

      this.getConfigItems({ iface_id, iface_kind, state_data, processor_data });

      return;
    }

    if (['step', 'job', 'service', 'class', 'fsm', 'pipeline'].includes(level)) {
      level = 'local';
    }

    const parseIfComplex = (item) => {
      const type = item.type === 'any' && value_true_type ? value_true_type : item.type;
      return ['list', 'hash', '*list', '*hash'].includes(type) ? jsyaml.safeLoad(value) : value;
    };

    const templated_key =
      level === 'global' ? 'is_global_value_templated_string' : 'is_value_templated_string';

    if (level === 'workflow') {
      if (iface_kind !== 'workflow') {
        msg.error(t`WorkflowConfigItemValueForNonWorkflow`);
        return;
      }

      let index = this.iface_by_id[iface_id]['config-item-values'].findIndex(
        (ci_value) => ci_value.name === name
      );

      if (value === null && remove) {
        if (index > -1) {
          this.iface_by_id[iface_id]['config-item-values'].splice(index, 1);
        } else {
          msg.error(t`WorkflowConfigItemValueNotFound ${name}`);
        }
      } else {
        let item;
        if (index > -1) {
          item = this.iface_by_id[iface_id]['config-item-values'][index];
          item.value = parseIfComplex(item);
        } else {
          msg.error(t`ConfigItemNotFound ${name}`);
        }

        item[templated_key] = is_templated_string;
        item.value_true_type = value_true_type;
      }
    } else {
      const iface = this.iface_by_id[iface_id];
      let config_items: any[];
      if (specific_data_id) {
        config_items = iface.specific_data?.[specific_data_id]?.['config-items'];
      } else {
        config_items = iface['config-items'];
      }

      let item = (config_items || []).find((ci_value) => ci_value.name === name);

      if (item === undefined) {
        msg.error(t`ConfigItemNotFound ${name}`);
      } else {
        delete item.value;
        if (value === null && remove) {
          delete item[level + '-value'];
          if (level === 'global') {
            item['remove-global-value'] = true;
          }
        } else {
          item[level + '-value'] = parseIfComplex(item);
          item[templated_key] = is_templated_string;
          item.value_true_type = value_true_type;
        }
      }
    }

    this.getConfigItems({ iface_id, iface_kind, state_data, processor_data });
  };

  /**
   * When the user clicks on the "Update" button, the "updateConfigItem" function is called. The function takes the following arguments:
   *
   * iface_id: The id of the interface that the user is editing.
   * iface_kind: The kind of interface that the user is editing.
   * data: The data that the user has entered into the interface.
   * request_id: The id of the request that the user is making.
   * edit_type: The type of edit that the user is making.
   * state_id: The id of the state that the user
   */
  updateConfigItem = ({
    iface_id,
    iface_kind,
    data: item,
    request_id,
    edit_type,
    state_id,
    processor_id,
  }) => {
    this.maybeInitIfaceId({ iface_id, iface_kind, state_id, processor_id });

    let iface = this.iface_by_id[iface_id];
    /*
        if (!item.parent) {
            // check existence of saved config items with the same name and prefix
            const existing_item = this.yaml_info.getConfigItem(item);
            if (existing_item &&
                (existing_item.iface_type !== iface.type ||
                 existing_item.iface_name !== iface.name))
            {
                const {name, prefix = '', iface_type, iface_name} = existing_item;
                qorus_webview.postMessage({
                    action: `creator-${edit_type}-interface-complete`,
                    request_id,
                    ok: false,
                    message: t`ConfigItemAlreadyExists ${name} ${prefix} ${iface_type} ${iface_name}`
                });
                return;
            }
        }
*/
    const default_value_true_type =
      item.type === 'any' && item.default_value_true_type
        ? item.default_value_true_type
        : item.type;

    if (['list', 'hash'].includes(default_value_true_type)) {
      if (item.default_value) {
        item.default_value = jsyaml.safeLoad(item.default_value);
      }

      if (item.allowed_values) {
        item.allowed_values = item.allowed_values.map((value) => jsyaml.safeLoad(value));
      }
    }

    if (item.can_be_undefined && item.type) {
      item.type = '*' + item.type;
    }
    delete item.can_be_undefined;

    let config_items: any[];
    let specific_data: any;
    const specific_data_id = this.specificDataId(iface_kind, state_id, processor_id);
    if (specific_data_id) {
      specific_data = iface.specific_data?.[specific_data_id];
      config_items = specific_data?.['config-items'];
    } else {
      config_items = iface['config-items'];
    }
    config_items = config_items || [];

    const name_to_search = item.orig_name || item.name;
    const index = config_items.findIndex((item2) => item2.name === name_to_search);

    if (index > -1) {
      let existing_item = config_items[index];
      if (name_to_search !== item.name) {
        existing_item.name = item.name;
      }

      const orig_type = existing_item.type || defaultValue('type');
      const orig_value_true_type =
        orig_type === 'any' &&
        (existing_item.value_true_type || existing_item.value_true_type === null)
          ? existing_item.value_true_type
          : orig_type;

      if (![orig_value_true_type, 'any'].includes(item.type)) {
        delete existing_item['local-value'];
      }

      const field_names = configItemFields(this).map((field) => field.name);
      field_names.forEach((field_name) => {
        delete existing_item[field_name];
      });

      existing_item = { ...existing_item, ...item };
      config_items[index] = existing_item;
    } else {
      config_items.push(item);
    }

    if (specific_data) {
      specific_data['config-items'] = config_items;
    } else {
      iface['config-items'] = config_items;
    }

    if (item.config_group) {
      this.last_conf_group = item.config_group;
    }

    qorus_webview.postMessage({
      action: `creator-${edit_type}-interface-complete`,
      request_id,
      ok: true,
      message: t`ConfigItemUpdatedSuccessfully ${item.name}`,
    });

    const { 'base-class-name': base_class_name, classes, requires, steps } = iface;
    this.getConfigItems({
      iface_id,
      iface_kind,
      'base-class-name': base_class_name,
      classes,
      requires,
      steps,
      state_data: { id: state_id },
      processor_data: { pid: processor_id },
    });
  };

  deleteConfigItem = ({ iface_id, iface_kind, name, state_id, processor_id }) => {
    if (!this.checkIfaceId(iface_id)) {
      return;
    }

    let iface = this.iface_by_id[iface_id];
    iface_kind = iface_kind || iface.type;

    let config_items: any[];
    const specific_data_id = this.specificDataId(iface_kind, state_id, processor_id);
    if (specific_data_id) {
      config_items = iface.specific_data?.[specific_data_id]?.['config-items'];
    } else {
      config_items = iface['config-items'];
    }

    const index = (config_items || []).findIndex((item) => item.name === name);
    if (index > -1) {
      config_items.splice(index, 1);
    } else {
      msg.error(t`ConfigItemNotFound ${name}`);
    }

    this.getConfigItems({
      iface_id,
      iface_kind,
      state_data: { id: state_id },
      processor_data: { pid: processor_id },
    });
  };

  private configItemInheritedData = (this_item) => {
    if (!this_item.parent) {
      return this_item;
    }

    const parent_name = this_item.parent['interface-name'];
    const parent_data = this.yaml_info.yamlDataByName('class', parent_name);
    if (!parent_data) {
      return this_item;
    }

    const index = (parent_data['config-items'] || []).findIndex(
      (item) => item.name === this_item.name
    );
    if (index === -1) {
      //            msg.error(t`AncestorDoesNotHaveConfigItem ${'class'} ${parent_name} ${this_item.name}`);
      return this_item;
    }

    const inherited_item = this.configItemInheritedData(parent_data['config-items'][index]);

    return { ...inherited_item, ...this_item };
  };

  /**
   * For each class, add the config items from the class's YAML file to the interface.
   */
  private addClassConfigItems = (iface_id, class_name, prefix?, specific_data_id?) => {
    const class_yaml_data = this.yaml_info.yamlDataByName('class', class_name);
    if (!class_yaml_data) {
      return;
    }

    console.log(iface_id, class_name, prefix, specific_data_id);

    const version = (class_yaml_data.version || default_version).toString();

    (class_yaml_data['config-items'] || []).forEach((raw_item) => {
      let item = { ...this.configItemInheritedData(raw_item) };
      console.log(raw_item, item);

      item.parent_data = { ...item };
      item.parent = {
        'interface-type': 'class',
        'interface-name': class_name,
        'interface-version': version,
      };
      item.parent_class = class_name;
      if (prefix) {
        item.prefix = prefix + (item.prefix || '');
      }

      let iface = this.iface_by_id[iface_id];
      if (specific_data_id) {
        if (!iface.specific_data[specific_data_id]['config-items']) {
          iface.specific_data[specific_data_id]['config-items'] = [];
        }
        const index = iface.specific_data[specific_data_id]?.['config-items'].findIndex(
          (item2) =>
            item2.name === raw_item.name && (!item2.prefix || item2.prefix === raw_item.prefix)
        );

        if (index > -1) {
          this.iface_by_id[iface_id].specific_data[specific_data_id]['config-items'][index] = {
            ...item,
            ...iface.specific_data[specific_data_id]['config-items'][index],
          };
        } else {
          this.iface_by_id[iface_id].specific_data[specific_data_id]['config-items'].push(item);
        }
      } else {
        const index = this.iface_by_id[iface_id]['config-items'].findIndex(
          (item2) =>
            item2.name === raw_item.name &&
            (item2.parent?.['interface-name'] || item2.parent_class) === class_name &&
            (!item2.prefix || item2.prefix === raw_item.prefix)
        );

        if (index > -1) {
          this.iface_by_id[iface_id]['config-items'][index] = {
            ...item,
            parent_class: class_name,
            ...iface['config-items'][index],
          };
        } else {
          this.iface_by_id[iface_id]['config-items'].push({
            ...item,
            parent_class: class_name,
          });
        }
      }
    });
  };

  private findConfigItem = ({ iface_id, name, state_id, processor_id }) => {
    const iface = iface_id && this.iface_by_id[iface_id];
    if (!iface) {
      return undefined;
    }

    let config_items;
    const specific_data_id = this.specificDataId(iface.type, state_id, processor_id);
    if (specific_data_id) {
      config_items = iface.specific_data?.[specific_data_id]?.['config-items'];
    } else {
      config_items = iface['config-items'];
    }

    return (config_items || []).find((item) => item.name === name);
  };

  getConfigItem = (params) => {
    const found_item = this.findConfigItem(params);
    if (!found_item) {
      return;
    }

    let item = { ...found_item };
    item.type = item.type || defaultValue('type');
    if (item.type[0] === '*') {
      item.type = item.type.substr(1);
      item.can_be_undefined = true;
    }

    const default_value_true_type =
      item.type === 'any' && item.default_value_true_type
        ? item.default_value_true_type
        : item.type;

    if (item.default_value !== undefined && ['list', 'hash'].includes(default_value_true_type)) {
      item.default_value = jsyaml.safeDump(item.default_value).replace(/\r?\n$/, '');
    }

    const message = {
      action: 'return-config-item',
      item,
    };

    qorus_webview.postMessage(message);
  };

  removeBaseClass = ({ iface_id, iface_kind }) => {
    this.maybeInitIfaceId({ iface_id, iface_kind });
    let iface = this.iface_by_id[iface_id];

    const base_class_name = iface['base-class-name'];
    if (!base_class_name) {
      return;
    }

    delete iface['base-class-name'];

    if (!hasConfigItems(iface_kind)) {
      return;
    }

    const classes = iface.requires || iface.classes || [];
    if (
      classes.findIndex(({ name, prefix = '' }) => base_class_name === name && prefix === '') > -1
    ) {
      return;
    }

    this.iface_by_id[iface_id]['config-items'] = iface['config-items'].filter(
      (item) => !item.parent || item.parent['interface-name'] !== base_class_name || item.prefix
    );
  };

  private removeClassFromSpecificData = (iface_id, specific_data_id) => {
    const specific_data = this.iface_by_id[iface_id]?.specific_data?.[specific_data_id];
    if (specific_data) {
      delete specific_data.class_name;
      delete specific_data['config-items'];
    }
  };

  removeAllClasses = ({ iface_id, iface_kind }) => {
    this.maybeInitIfaceId({ iface_id, iface_kind });
    this.removeClassesConfigItems(iface_id);
    delete this.iface_by_id[iface_id].classes;
    delete this.iface_by_id[iface_id].requires;
    this.getConfigItems({ iface_id, iface_kind });
  };

  private removeClassesConfigItems = (iface_id, classes?) => {
    const removeClassConfigItems = (class_name, is_base_class) => {
      this.iface_by_id[iface_id]['config-items'] = this.iface_by_id[iface_id][
        'config-items'
      ].filter(
        (item) =>
          !item.parent ||
          item.parent['interface-name'] !== class_name ||
          (is_base_class && !item.prefix)
      );
    };

    const iface_data = this.iface_by_id[iface_id];
    const base_class_name = iface_data['base-class-name'];

    (iface_data.classes || iface_data.requires || []).forEach((class_data) => {
      const index = (classes || []).findIndex(
        (class_data_2) => class_data_2.name === class_data.name
      );
      if (index === -1) {
        removeClassConfigItems(class_data.name, class_data.name === base_class_name);
      }
    });
  };

  private workflowStepsConfigItems = (steps) => {
    let items = [];
    flattenDeep(steps).forEach((name) => {
      const step_data: any = this.yaml_info.yamlDataByName('step', name);
      if (!step_data) {
        msg.error(t`YamlDataNotFound ${'step'} ${name}`);
        return;
      }
      const iface_id = this.addIfaceById(step_data, 'step');
      if (step_data['base-class-name']) {
        this.addClassConfigItems(iface_id, step_data['base-class-name']);
      }
      (step_data.classes || []).forEach((class_data) => {
        class_data.name && this.addClassConfigItems(iface_id, class_data.name, class_data.prefix);
      });
      (step_data['config-items'] || []).forEach((item) => {
        if (items.findIndex((item2) => item2.name === item.name) === -1) {
          items.push(item);
        }
      });
    });
    return deepCopy(items);
  };

  private addClasses = (iface_id, classes_key, classes) => {
    let iface_data = this.iface_by_id[iface_id];
    if (!iface_data) {
      return;
    }

    iface_data[classes_key] = iface_data[classes_key] || [];
    classes.forEach(({ name, prefix = '' }) => {
      if (
        iface_data[classes_key].findIndex(
          ({ name: name2, prefix: prefix2 = '' }) => name === name2 && prefix === prefix2
        ) === -1
      ) {
        iface_data[classes_key].push({ name, prefix });
      }
    });
  };

  removeClasses = (iface_id, classes_key, classes) => {
    let iface_data = this.iface_by_id[iface_id];
    if (!iface_data) {
      return;
    }

    iface_data[classes_key] = (iface_data[classes_key] || []).filter(
      ({ name, prefix = '' }) =>
        classes.findIndex(
          ({ name: name2, prefix: prefix2 = '' }) => name === name2 && prefix === prefix2
        ) !== -1
    );
  };

  addClassNames = (classes) => {
    if (!classes) {
      return undefined;
    }

    return classes.map((class_data) => ({
      ...class_data,
      'class-name': class_data.name,
    }));
  };

  removeSpecificData = ({ iface_id, state_id, processor_id }) => {
    const iface = this.iface_by_id[iface_id];
    const specific_data_id = this.specificDataId(iface?.type, state_id, processor_id);
    if (specific_data_id && iface.specific_data?.[specific_data_id]) {
      delete iface.specific_data[specific_data_id];
    }
  };

  isConfigItemFieldSet = (params, field_name) => {
    const item = this.findConfigItem(params);
    if (!item) {
      return false;
    }

    const field_value = this.configItemInheritedData(item)[field_name];
    if (field_value === undefined) {
      return false;
    }

    const parent_field_value = this.parentConfigItemFieldValue(params, field_name);
    return field_value !== parent_field_value;
  };

  isConfigItemFieldSetByParent = (params, field_name) => {
    return this.parentConfigItemFieldValue(params, field_name) !== undefined;
  };

  parentConfigItemFieldValue = (params, field_name) => {
    const item = this.findConfigItem(params);
    if (!item?.parent) {
      return undefined;
    }

    const parent_name = item.parent['interface-name'];
    const parent_data = this.yaml_info.yamlDataByName('class', parent_name);
    if (!parent_data?.['config-items']) {
      return undefined;
    }

    const parent_item = parent_data['config-items'].find((item2) => item.name === item2.name);
    if (!parent_item) {
      return undefined;
    }

    const inherited_data = this.configItemInheritedData(parent_item);
    return inherited_data[field_name];
  };

  removeConfigItems = ({ iface_id, state_data: { id } }) => {
    this.iface_by_id[iface_id] = {};
    this.iface_by_id[iface_id].specific_data = {};
    this.iface_by_id[iface_id].specific_data[id] = {};
  };

  getConfigItems = (params) => {
    this.code_info.waitForPending(['yaml'], 500).then(() => this.getConfigItemsImpl(params));
  };

  private getConfigItemsImpl = ({
    'base-class-name': base_class_name,
    classes,
    requires,
    iface_id,
    iface_kind,
    steps,
    state_data = { id: undefined, class_name: undefined },
    processor_data = { pid: undefined, class_name: undefined },
  }) => {
    if (!iface_id) {
      return;
    }
    if (!['workflow', 'job', 'service', 'class', 'step', 'fsm', 'pipeline'].includes(iface_kind)) {
      return;
    }

    const { id: state_id, class_name: state_class_name } = state_data;
    const { pid: processor_id, class_name: processor_class_name } = processor_data;
    const specific_data_class_name = state_class_name || processor_class_name;
    const specific_data_id = this.specificDataId(iface_kind, state_id, processor_id);
    this.maybeInitIfaceId({ iface_id, iface_kind, state_id, processor_id });

    const classes_key = requires ? 'requires' : 'classes';
    let classes_or_requires = requires ? requires : classes;
    if (classes_or_requires) {
      classes_or_requires = this.addClassNames(classes_or_requires);
      this.addClasses(iface_id, classes_key, classes_or_requires);
    }

    const toYamlIfComplex = (value, type, is_templated_string = false) =>
      !is_templated_string && ['list', 'hash'].includes(type)
        ? jsyaml.safeDump(value).replace(/\r?\n$/, '')
        : value;

    if (base_class_name) {
      if (base_class_name !== this.iface_by_id[iface_id]['base-class-name']) {
        this.removeBaseClass({ iface_id, iface_kind });
      }
      this.addClassConfigItems(iface_id, base_class_name);
      this.iface_by_id[iface_id]['base-class-name'] = base_class_name;
    }
    if (classes_or_requires) {
      this.removeClassesConfigItems(iface_id, classes_or_requires);
      this.removeClasses(iface_id, classes_key, classes_or_requires);
    }
    (classes_or_requires || []).forEach((class_data) => {
      class_data.name && this.addClassConfigItems(iface_id, class_data.name, class_data.prefix);
    });

    if (specific_data_id) {
      const orig_specific_data_class_name =
        this.iface_by_id[iface_id].specific_data[specific_data_id].class_name;
      if (
        specific_data_class_name &&
        orig_specific_data_class_name &&
        specific_data_class_name !== orig_specific_data_class_name
      ) {
        this.removeClassFromSpecificData(iface_id, specific_data_id);
      }
      this.addClassConfigItems(iface_id, specific_data_class_name, '', specific_data_id);
      this.iface_by_id[iface_id].specific_data[specific_data_id].class_name =
        specific_data_class_name;
    }

    const default_type = defaultValue('type');

    const isTemplatedString = (level, item) =>
      (level === 'global' && item.is_global_value_templated_string) ||
      (level !== 'global' && item.is_value_templated_string);

    const valueTrueType = (item) =>
      item.type === 'any' && item.value_true_type ? item.value_true_type : item.type;

    const defaultValueTrueType = (item) =>
      item.type === 'any' && item.default_value_true_type
        ? item.default_value_true_type
        : item.type;

    const fixLocalItem = (item: any): any => {
      item.type = item.type || default_type;
      if (item.type[0] === '*') {
        item.type = item.type.substr(1);
        item.can_be_undefined = true;
      }

      if (item.allowed_values) {
        item.allowed_values = item.allowed_values.map((value) =>
          toYamlIfComplex(value, valueTrueType(item))
        );
      }

      if (item.value !== undefined) {
        item['local-value'] = item.value;
      }

      delete item.value;
      if (item.default_value !== undefined) {
        item.default_value = toYamlIfComplex(item.default_value, defaultValueTrueType(item));
        item.value = item.default_value;
        item.level = 'default';
        item.is_set = true;
        if (item.type === 'any' && item.default_value_true_type && !item.value_true_type) {
          item.value_true_type = item.default_value_true_type;
        }
      }

      for (const level of ['global', 'workflow', 'local']) {
        const key = level + '-value';
        if (item[key] !== undefined) {
          item.value = toYamlIfComplex(
            item[key],
            valueTrueType(item),
            isTemplatedString(level, item)
          );
          item.level = level === 'local' ? iface_kind : level;
          item.is_set = true;
        }
      }

      if (item.is_value_templated_string) {
        item.is_templated_string = true;
      }

      return item;
    };

    const checkValueLevel = (item: any, level: string): any => {
      if (item[level + '-value'] !== undefined) {
        item.is_templated_string = isTemplatedString(level, item);
        item.value = toYamlIfComplex(
          item[level + '-value'],
          valueTrueType(item),
          item.is_templated_string
        );
      } else {
        delete item.value;
        delete item.is_set;
        delete item.is_templated_string;
      }
      return item;
    };

    const checkParentConfigItem = (
      name: string,
      parent_type: string,
      parent_name: string
    ): boolean => {
      const parent_yaml_data = this.yaml_info.yamlDataByName(parent_type, parent_name);
      if (!parent_yaml_data) {
        return false;
      }

      const parent_item = parent_yaml_data['config-items'].find((item) => item.name === name);
      if (!parent_item) {
        return false;
      }
      if (!parent_item.parent) {
        return true;
      }

      return checkParentConfigItem(
        name,
        parent_item.parent['interface-type'],
        parent_item.parent['interface-name']
      );
    };

    const addYamlData = (item: any): any => {
      const toYamlIfNotComplex = (value, type = valueTrueType(item)) =>
        !item.is_templated_string && ['list', 'hash'].includes(type)
          ? value
          : jsyaml.safeDump(value).replace(/\r?\n$/, '');

      const hasNormalValue = (value) => typeof value !== 'undefined' && value !== undefined;

      let yaml_data_tag = {
        ...(hasNormalValue(item.value) ? { value: toYamlIfNotComplex(item.value) } : {}),
        ...(hasNormalValue(item.default_value)
          ? {
              default_value: toYamlIfNotComplex(item.default_value, defaultValueTrueType(item)),
            }
          : {}),
        ...(item.allowed_values
          ? {
              allowed_values: item.allowed_values.map((value) => toYamlIfNotComplex(value)),
            }
          : {}),
      };

      return { ...item, yamlData: yaml_data_tag };
    };

    let items: any[];
    if (iface_kind === 'workflow') {
      if (steps) {
        this.iface_by_id[iface_id].steps = steps;
      }
      items = this.workflowStepsConfigItems(this.iface_by_id[iface_id].steps).filter(
        (item) => !item.strictly_local
      );

      const workflow_values = this.iface_by_id[iface_id]['config-item-values'] || [];

      items.forEach((item) => {
        delete item.default_value;
        const workflow_value = workflow_values.find((item2) => item2.name === item.name);
        if (workflow_value !== undefined) {
          item['workflow-value'] = toYamlIfComplex(
            workflow_value.value,
            valueTrueType(item),
            workflow_value.is_value_templated_string
          );
          item.is_value_templated_string = workflow_value.is_value_templated_string;
        }
      });
    } else {
      if (specific_data_id) {
        const specific_data = this.iface_by_id[iface_id].specific_data[specific_data_id];
        items = [...(specific_data?.['config-items'] || [])];
      } else {
        items = [...(this.iface_by_id[iface_id]['config-items'] || [])];
      }
    }

    let local_items = (items || []).map((item) => fixLocalItem({ ...item }));

    let global_items = local_items
      .filter((item) => !item.strictly_local)
      .map((item) => checkValueLevel({ ...item }, 'global'));

    local_items = local_items.filter(
      (item) =>
        !item.parent ||
        checkParentConfigItem(
          item.name,
          item.parent['interface-type'],
          item.parent['interface-name']
        )
    );
    global_items = global_items.filter(
      (item) =>
        !item.parent ||
        checkParentConfigItem(
          item.name,
          item.parent['interface-type'],
          item.parent['interface-name']
        )
    );

    let message: any;
    if (iface_kind === 'workflow') {
      const workflow_items = local_items.map((item) => checkValueLevel({ ...item }, 'workflow'));

      message = {
        action: 'return-config-items',
        workflow_items: workflow_items.map((item) => addYamlData(item)),
      };
    } else {
      message = {
        action: 'return-config-items',
        items: local_items.map((item) => addYamlData(item)),
        global_items: global_items.map((item) => addYamlData(item)),
      };
    }

    qorus_webview.postMessage(message);
  };
}
