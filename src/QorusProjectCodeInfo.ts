import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as filter from 'lodash/filter';
import * as flattenDeep from 'lodash/flattenDeep';
import * as lodashIsArray from 'lodash/isArray';
import * as lodashIsObject from 'lodash/isObject';
import * as size from 'lodash/size';
import * as sortBy from 'lodash/sortBy';
import * as path from 'path';
import { gettext, t } from 'ttag';
import * as vscode from 'vscode';
import * as globals from './global_config_item_values';
import { field } from './interface_creator/common_constants';
import { interface_tree } from './QorusInterfaceTree';
import { config_filename, QorusProject } from './QorusProject';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusProjectInterfaceInfo } from './QorusProjectInterfaceInfo';
import { QorusProjectYamlInfo } from './QorusProjectYamlInfo';
import { qorus_request } from './QorusRequest';
import { qorus_webview } from './QorusWebview';
import {
    all_root_classes, default_lang, lang_inheritance, root_job,
    root_processor, root_service, root_steps, root_workflow, types_with_version
} from './qorus_constants';
import * as msg from './qorus_message';
import { capitalize, deepCopy, filesInDir, hasSuffix, isObject } from './qorus_utils';


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
    private source_directories = [];
    private mapper_types: any[] = [];
    private java_class_2_package = {};

    private all_files_watcher: vscode.FileSystemWatcher;
    private yaml_files_watcher: vscode.FileSystemWatcher;
    private module_files_watcher: vscode.FileSystemWatcher;
    private config_file_watcher: vscode.FileSystemWatcher;

    private notif_trees = [interface_tree];

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
        this.notif_trees.forEach(tree => tree.notify(this));
    }

    fileTree() {
        return this.file_tree;
    }

    interfaceDataByType = iface_kind => {
        const yaml_data = this.yaml_info.yamlDataByType(iface_kind);
        const interfaces = Object.keys(yaml_data).map(name => ({
            name,
            data: yaml_data[name]
        }));
        return sortBy(interfaces, ['name']);
    }

    getListOfInterfaces = iface_kind => {
        this.waitForPending(['yaml']).then(() => {
            const yaml_data = this.yaml_info.yamlDataByType(iface_kind);
            const interfaces = Object.keys(yaml_data).map(name => ({
                name,
                desc: yaml_data[name].desc
            }));

            qorus_webview.postMessage({
                action: 'return-list-of-interfaces',
                iface_kind: iface_kind,
                interfaces: sortBy(interfaces, ['name'])
            });
        });
    }

    getInterfaceData = ({ iface_kind, name, class_name, include_tabs, custom_data, request_id }) => {
        this.waitForPending(['yaml', 'edit_info']).then(() => {
            const true_iface_kind = iface_kind === 'other' ? custom_data?.type : iface_kind;

            let raw_data;
            if (class_name) {
                raw_data = this.yaml_info.yamlDataByName('class', class_name);
            } else {
                const name_key = types_with_version.includes(iface_kind) ? name : name.split(/:/)[0];
                raw_data = this.yaml_info.yamlDataByName(true_iface_kind, name_key);
            }
            const data = this.fixData(raw_data);

            const iface_id = this.iface_info.addIfaceById(data, true_iface_kind);

            qorus_webview.postMessage({
                action: `return-interface-data${request_id ? '-complete' : ''}`,
                request_id,
                ok: true,
                data: {
                    iface_kind,
                    custom_data,
                    [iface_kind]: { ...data, iface_id },
                    ... include_tabs
                        ? {
                            tab: 'CreateInterface',
                            subtab: iface_kind,
                        }
                        : {},
                },
            });
        });
    }

    getClassConnector = ({class: class_name, connector: connector_name}) =>
        (this.yaml_info.yamlDataByName('class', class_name)?.['class-connectors'] || [])
                .find(connector => connector.name === connector_name)

    pairFile = (file: string): string | undefined => {
        if (!hasSuffix(file, 'yaml')) {
            return (this.yaml_info.yamlDataBySrcFile(file) || {}).yaml_file;
        }

        const type = this.yaml_info.getValue(file, 'type');
        if (['service', 'job', 'workflow', 'step', 'class', 'constant', 'function', 'mapper-code'].includes(type)) {
            return this.yaml_info.getSrcFile(file);
        }
        return undefined;
    }

    stepData = (step_structure: any[]): any => {
        const step_names: string[] = flattenDeep(step_structure);
        let step_data = {};
        step_names.forEach(name => {
            step_data[name] = { ...this.yaml_info.yamlDataByName('step', name) };
            delete step_data[name].yaml_file;
        });
        return step_data;
    }

    getMapperCodeMethods = name => {
        this.waitForPending(['yaml']).then(() => {
            const mapper_code = this.yaml_info.yamlDataByName('mapper-code', name);
            if (!mapper_code) {
                msg.log(t`MapperCodeNotFound ${name}`);
            }
            const methods = (mapper_code && mapper_code.methods) || [];
            qorus_webview.postMessage({
                action: 'return-mapper-code-methods',
                name,
                methods
            });
        });
    }

    javaClassPackage = class_name => {
        if (this.java_class_2_package[class_name]) {
            return this.java_class_2_package[class_name];
        }

        const yaml_data = this.yaml_info.yamlDataByClass('class', class_name) || {};

        const {target_dir, target_file} = yaml_data;
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
    }

    getObjectsWithStaticData = ({iface_kind}) => {
        const all_local_objects = this.yaml_info.yamlDataByType(iface_kind);
        let local_objects = Object.keys(all_local_objects)
                                  .filter(name => all_local_objects[name]['staticdata-type'])
                                  .map(name => ({name}));

        const processResult = result => {
            const parsed_result = JSON.parse(result) || [];
            const qorus_objects = parsed_result.filter(obj => obj.iface_kind === iface_kind);

            const objects = [...local_objects, ...qorus_objects].reduce((acc, obj) => {
                if (!acc.some(({name}) => name === obj.name)) {
                    acc.push({name: obj.name});
                }
                return acc;
            }, []);

            const message = {
                action: 'return-objects-with-static-data',
                objects,
                iface_kind
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
    }

    getFieldsFromType = message => {
        const {name, path: path_in_data, url} = message;

        const postMessage = (data?) => {
            qorus_webview.postMessage({
                action: 'return-fields-from-type',
                data
            });
        };

        const onSuccess = response => {
            const data = JSON.parse(response);
            postMessage(data);
        };

        const onError = error => {
            msg.error(error);
            postMessage();
        };

        this.waitForPending(['yaml']).then(() => {
            const type = this.yaml_info.yamlDataByName('type', path.join(name, path_in_data));
            if (type) {
                const {typeinfo} = type;
                if (typeinfo) {
                    postMessage(typeinfo);
                    return;
                }
            }

            qorus_request.doRequest(url, 'GET', onSuccess, onError);
        });
    }

    fixData(orig_data: any): any {
        let data = deepCopy(orig_data);

        if (data.options) {
            data[data.type + '_options'] = data.options;
            delete data.options;
        }
        if (data.autostart) {
            data[data.type + '-autostart'] = data.autostart;
            delete data.autostart;
        }

        ['functions', 'constants', 'mappers', 'value_maps', 'vmaps', 'author',
            'mapper-code', 'groups', 'events', 'queues', 'keylist'].forEach(tag =>
        {
            if (data[tag]) {
                data[tag] = data[tag].map(name => ({ name }));
            }
        });

        ['resource', 'text-resource', 'bin-resource', 'template'].forEach(tag => {
            if (data[tag]) {
                data[tag] = data[tag].map(rel_path => {
                    const abs_path = path.resolve(data.target_dir, rel_path);
                    return {name: abs_path};
                });
            }
        });

        if (data['mapper-code']) {
            data.codes = data['mapper-code'];
            delete data['mapper-code'];
        }

        ['desc', 'description'].forEach(tag => {
            if (data[tag]) {
                data[tag] = data[tag].replace(/^\"/, '');
                if (data[tag][data[tag].length-2] !== '\\') {
                    data[tag] = data[tag].replace(/\"$/, '');
                }
            }
        });

        if (data.fields) {
            Object.keys(data.fields).forEach(field_name => {
                let field = data.fields[field_name];
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

                Object.keys(field).forEach(key => {
                    const value = field[key];
                    if (Array.isArray(value) || isObject(value)) {
                        field[key] = jsyaml.safeDump(value, {indent: 4});
                    }
                });
            });
        }

        if (['class', 'mapper-code'].includes(data.type) && data['class-name'] && data.name !== data['class-name']) {
            data.name = data['class-name'];
        }

        const classes_or_requires = data.type === 'class' ? 'requires' : 'classes';
        if (data[classes_or_requires]) {
            let classes = (data['class-prefixes'] || []).map(prefix_data => ({
                name: prefix_data.class,
                prefix: prefix_data.prefix
            }));

            data[classes_or_requires].forEach(name => {
                if (!classes.some(class_data => class_data.name === name)) {
                    classes.push({name});
                }
            });

            data[classes_or_requires] = classes;
        }

        const array_of_pairs_fields = ['tags', 'define-auth-label', 'workflow_options', 'statuses'];
        array_of_pairs_fields.forEach(tag => {
            if (!data[tag]) {
                return;
            }

            const [key_name, value_name] = field[tag.replace(/-/g, '_')].fields;
            let transformed_data = [];

            for (const key in data[tag]) {
                transformed_data.push({
                    [key_name]: key,
                    [value_name]: data[tag][key]
                });
            }

            data[tag] = transformed_data;
        });

        const fixConfigItems = (items: any[] | undefined) => {
            if (!items) {
                return;
            }

            items.forEach(item => {
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

        const fixStates = (states: any = {}) => {
            Object.keys(states).forEach(id => {
                fixConfigItems(states[id]['config-items']);
                fixStates(states[id].states);
            });
        };
        fixStates(data.states);

        const fixProcessors = (children: any[] = []) => {
            children.forEach(child => {
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

        for (const method of data.methods || []) {
            if (method.author) {
                method.author = method.author.map(value => ({ name: value }));
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
            const ordered_values = ['minutes', 'hours', 'days', 'months', 'dow'].map(key => data.schedule[key]);
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

        if (['group', 'event', 'queue'].includes(data.type)) {
            data.type = capitalize(data.type);
        }

        if (!data.target_file && data.yaml_file) {
            data.target_file = path.basename(data.yaml_file);
        }

        delete data.code;
        delete data.yaml_file;

        return data;
    }

    checkData = (data: any): boolean => {
        const items_to_check = ['checkDependentObjects'];
        return items_to_check.every(itemToCheck => this[itemToCheck](data));
    }

    protected checkDependentObjects(iface_data: any): boolean {
        let ok: boolean = true;

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
                msg.debug({name});
                msg.error(t`ReferencedObjectNotFound ${type} ${name}`);
                ok = false;
                return;
            }

            checkIfaceData(yaml_data);
        };

        const checkIfaceData = (data: any) => {
            checkObject('class', data['base-class-name']);
            checkObject('queue', data.queue);
            checkObject('event', data.event);

            (data.classes || []).forEach(name => checkObject('class', name));
            (data.requires || []).forEach(name => checkObject('class', name));
            (data.mappers || []).forEach(name_version => checkObject('mapper', name_version));
            (data.groups || []).forEach(name => checkObject('group', name));
            (data.fsm || []).forEach(fsm => checkObject('fsm', fsm.name));
            (data.vmaps || []).forEach(name => checkObject('value-map', name));
            (data.constants || []).forEach(name => checkObject('constant', name));
            (data.functions || []).forEach(name => checkObject('function', name));
            (data['class-connections'] || []).forEach(connection => checkObject('class', connection.class));

            (data['config-items'] || []).forEach(item => {
                if (item.parent?.['interface-type'] === 'class') {
                    checkObject('class', item.parent?.['interface-name']);
                }
            });
        };

        checkIfaceData(iface_data);

        return ok;
    }

    private initInfo() {
        this.file_tree = [];
        this.dir_tree = [];

        this.yaml_info.initData();
    }

    private initFileWatchers() {
        this.all_files_watcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.all_files_watcher.onDidCreate(() => this.update(['file_tree']));
        this.all_files_watcher.onDidDelete(() => this.update(['file_tree']));

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
        this.project.validateConfigFileAndDo(file_data => {
            const new_source_directories = file_data.source_directories || [];

            let any_added = false;
            const any_removed = this.source_directories.some(dir => !new_source_directories.includes(dir));

            if (any_removed) {
                this.initInfo();
            } else {
                any_added = new_source_directories.some(dir => !this.source_directories.includes(dir));
            }

            if (any_removed || any_added) {
                this.update();
            }
        });
    }

    async waitForPending(info_list: string[], sleep_before: number = 0, timeout: number = 30000): Promise<void> {
        // "waiting for pending" need not be enough, specifically in cases when the updated info is required
        // before the update process has even started (before the pending flag has been set),
        // this can happen when the update process is triggered by a file watcher
        if (sleep_before) {
            await new Promise(resolve => setTimeout(resolve, sleep_before));
        }

        let interval_id: any;
        const interval = 100;
        let n = timeout / interval;

        return new Promise(resolve => {
            const checkPending = () => {
                const pending_list = info_list.filter(key => this.info_update_pending[key]);
                if (!pending_list.length || !--n) {
                    clearInterval(interval_id);
                    if (n === 0) {
                        msg.error(t`CodeInfoUpdateTimedOut` +
                                  pending_list.map(key => gettext(key + '_info_update_pending')).join(', '));
                        pending_list.forEach(key => this.setPending(key, false));
                    }
                    resolve();
                }
            };

            interval_id = setInterval(checkPending, interval);
        });
    }

    setCurrentQorusData = () => {
        this.setMapperTypes();
    }

    private setMapperTypes = () => {
        qorus_request.doRequest('mappertypes', 'GET', response => {
            const result = JSON.parse(response);
            if (Array.isArray(result)) {
                this.mapper_types = result.map(type => ({name: type.name, desc: type.desc}));
            }
        });
    }

    getObjects = (params: any) => {
        const {object_type, iface_kind, class_name, custom_data } = params;
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

        const postMessage = (return_type: string, objects: any, sort: boolean = true) => {
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
                    const objects = this.yaml_info.yamlDataByType(object_type === 'workflow-step' ? 'step' : object_type);
                    postMessage('objects', Object.keys(objects).map(key => ({
                        name: key,
                        desc: objects[key].desc
                    })));
                });
                break;
            case 'class-with-connectors':
                    this.waitForPending(['yaml']).then(() => {
                        const { connector_type } = custom_data || {};
                        const isAnyConnectorOfType = (connectors: { name: string, method: string, type: string}[]): boolean => (
                            connector_type ? connectors.some((connector) => connector_type.includes(connector.type)) : true
                        );
                        const classes = filter(this.yaml_info.yamlDataByType('class'), ({ 'class-connectors': class_connectors }) => {
                            if (!class_connectors || !size(class_connectors) || !isAnyConnectorOfType(class_connectors)) {
                                return false;
                            }

                            return true;
                        }).map(({ name, desc, ...rest}) => ({
                            name,
                            desc,
                            'class-connectors': rest['class-connectors']
                        }));
                        postMessage('objects', classes);
                    });
                    break;
            case 'class-with-processor':
                this.waitForPending(['yaml']).then(() => {
                    const classes = filter(this.yaml_info.yamlDataByType('class'), ({ processor }) => {
                        return !!processor;
                    }).map(({ name, desc, ...rest}) => ({
                        name,
                        desc,
                        processor: rest.processor,
                    }));
                    postMessage('objects', classes);
                });
                break;
            case 'service-base-class':
                this.waitForPending(['yaml']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.yaml_info.serviceClasses(lang), [root_service]))
                );
                break;
            case 'job-base-class':
                this.waitForPending(['yaml']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.yaml_info.jobClasses(lang), [root_job]))
                );
                break;
            case 'workflow-base-class':
                this.waitForPending(['yaml']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.yaml_info.workflowClasses(lang), [root_workflow]))
                );
                break;
            case 'step-base-class':
                this.waitForPending(['yaml']).then(() => {
                    const step_classes = this.yaml_info.allStepClasses(lang);

                    let result = this.addDescToClasses(step_classes, root_steps);
                    if (iface_kind === 'step' && class_name) {
                        result = result.filter(({name}) => !this.yaml_info.isDescendantOrSelf(class_name, name, lang));
                    }

                    postMessage('objects', result);
                });
                break;
            case 'base-class':
                this.waitForPending(['yaml']).then(() => {
                    const classes = this.yaml_info.yamlDataByType('class');

                    let user_classes = Object.keys(classes).filter(key =>
                        lang_inheritance[lang].includes(classes[key].lang || default_lang)
                    ).map(key => ({
                        name: key,
                        desc: classes[key].desc
                    }));

                    if (iface_kind === 'class' && class_name) {
                        user_classes = user_classes
                            .filter(({name}) => !this.yaml_info.isDescendantOrSelf(class_name, name, lang));
                    }

                    const qorus_root_classes = this.addDescToClasses(all_root_classes, all_root_classes);

                    postMessage('objects', [ ...user_classes, ...qorus_root_classes ]);
                });
                break;
            case 'processor-base-class':
                this.waitForPending(['yaml']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.yaml_info.processorClasses(lang), [root_processor]))
                );
                break;
            case 'author':
                this.waitForPending(['yaml']).then(() => postMessage('objects', this.yaml_info.getAuthors()));
                break;
            case 'function':
            case 'constant':
            case 'mapper':
            case 'value-map':
            case 'group':
            case 'event':
            case 'queue':
            case 'type':
            case 'fsm':
            case 'pipeline':
                this.waitForPending(['yaml']).then(() => postMessage('objects',
                    Object.keys(this.yaml_info.yamlDataByType(object_type)).map(name => ({name}))
                ));
                break;
            case 'module':
                this.waitForPending(['modules']).then(() =>
                    postMessage('objects', this.modules.map(name => ({ name })))
                );
                break;
            case 'resource':
            case 'text-resource':
            case 'bin-resource':
            case 'template':
                this.waitForPending(['file_tree']).then(() => postMessage('resources', this.file_tree, false));
                break;
            case 'target_dir':
                this.waitForPending(['file_tree'], 800).then(() => postMessage('directories', this.dir_tree, false));
                break;
            case 'all_dirs':
                this.waitForPending(['file_tree'], 1000).then(() => qorus_webview.postMessage({
                    action: 'return-all-directories',
                    directories: this.all_dir_tree
                }));
                break;
            case 'mapper-type':
                postMessage('objects', this.mapper_types);
                break;
            default:
                msg.error(t`UnknownInterfaceProperty ${object_type}`);
        }
    }

    private logUpdateMessage(info_key: string) {
        if (!log_update_messages) {
            return;
        }
        const update = gettext(info_key + '_info_update_pending');
        const is_pending = this.info_update_pending[info_key];
        msg.log(update + ': ' + ' '.repeat(45 - update.length) + (is_pending ? t`pending` : t`finished`));
    }

    static isRootBaseClass = base_class_name => all_root_classes.includes(base_class_name);

    private update = (info_list: string[] = info_keys, is_initial_update: boolean = false) => {
        this.project.validateConfigFileAndDo(file_data => {
            if (is_initial_update) {
                info_keys.forEach(key => this.setPending(key, true, true));
            }

            if (info_list.includes('file_tree')) {
                setTimeout(() => {
                    this.updateFileTree(file_data.source_directories);
                    this.notifyTrees();
                }, 0);
            }

            if (file_data.source_directories.length === 0) {
                info_keys.forEach(key => key !== 'file_tree' && this.setPending(key, false));
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

            if (is_initial_update) {
                let interval_id: any;
                let sec = 0;
                const checkPending = () => {
                    if (log_update_messages) {
                        msg.log(t`seconds ${++sec}`);
                    }
                    if (!info_keys.map(key => this.info_update_pending[key]).some(value => value)) {
                        msg.log(t`CodeInfoUpdateFinished ${this.project.folder}` + ' ' + new Date().toString());
                        clearInterval(interval_id);
                    }
                };

                interval_id = setInterval(checkPending, 1000);
            }
        });
    }

    stepType = (base_class: string): string | undefined => {
        for (const step_type of root_steps) {
            if (this.yaml_info.stepClasses(step_type)[base_class]) {
                return step_type;
            }
        }
        return undefined;
    }

    setFields = ({'base-class-name': base_class_name, iface_id, iface_kind}) => {
        if (!base_class_name || iface_kind !== 'step') {
            return;
        }

        const addField = field =>
            qorus_webview.postMessage({ action: 'creator-add-field', field, iface_id, iface_kind });

        const removeField = field =>
            qorus_webview.postMessage({ action: 'creator-remove-field', field, iface_id, iface_kind });

        switch(this.stepType(base_class_name)) {
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
    }

    private addSingleYamlInfo(file: string) {
        this.setPending('yaml', true);
        this.yaml_info.addSingleYamlInfo(file);
        this.yaml_info.baseClassesFromInheritancePairs();
        this.setPending('yaml', false);
    }

    private updateYamlInfo(source_directories: string[]) {
        this.setPending('yaml', true);
        this.yaml_info.initData();
        for (let dir of source_directories) {
            const full_dir = path.join(this.project.folder, dir);
            if (!fs.existsSync(full_dir)) {
                continue;
            }

            let files = filesInDir(full_dir, path => hasSuffix(path, 'yaml'));
            for (let file of files) {
                this.yaml_info.addSingleYamlInfo(file);
            }
        }
        this.notifyTrees();
        this.yaml_info.baseClassesFromInheritancePairs();
        this.setPending('yaml', false);
    }

    private updateModuleInfo(source_directories: string[]) {
        this.setPending('modules', true);
        let modules: any = {};
        for (let dir of source_directories) {
            const full_dir = path.join(this.project.folder, dir);
            if (!fs.existsSync(full_dir)) {
                continue;
            }

            let files = filesInDir(full_dir, path => hasSuffix(path, 'qm'));
            for (let file of files) {
                modules[file] = true;
            }
        }
        this.modules = Object.keys(modules).map(file_path => path.basename(file_path, '.qm'));
        this.setPending('modules', false);
    }

    private addDescToClasses(base_classes: any, root_classes: string[] = []): any[] {
        if (!Array.isArray(base_classes)) {
            return this.addDescToClasses(Object.keys(base_classes), root_classes);
        }

        let ret_val = [];
        for (const base_class of base_classes) {
            const desc = root_classes.includes(base_class)
                ? gettext(`${base_class}Desc`)
                : (this.yaml_info.yamlDataByName('class', base_class) || {}).desc;
            ret_val.push({name: base_class, desc});
        }
        return ret_val;
    }

    setPending(info_key: string, value: boolean, never_message: boolean = false) {
        this.info_update_pending[info_key] = value;
        if (!never_message) {
            this.logUpdateMessage(info_key);
        }
    }

    private updateFileTree(source_directories: string[]) {
        this.setPending('file_tree', true);
        const dirItem = (abs_path: string, only_dirs: boolean, is_root_item: boolean = false) => {
            const rel_path = this.project.relativeDirPath(abs_path);
            return {
                abs_path,
                rel_path,
                basename: is_root_item ? rel_path : path.basename(abs_path),
                dirs: [],
                ... only_dirs ? {} : { files: [] }
            };
        };

        const subDirRecursion = (tree_item: any, only_dirs: boolean) => {
            const dir_entries: string[] = fs.readdirSync(tree_item.abs_path).sort();
            for (let entry of dir_entries) {
                if (entry[0] === '.') {
                    continue;
                }
                const entry_path: string = path.join(tree_item.abs_path, entry);
                if (fs.lstatSync(entry_path).isDirectory()) {
                    let dir_item = dirItem(entry_path, only_dirs);
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

        let file_tree: any[] = [];
        let dir_tree: any[] = [];

        for (let dir of source_directories.sort()) {
            let file_tree_root = dirItem(path.join(this.project.folder, dir), false, true);
            file_tree.push(file_tree_root);
            subDirRecursion(file_tree_root, false);

            let dir_tree_root = dirItem(path.join(this.project.folder, dir), true, true);
            dir_tree.push(dir_tree_root);
            subDirRecursion(dir_tree_root, true);
        }

        let all_dir_tree: any = [];
        let all_dir_tree_root = dirItem(this.project.folder, true);
        all_dir_tree.push(all_dir_tree_root);
        subDirRecursion(all_dir_tree_root, true);

        this.file_tree = file_tree;
        this.dir_tree = dir_tree;
        this.all_dir_tree = all_dir_tree;
        this.setPending('file_tree', false);
    }

    getMappers = ({'input-condition': input_condition, 'output-condition': output_condition}) => {
        this.waitForPending(['yaml']).then(() => {
            const all_mappers: any[] = Object.keys(this.yaml_info.yamlDataByType('mapper'))
                                             .map(name => this.fixData(this.yaml_info.yamlDataByName('mapper', name)));

            const filtered_mappers = all_mappers.filter(mapper => {
                if (!mapper.mapper_options) {
                    return false;
                }

                const input = mapper.mapper_options['mapper-input'];
                const output = mapper.mapper_options['mapper-output'];

                if (!input || !output) {
                    return false;
                }

                return (!input_condition?.name || input_condition.name === input.name)
                    && (!input_condition?.type || input_condition.type === input.type)
                    && (!output_condition?.name || output_condition.name === output.name)
                    && (!output_condition?.type || output_condition.type === output.type)
                    && (!output_condition?.subtype || output_condition.subtype === output.subtype)
                    && (!output_condition?.path || output_condition.path === output.path);
            }).map((mapper) => ({
                ...mapper,
                name: `${mapper.name}:${mapper.version}`
            }));

            qorus_webview.postMessage({
                action: 'return-mappers',
                mappers: filtered_mappers
            });
        });
    }

    deleteInterfaceFromWebview = ({iface_kind, name}) => {
        const iface_data = this.yaml_info.yamlDataByName(iface_kind, name);
        QorusProjectCodeInfo.deleteInterface({iface_kind, iface_data});
    }

    static deleteInterface = ({iface_kind, iface_data}) => {
        iface_data = iface_data || {};
        const yaml_file = iface_data.yaml_file;
        const code_file = iface_data.target_dir && iface_data.target_file
                            && path.join(iface_data.target_dir, iface_data.target_file);

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
    }
}
