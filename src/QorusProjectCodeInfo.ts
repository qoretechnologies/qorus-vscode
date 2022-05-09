import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import * as jsyaml from 'js-yaml';
import {
  cloneDeep,
  filter,
  flattenDeep,
  isArray as lodashIsArray,
  isObject as lodashIsObject,
  size,
  sortBy,
} from 'lodash';
import * as path from 'path';
import { gettext, t } from 'ttag';
import * as vscode from 'vscode';
import * as globals from './global_config_item_values';
import { field } from './interface_creator/common_constants';
import { drafts_tree, otherFilesNames } from './QorusDraftsTree';
import { interface_tree } from './QorusInterfaceTree';
import { config_filename, projects, QorusProject } from './QorusProject';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusProjectInterfaceInfo } from './QorusProjectInterfaceInfo';
import { QorusProjectYamlInfo } from './QorusProjectYamlInfo';
import { qorus_request } from './QorusRequest';
import { qorus_webview } from './QorusWebview';
import {
  all_root_classes,
  default_lang,
  lang_inheritance,
  root_job,
  root_processor,
  root_service,
  root_steps,
  root_workflow,
  types_with_version,
} from './qorus_constants';
import * as msg from './qorus_message';
import { deepCopy, filesInDir, hasSuffix, isObject, removeDuplicates } from './qorus_utils';

const info_keys = ['file_tree', 'yaml', 'modules'];

const log_update_messages = false;

export class QorusProjectCodeInfo {
  private project: QorusProject;
  private iface_info: QorusProjectInterfaceInfo;
  private yaml_files_info: QorusProjectYamlInfo;
  private document_symbols_edit_info: QorusProjectEditInfo;

  private info_update_pending: any = {};
  private file_tree: any[] = [];
  private dir_tree: any[] = [];
  private all_dir_tree: any = {};
  private modules: string[] = [];
  public otherFiles: {
    path?: string;
    type?: string;
    name?: string;
  }[] = [];
  private source_directories = [];
  private mapper_types: any[] = [];
  private java_class_2_package = {};

  private all_files_watcher: vscode.FileSystemWatcher;
  private yaml_files_watcher: vscode.FileSystemWatcher;
  private module_files_watcher: vscode.FileSystemWatcher;
  private config_file_watcher: vscode.FileSystemWatcher;

  private notif_trees = [interface_tree, drafts_tree];

  private error_messages: any = {};

  constructor(project: QorusProject) {
    this.project = project;
    this.yaml_files_info = new QorusProjectYamlInfo();
    this.document_symbols_edit_info = new QorusProjectEditInfo();
    this.iface_info = new QorusProjectInterfaceInfo(this);
    this.initInfo();
    this.initFileWatchers();
    this.update(undefined, true);
  }

  get interface_info(): QorusProjectInterfaceInfo {
    return this.iface_info;
  }

  get yaml_info(): QorusProjectYamlInfo {
    return this.yaml_files_info;
  }

  get edit_info(): QorusProjectEditInfo {
    return this.document_symbols_edit_info;
  }

  getProject(): QorusProject {
    return this.project;
  }

  private notifyTrees() {
    this.notif_trees.forEach((tree) => tree.notify(this));
  }

  fileTree() {
    return this.file_tree;
  }

  otherFilesDataByType = (type: 'scripts' | 'schema-modules' | 'tests') => {
    // Filter other files by type
    let data = this.otherFiles.filter((f) => f.type === type);
    data = data.map(({ name, ...rest }) => ({ name, data: rest }));

    return sortBy(data, ['name']);
  };

  interfaceDataByType = (iface_kind) => {
    const yaml_data = this.yaml_info.yamlDataByType(iface_kind);
    const interfaces = Object.keys(yaml_data).map((name) => ({
      name,
      data: yaml_data[name],
    }));
    return sortBy(interfaces, ['name']);
  };

  getListOfInterfaces = (iface_kind) => {
    this.waitForPending(['yaml']).then(() => {
      const yaml_data = this.yaml_info.yamlDataByType(iface_kind);
      const interfaces = Object.keys(yaml_data).map((name) => ({
        name,
        desc: yaml_data[name].desc,
      }));

      qorus_webview.postMessage({
        action: 'return-list-of-interfaces',
        iface_kind: iface_kind,
        interfaces: sortBy(interfaces, ['name']),
      });
    });
  };

  getInterfaceData = ({ iface_kind, name, class_name, include_tabs, custom_data, request_id }) => {
    this.waitForPending(['yaml', 'edit_info']).then(() => {
      let raw_data;
      if (class_name) {
        raw_data = this.yaml_info.yamlDataByName('class', class_name);
      } else {
        const name_key = types_with_version.includes(iface_kind) ? name : name.split(/:/)[0];
        raw_data = this.yaml_info.yamlDataByName(iface_kind, name_key);
      }

      if (!raw_data) {
        const message = t`YamlDataNotFound ${iface_kind} ${name}`;
        msg.error(message);
        qorus_webview.postMessage({
          action: `return-interface-data${request_id ? '-complete' : ''}`,
          request_id,
          ok: false,
          message,
        });
        return;
      }

      const data = this.yaml2FrontEnd(raw_data);

      const iface_id = this.iface_info.addIfaceById(data, iface_kind);

      qorus_webview.postMessage({
        action: `return-interface-data${request_id ? '-complete' : ''}`,
        request_id,
        ok: true,
        data: {
          iface_kind,
          custom_data,
          [iface_kind]: { ...data, iface_id },
          ...(include_tabs
            ? {
                tab: 'CreateInterface',
                subtab: iface_kind,
              }
            : {}),
        },
      });
    });
  };

  getClassConnector = ({ class: class_name, connector: connector_name }) =>
    (this.yaml_info.yamlDataByName('class', class_name)?.['class-connectors'] || []).find(
      (connector) => connector.name === connector_name
    );

  pairFile = (file: string): string | undefined => {
    if (path.extname(file) === '.yaml') {
      return this.yaml_info.getSrcFile(file);
    }

    return (this.yaml_info.yamlDataBySrcFile(file) || {}).yaml_file;
  };

  getFilesOfReferencedObjects(files: string[]): string[] {
    let yaml_files: string[] = [];

    /* Iterating through the files and checking if the file extension is .yaml. If it is, it pushes the
    file to the yaml_files array. If it is not, it checks if the file is in the
    yaml_info.yamlDataBySrcFile(file) object. If it is, it pushes the yaml_file to the yaml_files
    array. */
    files.forEach((file) => {
      if (path.extname(file) === '.yaml') {
        yaml_files.push(file);
      } else {
        const yaml_file = (this.yaml_info.yamlDataBySrcFile(file) || {}).yaml_file;
        if (yaml_file) {
          yaml_files.push(yaml_file);
        }
      }
    });

    yaml_files = removeDuplicates(yaml_files);

    let referenced_yaml_files: string[] = [];

    /* Getting all the referenced yaml files. */
    yaml_files.forEach((yaml_file) => {
      const yaml_data = this.yaml_info.yamlDataByFile(yaml_file);
      const objects: any[] = this.getReferencedObjects(yaml_data);
      referenced_yaml_files = [
        ...referenced_yaml_files,
        yaml_file,
        ...objects.map((o) => o.yaml_file).filter((yaml_file) => !!yaml_file),
      ];
    });

    referenced_yaml_files = removeDuplicates(referenced_yaml_files);

    const all_referenced_files: string[] = [];

    /* Adding the yaml file and the source file to the list of all referenced files. */
    referenced_yaml_files.forEach((yaml_file) => {
      all_referenced_files.push(yaml_file);
      const src_file = this.yaml_info.getSrcFile(yaml_file);
      if (src_file) {
        all_referenced_files.push(src_file);
      }
    });

    return all_referenced_files;
  }

  stepData = (step_structure: any[]): any => {
    const step_names: string[] = flattenDeep(step_structure);
    const step_data = {};
    step_names.forEach((name) => {
      step_data[name] = { ...this.yaml_info.yamlDataByName('step', name) };
      delete step_data[name].yaml_file;
    });
    return step_data;
  };

  getMapperCodeMethods = (name) => {
    this.waitForPending(['yaml']).then(() => {
      const mapper_code = this.yaml_info.yamlDataByName('mapper-code', name);
      if (!mapper_code) {
        msg.log(t`MapperCodeNotFound ${name}`);
      }
      const methods = (mapper_code && mapper_code.methods) || [];
      qorus_webview.postMessage({
        action: 'return-mapper-code-methods',
        name,
        methods,
      });
    });
  };

  javaClassPackage = (class_name) => {
    if (this.java_class_2_package[class_name]) {
      return this.java_class_2_package[class_name];
    }

    const yaml_data = this.yaml_info.yamlDataByClass('class', class_name) || {};

    const { target_dir, target_file } = yaml_data;
    if (!target_dir || !target_file) {
      return class_name;
    }

    const file_path = path.join(target_dir, target_file);
    if (!fs.existsSync(file_path)) {
      return class_name;
    }

    const file_contents = fs.readFileSync(path.join(target_dir, target_file)).toString() || '';
    const file_lines = file_contents.split(/\r?\n/);

    for (const line of file_lines) {
      const match_result = line.match(/^package\s+(\S+);/);
      if (match_result) {
        return match_result[1];
      } else if (line.match(/\S/)) {
        break;
      }
    }

    return class_name;
  };

  getObjectsWithStaticData = ({ iface_kind }) => {
    const all_local_objects = this.yaml_info.yamlDataByType(iface_kind);
    const local_objects = Object.keys(all_local_objects)
      .filter((name) => all_local_objects[name]['staticdata-type'])
      .map((name) => ({ name }));

    const processResult = (result) => {
      const parsed_result = JSON.parse(result) || [];
      const qorus_objects = parsed_result.filter((obj) => obj.iface_kind === iface_kind);

      const objects = [...local_objects, ...qorus_objects].reduce((acc, obj) => {
        if (!acc.some(({ name }) => name === obj.name)) {
          acc.push({ name: obj.name });
        }
        return acc;
      }, []);

      const message = {
        action: 'return-objects-with-static-data',
        objects,
        iface_kind,
      };

      qorus_webview.postMessage(message);
    };
    /*
        const onSuccess = response => {
            processResult(response);
        };

        const onError = error => {
            msg.error(error);
            processResult(null);
        };

        qorus_request.doRequest('system/interfacesWithDataContext', 'GET', onSuccess, onError);
*/
    processResult(null);
  };

  getFieldsFromType = (message) => {
    const { name, path: path_in_data, url } = message;

    const postMessage = (data?) => {
      qorus_webview.postMessage({
        action: 'return-fields-from-type',
        data,
      });
    };

    const onSuccess = (response) => {
      const data = JSON.parse(response);
      postMessage(data);
    };

    const onError = (error) => {
      msg.error(error);
      postMessage();
    };

    this.waitForPending(['yaml']).then(() => {
      const type = this.yaml_info.yamlDataByName('type', path.join(name, path_in_data));
      if (type) {
        const { typeinfo } = type;
        if (typeinfo) {
          postMessage(typeinfo);
          return;
        }
      }

      qorus_request.doRequest(url, 'GET', onSuccess, onError);
    });
  };

  yaml2FrontEnd(orig_data: any): any {
    const data = deepCopy(orig_data);

    if (data.options) {
      data[data.type + '_options'] = data.options;
      delete data.options;
    }

    if (data.autostart) {
      data[data.type + '-autostart'] = data.autostart;
      delete data.autostart;
    }

    if (data.errors) {
      if (data.type === 'workflow') {
        const file_name = path.join(data.target_dir, data.errors);
        data.errors = this.yaml_info.yamlDataByYamlFile(file_name)?.name;
      }

      data[data.type + '_errors'] = data.errors;
      delete data.errors;
    }

    [
      'mappers',
      'value_maps',
      'vmaps',
      'author',
      'mapper-code',
      'groups',
      'events',
      'queues',
      'keylist',
    ].forEach((tag) => {
      if (data[tag]) {
        data[tag] = data[tag].map((name) => ({ name }));
      }
    });

    ['resource', 'text-resource', 'bin-resource', 'template'].forEach((tag) => {
      if (data[tag]) {
        data[tag] = data[tag].map((rel_path) => {
          const abs_path = path.resolve(data.target_dir, rel_path);
          return { name: abs_path };
        });
      }
    });

    if (data['api-manager']) {
      data['api-manager']['provider-options'].schema.value = path.resolve(
        data.target_dir,
        data['api-manager']['provider-options'].schema.value
      );
    }

    if (data['mapper-code']) {
      data.codes = data['mapper-code'];
      delete data['mapper-code'];
    }

    if (data['value-maps']) {
      Object.keys(data['value-maps']).forEach((key) => {
        data['value-maps'][key] = data['value-maps'][key].value;
      });
    }

    ['desc', 'description'].forEach((tag) => {
      if (data[tag]) {
        data[tag] = data[tag].replace(/^\"/, '');
        if (data[tag][data[tag].length - 2] !== '\\') {
          data[tag] = data[tag].replace(/\"$/, '');
        }
      }
    });

    if (data.fields) {
      Object.keys(data.fields).forEach((field_name) => {
        const field = data.fields[field_name];
        if (field.code) {
          const code_parts = field.code.split('::');
          if (code_parts.length === 2) {
            const [class_name, method] = code_parts;
            const mapper_code = this.yaml_info.yamlDataByName('mapper-code', class_name);
            if (mapper_code) {
              field.code = `${mapper_code.name}::${method}`;
            }
          }
        }

        Object.keys(field).forEach((key) => {
          const value = field[key];
          if (Array.isArray(value) || isObject(value)) {
            field[key] = jsyaml.safeDump(value, { indent: 4 });
          }
        });
      });
    }

    if (
      ['class', 'mapper-code'].includes(data.type) &&
      data['class-name'] &&
      data.name !== data['class-name']
    ) {
      data.name = data['class-name'];
    }

    const classes_or_requires = data.type === 'class' ? 'requires' : 'classes';
    if (data[classes_or_requires]) {
      const classes = (data['class-prefixes'] || []).map((prefix_data) => ({
        name: prefix_data.class,
        prefix: prefix_data.prefix,
      }));

      data[classes_or_requires].forEach((name) => {
        if (!classes.some((class_data) => class_data.name === name)) {
          classes.push({ name });
        }
      });

      data[classes_or_requires] = classes;
    }

    const array_of_pairs_fields = [
      'tags',
      'define-auth-label',
      'workflow_options',
      'statuses',
      'value-maps',
    ];
    array_of_pairs_fields.forEach((tag) => {
      if (!data[tag]) {
        return;
      }

      const [key_name, value_name] = field[tag].fields;
      const transformed_data = [];

      for (const key in data[tag]) {
        transformed_data.push({
          [key_name]: key,
          [value_name]: data[tag][key],
        });
      }

      data[tag] = transformed_data;
    });

    const fixConfigItems = (items: any[] | undefined) => {
      if (!items) {
        return;
      }

      items.forEach((item) => {
        if (!item.stricty_local) {
          const global_value = globals.get(item.name);
          if (global_value !== undefined) {
            item['global-value'] = global_value.value;
            item.is_global_value_templated_string = global_value.is_value_templated_string;
          }
        }

        if (data.type !== 'workflow' && item.value !== undefined) {
          item['local-value'] = item.value;
        }

        delete item.value;
      });
    };

    fixConfigItems(data['config-items']);

    const fixProcessors = (children: any[] = []) => {
      children.forEach((child) => {
        switch (child.type) {
          case 'queue':
            fixProcessors(child.children);
            break;
          case 'processor':
            fixConfigItems(child['config-items']);
            if (child.id) {
              child.pid = child.id;
              delete child.id;
            }
            break;
        }
      });
    };
    fixProcessors(data.children);

    const fixOptions = (data_with_options: any): any => {
      Object.keys(data_with_options.options || {}).forEach((option_key) => {
        const option = data_with_options.options[option_key];
        const option_type = option.type || '';
        if (option_type.indexOf('list') > -1 || option_type.indexOf('hash') > -1) {
          option.value = jsyaml.safeDump(option.value).replace(/\r?\n$/, '');
        }
      });

      return data_with_options;
    };

    ['staticdata-type', 'input-provider'].forEach((key) => {
      if (data[key]) {
        data[key] = fixOptions(data[key]);
      }
    });

    if (data.processor) {
      ['processor-input-type', 'processor-output-type'].forEach((key) => {
        if (data.processor[key]) {
          data.processor[key] = fixOptions(data.processor[key]);
        }
      });
    }

    (data['class-connectors'] || []).forEach((connector) => {
      ['input-provider', 'output-provider'].forEach((key) => {
        if (connector[key]) {
          connector[key] = fixOptions(connector[key]);
        }
      });
    });

    if (data.mapper_options) {
      ['mapper-input', 'mapper-output'].forEach((key) => {
        if (data.mapper_options[key]) {
          data.mapper_options[key] = fixOptions(data.mapper_options[key]);
        }
      });
    }

    const fixStates = (states: any = {}) => {
      Object.keys(states).forEach((id) => {
        fixConfigItems(states[id]['config-items']);

        ['input-type', 'output-type'].forEach((key) => {
          if (states[id][key]) {
            states[id][key] = fixOptions(states[id][key]);
          }
        });

        fixStates(states[id].states);
      });
    };
    fixStates(data.states);

    for (const method of data.methods || []) {
      if (method.author) {
        method.author = method.author.map((value) => ({ name: value }));
      }
    }

    if (data.type === 'mapper-code' && data.methods) {
      data['mapper-methods'] = data.methods;
      delete data.methods;
    }

    if (['class', 'mapper-code'].includes(data.type)) {
      data['class-class-name'] = data['class-name'] = data.name;
    }

    if (data.schedule) {
      const ordered_values = ['minutes', 'hours', 'days', 'months', 'dow'].map(
        (key) => data.schedule[key]
      );
      data.schedule = ordered_values.join(' ');
    }

    if (data.steps) {
      data['steps-info'] = this.stepData(data.steps);
    }

    if (data.type === 'step' && data['base-class-name']) {
      const step_type = this.stepType(data['base-class-name']);
      if (step_type) {
        data['step-type'] = step_type;
      }
    }

    if (!data.target_file && data.yaml_file) {
      data.target_file = path.basename(data.yaml_file);
    }

    return data;
  }

  sendErrorMessages(iface_id: string) {
    if (iface_id && this.error_messages[iface_id]?.referenced_objects.length) {
      qorus_webview.postMessage({
        action: 'display-notifications',
        data: this.error_messages[iface_id].referenced_objects,
      });
    }
  }

  checkReferencedObjects(iface_id: string, iface_data: any) {
    const messages: any = {};

    const addMessage = (message: string) => {
      messages[message] = true;
      msg.error(message);
    };

    const checkObject = (type, name): boolean => {
      if (!name) {
        return true;
      }

      if (name.name) {
        name = name.name;
      }

      if (type === 'class' && QorusProjectCodeInfo.isRootBaseClass(name)) {
        return true;
      }

      const yaml_data = this.yaml_info.yamlDataByName(type, name);
      if (!yaml_data) {
        addMessage(t`ReferencedObjectNotFound ${type} ${name}`);
        return false;
      }

      return true;
    };

    const removeUnknownObject = (data: any, key: string, type: string) => {
      if (data[key] && !checkObject(type, data[key])) {
        delete data[key];
      }
    };

    const removeUnknownObjectsFromList = (data: any, key: string, type: string) => {
      if (data[key]) {
        data[key] = data[key].filter((name) => checkObject(type, name));
      }
    };

    const checkParentConfigItem = (
      name: string,
      parent_type: string,
      parent_name: string
    ): boolean => {
      const parent_yaml_data = this.yaml_info.yamlDataByName(parent_type, parent_name);
      if (!parent_yaml_data) {
        addMessage(t`AncestorDoesNotExist ${parent_type} ${parent_name} ${name}`);
        return false;
      }

      const parent_item = parent_yaml_data['config-items'].find((item) => item.name === name);
      if (!parent_item) {
        addMessage(t`AncestorDoesNotHaveConfigItem ${parent_type} ${parent_name} ${name}`);
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

    const checkIfaceData = (data: any) => {
      removeUnknownObject(data, 'base-class-name', 'class');
      removeUnknownObject(data, 'queue', 'queue');
      removeUnknownObject(data, 'event', 'event');
      if (data.type === 'workflow') {
        removeUnknownObject(data, 'errors', 'errors');
      }

      removeUnknownObjectsFromList(data, 'classes', 'class');
      removeUnknownObjectsFromList(data, 'requires', 'class');
      removeUnknownObjectsFromList(data, 'mappers', 'mapper');
      removeUnknownObjectsFromList(data, 'groups', 'group');
      removeUnknownObjectsFromList(data, 'fsm', 'fsm');
      removeUnknownObjectsFromList(data, 'vmaps', 'value-map');

      Object.keys(data['class-connections'] || {}).forEach((connection) => {
        let connectors = data['class-connections'][connection];
        connectors = connectors.filter((connector) => checkObject('class', connector.class));
      });

      if (data['config-items']) {
        data['config-items'] = data['config-items'].filter(
          (item) =>
            !item.parent ||
            checkParentConfigItem(
              item.name,
              item.parent['interface-type'],
              item.parent['interface-name']
            )
        );
      }

      Object.keys(data.states || {}).forEach((state_id) => {
        const state = data.states[state_id];
        if (['mapper', 'pipeline', 'connector'].includes(state.action?.type)) {
          let action_type;
          let action_value;
          switch (state.action.type) {
            case 'connector':
              action_type = 'class';
              action_value = state.action.value.class;
              break;
            default:
              action_type = state.action.type;
              action_value = state.action.value;
          }
          if (!checkObject(action_type, action_value)) {
            delete state.action;
          }
        }
      });

      if (data.steps) {
        const step_names: string[] = flattenDeep(data.steps);
        step_names.forEach((name_version) => checkObject('step', name_version));
      }
    };

    checkIfaceData(iface_data);

    if (!this.error_messages[iface_id]) {
      this.error_messages[iface_id] = {};
    }
    this.error_messages[iface_id].referenced_objects = Object.keys(messages).map((message) => ({
      intent: 'danger',
      message,
      timeout: 20000,
    }));
  }

  private getReferencedObjects(iface_data: any): any[] {
    const result: any[] = [];

    const checkObject = (type, name) => {
      if (!name) {
        return;
      }

      if (name.name) {
        name = name.name;
      }

      if (type === 'class' && QorusProjectCodeInfo.isRootBaseClass(name)) {
        return;
      }

      const yaml_data = this.yaml_info.yamlDataByName(type, name);
      if (!yaml_data) {
        return;
      }

      result.push({ type, name, ...yaml_data });
      getObjects(yaml_data);
    };

    const checkObjects = (type: string, names?: any[]) => {
      (names || []).forEach((item) => {
        // We need to check if the item is a string or an object
        if (typeof item === 'string') {
          checkObject(type, item);
        } else if (item.name) {
          checkObject(type, item.name);
        }
      });
    };

    const checkParentConfigItem = (name: string, parent_type: string, parent_name: string) => {
      const parent_yaml_data = this.yaml_info.yamlDataByName(parent_type, parent_name);
      if (!parent_yaml_data) {
        return;
      }

      result.push({ parent_type, parent_name, data: parent_yaml_data });
      getObjects(parent_yaml_data);

      const parent_item = parent_yaml_data['config-items'].find((item) => item.name === name);
      if (!parent_item?.parent) {
        return;
      }

      checkParentConfigItem(
        name,
        parent_item.parent['interface-type'],
        parent_item.parent['interface-name']
      );
    };

    const getObjects = (data: any) => {
      checkObject('class', data['base-class-name']);
      checkObject('event', data.event);
      checkObject('queue', data.queue);
      if (data.type === 'workflow' && data.errors) {
        const file_name = path.join(data.target_dir, data.errors);
        const object_name = this.yaml_info.yamlDataByYamlFile(file_name)?.name;
        checkObject('errors', object_name);
      }

      if (data.type === 'pipeline') {
        const checkPipelineClasses = (pipeline: any) => {
          (pipeline.children || []).forEach((child) => {
            if (child.type === 'processor') {
              checkObject('class', child.name);
            }

            checkPipelineClasses(child);
          });
        };

        checkPipelineClasses(data);
      }

      checkObjects('class', data.classes);
      checkObjects('class', data.requires);
      checkObjects('mapper', data.mappers);
      checkObjects('group', data.groups);
      checkObjects('fsm', data.fsm);
      checkObjects('value-map', data.vmaps);

      if (data.type === 'service' && data['api-manager']) {
        // Add the schema to other files to be deployed
        result.push({
          yaml_file: path.resolve(
            data.target_dir,
            data['api-manager']?.['provider-options']?.schema?.value
          ),
        });

        data['api-manager'].endpoints.forEach((endpoint) => {
          if (endpoint.type === 'fsm') {
            checkObject('fsm', endpoint.value);
          }
        });
      }

      /* Checking if the class exists in the data object. */
      Object.keys(data['class-connections'] || {}).forEach((connection) => {
        const connectors = data['class-connections'][connection];
        connectors.forEach((connector) => checkObject('class', connector.class));
      });

      /* Checking the type of the action.type and action.value. */
      Object.keys(data.states || {}).forEach((state_id) => {
        const state = data.states[state_id];
        if (['mapper', 'pipeline'].includes(state.action?.type)) {
          checkObject(state.action.type, state.action.value);
        }
        if (['connector'].includes(state.action?.type)) {
          checkObject('class', state.action.value.class);
        }
      });

      if (data.steps) {
        const step_names: string[] = flattenDeep(data.steps);
        step_names.forEach((name_version) => checkObject('step', name_version));
      }

      (data['config-items'] || []).forEach(
        (item) =>
          item.parent &&
          checkParentConfigItem(
            item.name,
            item.parent['interface-type'],
            item.parent['interface-name']
          )
      );
    };

    getObjects(iface_data);

    return result;
  }

  private initInfo() {
    this.file_tree = [];
    this.dir_tree = [];

    this.yaml_info.initData();
  }

  private initFileWatchers() {
    this.all_files_watcher = vscode.workspace.createFileSystemWatcher('**/*');
    this.all_files_watcher.onDidCreate(() => this.update(['file_tree', 'other_files']));
    this.all_files_watcher.onDidDelete(() => this.update(['file_tree', 'other_files']));

    this.yaml_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.yaml');
    this.yaml_files_watcher.onDidCreate((uri: vscode.Uri) => this.addSingleYamlInfo(uri.fsPath));
    this.yaml_files_watcher.onDidChange(() => this.update(['yaml']));
    this.yaml_files_watcher.onDidDelete(() => this.update(['yaml']));

    this.module_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.qm');
    this.module_files_watcher.onDidCreate(() => this.update(['modules']));
    this.module_files_watcher.onDidDelete(() => this.update(['modules']));

    this.config_file_watcher = vscode.workspace.createFileSystemWatcher('**/' + config_filename);
    this.config_file_watcher.onDidCreate(() => this.checkSourceDirectoriesChange());
    this.config_file_watcher.onDidChange(() => this.checkSourceDirectoriesChange());
    this.config_file_watcher.onDidDelete(() => this.initInfo());
  }

  private checkSourceDirectoriesChange = () => {
    this.project.validateConfigFileAndDo((file_data) => {
      const new_source_directories = file_data.source_directories || [];

      let any_added = false;
      const any_removed = this.source_directories.some(
        (dir) => !new_source_directories.includes(dir)
      );

      if (any_removed) {
        this.initInfo();
      } else {
        any_added = new_source_directories.some((dir) => !this.source_directories.includes(dir));
      }

      if (any_removed || any_added) {
        this.update();
      }
    });
  };

  async waitForPending(info_list: string[], sleep_before = 0, timeout = 30000): Promise<void> {
    // "waiting for pending" need not be enough, specifically in cases when the updated info is required
    // before the update process has even started (before the pending flag has been set),
    // this can happen when the update process is triggered by a file watcher
    if (sleep_before) {
      await new Promise((resolve) => setTimeout(resolve, sleep_before));
    }

    let interval_id: any;
    const interval = 100;
    let n = timeout / interval;

    return new Promise((resolve) => {
      const checkPending = () => {
        const pending_list = info_list.filter((key) => this.info_update_pending[key]);
        if (!pending_list.length || !--n) {
          clearInterval(interval_id);
          if (n === 0) {
            msg.error(
              t`CodeInfoUpdateTimedOut` +
                pending_list.map((key) => gettext(key + '_info_update_pending')).join(', ')
            );
            pending_list.forEach((key) => this.setPending(key, false));
          }
          resolve();
        }
      };

      interval_id = setInterval(checkPending, interval);
    });
  }

  setCurrentQorusData = () => {
    this.setMapperTypes();
  };

  private setMapperTypes = () => {
    qorus_request.doRequest('mappertypes', 'GET', (response) => {
      const result = JSON.parse(response);
      if (Array.isArray(result)) {
        this.mapper_types = result.map((type) => ({ name: type.name, desc: type.desc }));
      }
    });
  };

  getObjects = (params: any) => {
    const { object_type, iface_kind, class_name, custom_data } = params;
    const lang = params.lang || default_lang; // null comes from the frontend

    const maybeSortObjects = (objects: any): any => {
      // For now, only arrays will be sorted
      if (lodashIsArray(objects)) {
        // Check if this collection is made of objects or strings
        if (objects.every((obj: any) => lodashIsObject(obj))) {
          // Collection of objects, sort sort them by name
          return sortBy(objects, ['name']);
        } else {
          // Collections of anything else, sort by identity
          return sortBy(objects);
        }
      }
      // Not an array, return the untransformed object
      return objects;
    };

    const postMessage = (return_type: string, objects: any, sort = true) => {
      qorus_webview.postMessage({
        action: 'creator-return-' + return_type,
        object_type,
        [return_type]: sort ? maybeSortObjects(objects) : objects,
      });
    };

    switch (object_type) {
      case 'workflow-step':
      case 'mapper-code':
      case 'class':
        this.waitForPending(['yaml']).then(() => {
          const objects = this.yaml_info.yamlDataByType(
            object_type === 'workflow-step' ? 'step' : object_type
          );
          postMessage(
            'objects',
            Object.keys(objects).map((key) => ({
              name: key,
              desc: objects[key].desc,
            }))
          );
        });
        break;
      case 'class-with-connectors':
        this.waitForPending(['yaml']).then(() => {
          const { connector_type } = custom_data || {};
          const isAnyConnectorOfType = (
            connectors: { name: string; method: string; type: string }[]
          ): boolean =>
            connector_type
              ? connectors.some((connector) => connector_type.includes(connector.type))
              : true;
          const classes = filter(
            this.yaml_info.yamlDataByType('class'),
            ({ 'class-connectors': class_connectors }) => {
              if (
                !class_connectors ||
                !size(class_connectors) ||
                !isAnyConnectorOfType(class_connectors)
              ) {
                return false;
              }

              return true;
            }
          ).map(({ name, desc, ...rest }) => ({
            name,
            desc,
            'class-connectors': rest['class-connectors'],
          }));
          postMessage('objects', classes);
        });
        break;
      case 'class-with-processor':
        this.waitForPending(['yaml']).then(() => {
          const classes = filter(this.yaml_info.yamlDataByType('class'), ({ processor }) => {
            return !!processor;
          }).map(({ name, desc, ...rest }) => ({
            name,
            desc,
            processor: rest.processor,
          }));
          postMessage('objects', classes);
        });
        break;
      case 'service-base-class':
        this.waitForPending(['yaml']).then(() =>
          postMessage(
            'objects',
            this.addDescToClasses(this.yaml_info.serviceClasses(lang), [root_service])
          )
        );
        break;
      case 'job-base-class':
        this.waitForPending(['yaml']).then(() =>
          postMessage('objects', this.addDescToClasses(this.yaml_info.jobClasses(lang), [root_job]))
        );
        break;
      case 'workflow-base-class':
        this.waitForPending(['yaml']).then(() =>
          postMessage(
            'objects',
            this.addDescToClasses(this.yaml_info.workflowClasses(lang), [root_workflow])
          )
        );
        break;
      case 'step-base-class':
        this.waitForPending(['yaml']).then(() => {
          const step_classes = this.yaml_info.allStepClasses(lang);

          let result = this.addDescToClasses(step_classes, root_steps);
          if (iface_kind === 'step' && class_name) {
            result = result.filter(
              ({ name }) => !this.yaml_info.isDescendantOrSelf(class_name, name, lang)
            );
          }

          postMessage('objects', result);
        });
        break;
      case 'base-class':
        this.waitForPending(['yaml']).then(() => {
          const classes = this.yaml_info.yamlDataByType('class');

          let user_classes = Object.keys(classes)
            .filter((key) => lang_inheritance[lang].includes(classes[key].lang || default_lang))
            .map((key) => ({
              name: key,
              desc: classes[key].desc,
            }));

          if (iface_kind === 'class' && class_name) {
            user_classes = user_classes.filter(
              ({ name }) => !this.yaml_info.isDescendantOrSelf(class_name, name, lang)
            );
          }

          const qorus_root_classes = this.addDescToClasses(all_root_classes, all_root_classes);

          postMessage('objects', [...user_classes, ...qorus_root_classes]);
        });
        break;
      case 'processor-base-class':
        this.waitForPending(['yaml']).then(() =>
          postMessage(
            'objects',
            this.addDescToClasses(this.yaml_info.processorClasses(lang), [root_processor])
          )
        );
        break;
      case 'author':
        this.waitForPending(['yaml']).then(() =>
          postMessage('objects', this.yaml_info.getAuthors())
        );
        break;
      case 'mapper':
      case 'value-map':
      case 'group':
      case 'event':
      case 'queue':
      case 'type':
      case 'fsm':
      case 'pipeline':
      case 'errors':
        this.waitForPending(['yaml']).then(() =>
          postMessage(
            'objects',
            Object.keys(this.yaml_info.yamlDataByType(object_type)).map((name) => ({
              name,
            }))
          )
        );
        break;
      case 'module':
        this.waitForPending(['modules']).then(() =>
          postMessage(
            'objects',
            this.modules.map((name) => ({ name }))
          )
        );
        break;
      case 'resource':
      case 'text-resource':
      case 'bin-resource':
      case 'template':
      case 'files':
        this.waitForPending(['file_tree']).then(() =>
          postMessage('resources', this.file_tree, false)
        );
        break;
      case 'target_dir':
        this.waitForPending(['file_tree'], 800).then(() =>
          postMessage('directories', this.dir_tree, false)
        );
        break;
      case 'all_dirs':
        this.waitForPending(['file_tree'], 1000).then(() =>
          qorus_webview.postMessage({
            action: 'return-all-directories',
            directories: this.all_dir_tree,
          })
        );
        break;
      case 'mapper-type':
        postMessage('objects', this.mapper_types);
        break;
      default:
        msg.error(t`UnknownInterfaceProperty ${object_type}`);
    }
  };

  private logUpdateMessage(info_key: string) {
    if (!log_update_messages) {
      return;
    }
    const update = gettext(info_key + '_info_update_pending');
    const is_pending = this.info_update_pending[info_key];
    msg.log(
      update + ': ' + ' '.repeat(45 - update.length) + (is_pending ? t`pending` : t`finished`)
    );
  }

  static isRootBaseClass = (base_class_name) => all_root_classes.includes(base_class_name);

  public update = (info_list: string[] = info_keys, is_initial_update = false) => {
    this.project.validateConfigFileAndDo((file_data) => {
      if (is_initial_update) {
        info_keys.forEach((key) => this.setPending(key, true, true));
      }

      if (info_list.includes('file_tree')) {
        setTimeout(() => {
          this.updateFileTree(file_data.source_directories);
          this.notifyTrees();
        }, 0);
      }

      if (file_data.source_directories.length === 0) {
        info_keys.forEach((key) => key !== 'file_tree' && this.setPending(key, false));
        return;
      }

      if (is_initial_update) {
        msg.log(t`CodeInfoUpdateStarted ${this.project.folder}` + ' ' + new Date().toString());
      }

      if (info_list.includes('yaml')) {
        setTimeout(() => {
          this.updateYamlInfo(file_data.source_directories);
        }, 0);
      }
      if (info_list.includes('modules')) {
        setTimeout(() => {
          this.updateModuleInfo(file_data.source_directories);
        }, 0);
      }
      if (info_list.includes('other_files')) {
        setTimeout(() => {
          this.updateOtherFilesInfo(file_data.source_directories);
        }, 0);
      }

      if (is_initial_update) {
        let interval_id: any;
        let sec = 0;
        const checkPending = () => {
          if (log_update_messages) {
            msg.log(t`seconds ${++sec}`);
          }
          if (!info_keys.map((key) => this.info_update_pending[key]).some((value) => value)) {
            msg.log(t`CodeInfoUpdateFinished ${this.project.folder}` + ' ' + new Date().toString());
            clearInterval(interval_id);
          }
        };

        interval_id = setInterval(checkPending, 1000);
      }
    });
  };

  stepType = (base_class: string): string | undefined => {
    for (const step_type of root_steps) {
      if (this.yaml_info.stepClasses(step_type)[base_class]) {
        return step_type;
      }
    }
    return undefined;
  };

  setFields = ({ 'base-class-name': base_class_name, iface_id, iface_kind }) => {
    if (!base_class_name || iface_kind !== 'step') {
      return;
    }

    const addField = (field) =>
      qorus_webview.postMessage({ action: 'creator-add-field', field, iface_id, iface_kind });

    const removeField = (field) =>
      qorus_webview.postMessage({
        action: 'creator-remove-field',
        field,
        iface_id,
        iface_kind,
      });

    switch (this.stepType(base_class_name)) {
      case 'QorusEventStep':
      case 'QorusEventArrayStep':
        addField('event');
        removeField('queue');
        break;
      case 'QorusAsyncStep':
      case 'QorusAsyncArrayStep':
        addField('queue');
        removeField('event');
        break;
      default:
        removeField('queue');
        removeField('event');
        break;
    }
  };

  private addSingleYamlInfo(file: string) {
    this.setPending('yaml', true);
    this.yaml_info.addSingleYamlInfo(file);
    this.yaml_info.baseClassesFromInheritancePairs();
    this.setPending('yaml', false);
  }

  private updateYamlInfo(source_directories: string[]) {
    this.setPending('yaml', true);
    this.yaml_info.initData();
    for (const dir of source_directories) {
      const full_dir = path.join(this.project.folder, dir);
      if (!fs.existsSync(full_dir)) {
        continue;
      }

      const files = filesInDir(full_dir, (path) => hasSuffix(path, 'yaml'));
      for (const file of files) {
        this.yaml_info.addSingleYamlInfo(file);
      }
    }
    this.notifyTrees();
    this.yaml_info.baseClassesFromInheritancePairs();
    this.setPending('yaml', false);
  }

  private updateModuleInfo(source_directories: string[]) {
    this.setPending('modules', true);
    const modules: any = {};
    for (const dir of source_directories) {
      const full_dir = path.join(this.project.folder, dir);
      if (!fs.existsSync(full_dir)) {
        continue;
      }

      const files = filesInDir(full_dir, (path) => hasSuffix(path, 'qm'));
      for (const file of files) {
        modules[file] = true;
      }
    }
    this.modules = Object.keys(modules).map((file_path) => path.basename(file_path, '.qm'));
    this.setPending('modules', false);
  }

  private getFileType(ext: string) {
    switch (ext) {
      case '.qsm':
        return 'schema-modules';
      case '.qscript':
        return 'scripts';
      case '.qtest':
        return 'tests';
      default:
        return '';
    }
  }

  private updateOtherFilesInfo(source_directories: string[]) {
    this.setPending('otherFiles', true);

    const otherFiles: any = {};

    for (const dir of source_directories) {
      const full_dir = path.join(this.project.folder, dir);
      if (!fs.existsSync(full_dir)) {
        continue;
      }

      const files = filesInDir(
        full_dir,
        (path) => hasSuffix(path, 'qsm') || hasSuffix(path, 'qscript') || hasSuffix(path, 'qtest')
      );
      for (const file of files) {
        otherFiles[file] = true;
      }
    }

    /* The above code is creating a list of all the files in the directory that end with .qsm,
    .qscript, or .qtest. */
    this.otherFiles = Object.keys(otherFiles).map((file_path) => ({
      path: file_path,
      // Get the file_path extension
      ext: path.extname(file_path),
      type: this.getFileType(path.extname(file_path)),
      // Get the file_path basename
      name: path.basename(file_path, path.extname(file_path)),
    }));
    this.setPending('otherFiles', false);
  }

  private addDescToClasses(base_classes: any, root_classes: string[] = []): any[] {
    if (!Array.isArray(base_classes)) {
      return this.addDescToClasses(Object.keys(base_classes), root_classes);
    }

    const ret_val = [];
    for (const base_class of base_classes) {
      const desc = root_classes.includes(base_class)
        ? gettext(`${base_class}Desc`)
        : (this.yaml_info.yamlDataByName('class', base_class) || {}).desc;
      ret_val.push({ name: base_class, desc });
    }
    return ret_val;
  }

  setPending(info_key: string, value: boolean, never_message = false) {
    this.info_update_pending[info_key] = value;
    if (!never_message) {
      this.logUpdateMessage(info_key);
    }
  }

  private updateFileTree(source_directories: string[]) {
    this.setPending('file_tree', true);
    const dirItem = (abs_path: string, only_dirs: boolean, is_root_item = false) => {
      const rel_path = this.project.relativeDirPath(abs_path);
      return {
        abs_path,
        rel_path,
        basename: is_root_item ? rel_path : path.basename(abs_path),
        dirs: [],
        ...(only_dirs ? {} : { files: [] }),
      };
    };

    const subDirRecursion = (tree_item: any, only_dirs: boolean) => {
      const dir_entries: string[] = fs.readdirSync(tree_item.abs_path).sort();
      for (const entry of dir_entries) {
        if (entry[0] === '.') {
          continue;
        }
        const entry_path: string = path.join(tree_item.abs_path, entry);
        if (fs.lstatSync(entry_path).isDirectory()) {
          const dir_item = dirItem(entry_path, only_dirs);
          tree_item.dirs.push(dir_item);
          subDirRecursion(dir_item, only_dirs);
        } else if (!only_dirs) {
          tree_item.files.push({
            abs_path: tree_item.abs_path,
            rel_path: vscode.workspace.asRelativePath(tree_item.abs_path, false),
            basename: entry,
            name: entry,
          });
        }
      }
    };

    const file_tree: any[] = [];
    const dir_tree: any[] = [];

    for (const dir of source_directories.sort()) {
      const file_tree_root = dirItem(path.join(this.project.folder, dir), false, true);
      file_tree.push(file_tree_root);
      subDirRecursion(file_tree_root, false);

      const dir_tree_root = dirItem(path.join(this.project.folder, dir), true, true);
      dir_tree.push(dir_tree_root);
      subDirRecursion(dir_tree_root, true);
    }

    const all_dir_tree: any = [];
    const all_dir_tree_root = dirItem(this.project.folder, true);
    all_dir_tree.push(all_dir_tree_root);
    subDirRecursion(all_dir_tree_root, true);

    this.file_tree = file_tree;
    this.dir_tree = dir_tree;
    this.all_dir_tree = all_dir_tree;
    this.setPending('file_tree', false);
  }

  getMappers = ({ 'input-condition': input_condition, 'output-condition': output_condition }) => {
    this.waitForPending(['yaml']).then(() => {
      const all_mappers: any[] = Object.keys(this.yaml_info.yamlDataByType('mapper')).map((name) =>
        this.yaml2FrontEnd(this.yaml_info.yamlDataByName('mapper', name))
      );

      const filtered_mappers = all_mappers
        .filter((mapper) => {
          if (!mapper.mapper_options) {
            return false;
          }

          const input = mapper.mapper_options['mapper-input'];
          const output = mapper.mapper_options['mapper-output'];

          if (!input || !output) {
            return false;
          }

          return (
            (!input_condition?.name || input_condition.name === input.name) &&
            (!input_condition?.type || input_condition.type === input.type) &&
            (!output_condition?.name || output_condition.name === output.name) &&
            (!output_condition?.type || output_condition.type === output.type) &&
            (!output_condition?.subtype || output_condition.subtype === output.subtype) &&
            (!output_condition?.path || output_condition.path === output.path)
          );
        })
        .map((mapper) => ({
          ...mapper,
          name: `${mapper.name}:${mapper.version}`,
        }));

      qorus_webview.postMessage({
        action: 'return-mappers',
        mappers: filtered_mappers,
      });
    });
  };

  deleteInterfaceFromWebview = ({ iface_kind, name }) => {
    const iface_data = this.yaml_info.yamlDataByName(iface_kind, name);
    QorusProjectCodeInfo.deleteInterface({ iface_kind, iface_data });
  };

  static deleteInterface = ({ iface_kind, iface_data }) => {
    iface_data = iface_data || {};
    const yaml_file = iface_data.yaml_file;
    const code_file =
      iface_data.target_dir &&
      iface_data.target_file &&
      path.join(iface_data.target_dir, iface_data.target_file);

    if (yaml_file) {
      fs.unlink(yaml_file, (err) => {
        if (err) {
          msg.warning(t`FailedDeletingIfaceMetaFile ${iface_kind} ${yaml_file} ${err}`);
        } else {
          msg.info(t`DeletedIfaceMetaFile ${iface_kind} ${yaml_file}`);
        }
      });
    }

    if (code_file) {
      fs.unlink(code_file, (err) => {
        if (err) {
          msg.warning(t`FailedDeletingIfaceCodeFile ${iface_kind} ${code_file} ${err}`);
        } else {
          msg.info(t`DeletedIfaceCodeFile ${iface_kind} ${code_file}`);
        }
      });
    }
  };

  static duplicateInterface = ({ iface_kind, iface_data }) => {
    // Check if the file is other file
    if (otherFilesNames.includes(iface_data.type)) {
      // Get the extension of the path
      const ext = path.extname(iface_data.path);
      // replace the extension with timestamp
      const new_path = iface_data.path.replace(ext, `_${Date.now()}${ext}`);
      // Simply duplicate the file with new timestamp
      try {
        fsExtra.copySync(iface_data.path, new_path, { overwrite: false, errorOnExist: true });
      } catch (err) {
        msg.warning(t`FailedDuplicatingIfaceCodeFile ${iface_kind} ${iface_data.path} ${err}`);
        return;
      }

      drafts_tree.refresh();
      // Open the interface
      vscode.commands.executeCommand('qorus.views.openInterface', {
        data: {
          ...iface_data,
          path: new_path,
        },
      });

      return;
    }

    iface_data = iface_data || {};
    const yaml_file: string = iface_data.yaml_file;
    const code_file =
      iface_data.target_dir &&
      iface_data.target_file &&
      path.join(iface_data.target_dir, iface_data.target_file);

    const timestamp = Date.now();

    const buildCodeFileName = (path) => {
      // Split the file name by . and get the last 2 items from the list
      const [langOrFileExt, maybeFileExt, ...paths] = path.split('.').reverse();

      // if the first extension is a lang extension (py or java) we have to add the timestamp before the file qorus file extension
      if (langOrFileExt === 'py' || langOrFileExt === 'java') {
        return `${paths.reverse().join('.')}_${timestamp}.${maybeFileExt}.${langOrFileExt}`;
      }

      return `${size(paths) ? `${paths.reverse().join('.')}.` : ''}${
        maybeFileExt ? `${maybeFileExt}` : ''
      }_${timestamp}.${langOrFileExt}`;
    };

    if (yaml_file) {
      // Split the file name by . and get the last 2 items from the list
      const [yamlExt, fileExt, ...paths] = yaml_file.split('.').reverse();
      const new_yaml_file = `${paths.reverse().join('.')}_${timestamp}.${fileExt}.${yamlExt}`;
      // Get the yaml data
      const oldYamlData = projects.currentProjectCodeInfo().yaml_info.yamlDataByYamlFile(yaml_file);
      const newYamlData = cloneDeep(oldYamlData);

      newYamlData.name = `${newYamlData.name}_${timestamp}`;
      newYamlData.yaml_file = new_yaml_file;

      // Get the yaml_file contents
      const yaml_contents: string = fs.readFileSync(yaml_file, 'utf8');
      // Replace the name in the yaml contents with the new name
      let new_yaml_contents = yaml_contents.replace(oldYamlData.name, newYamlData.name);
      new_yaml_contents = new_yaml_contents.replace(oldYamlData.yaml_file, newYamlData.yaml_file);

      if (oldYamlData.code) {
        const newCode = buildCodeFileName(oldYamlData.code);
        const new_code_file = buildCodeFileName(code_file);

        newYamlData.code = newCode;
        newYamlData.target_file = newCode;
        // Replace the code file name with the new name
        new_yaml_contents = new_yaml_contents.replace(oldYamlData.code, newYamlData.code);
        new_yaml_contents = new_yaml_contents.replace(
          oldYamlData.target_file,
          newYamlData.target_file
        );

        try {
          fsExtra.copySync(code_file, new_code_file, { overwrite: false, errorOnExist: true });
        } catch (err) {
          msg.warning(t`FailedDuplicatingIfaceCodeFile ${iface_kind} ${code_file} ${err}`);
          return;
        }
      }

      try {
        fs.writeFileSync(new_yaml_file, new_yaml_contents);
      } catch (err) {
        msg.warning(t`FailedDuplicatingIfaceMetaFile ${iface_kind} ${yaml_file} ${err}`);
        return;
      }

      let edit_iface_kind;

      if (newYamlData) {
        delete newYamlData.show_steps;
        switch (newYamlData.type) {
          case 'workflow-steps':
            newYamlData.show_steps = true;
            edit_iface_kind = 'workflow';
            break;
          case 'service-methods':
            newYamlData.active_method = 1;
            edit_iface_kind = 'service';
            break;
          case 'mapper-code-methods':
            newYamlData.active_method = 1;
            edit_iface_kind = 'mapper-code';
            break;
          default:
            edit_iface_kind = newYamlData.type;
        }

        vscode.commands.executeCommand('qorus.editInterface', newYamlData, edit_iface_kind);
      }
      drafts_tree.refresh();
    }
  };
}
