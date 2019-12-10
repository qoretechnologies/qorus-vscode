import * as child_process from 'child_process';
import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as isArray from 'lodash/isArray';
import * as isObject from 'lodash/isObject';
import * as sortBy from 'lodash/sortBy';
import * as path from 'path';
import { t, gettext } from 'ttag';
import * as vscode from 'vscode';

import { qore_vscode } from './qore_vscode';
import * as msg from './qorus_message';
import { canBeParsed, canDefineInterfaceBaseClass, filesInDir,
         flatten, hasSuffix, suffixToIfaceKind } from './qorus_utils';
import { qorus_vscode } from './qorus_vscode';
import { config_filename, QorusProject } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { loc2range, QoreTextDocument, qoreTextDocument } from './QoreTextDocument';
import { qorus_webview } from './QorusWebview';
import { field } from './qorus_creator/common_constants';
import { InterfaceInfo } from './qorus_creator/InterfaceInfo';

const object_parser_subdir = 'qorus-object-parser';
const object_parser_script = 'qop.q -i';
const object_chunk_length = 100;
const root_service = 'QorusService';
const root_job = 'QorusJob';
const root_workflow = 'QorusWorkflow';
const root_steps = ['QorusAsyncStep', 'QorusEventStep', 'QorusNormalStep', 'QorusSubworkflowStep',
                    'QorusAsyncArrayStep', 'QorusEventArrayStep', 'QorusNormalArrayStep', 'QorusSubworkflowArrayStep'];
const all_root_classes =[...root_steps, root_service, root_job, root_workflow];
const object_info_types = ['class', 'function', 'constant', 'mapper', 'value-map', 'group', 'event', 'queue'];
const info_keys = ['file_tree', 'yaml', 'lang_client', 'objects', 'modules'];
const object_types_with_version = ['step', 'mapper'];
const object_types_without_version = ['service', 'job', 'workflow', 'config-item-values', 'config-items',
                                      'class', 'constant', 'function', 'connection', 'event', 'group',
                                      'queue', 'value-map', 'mapper-code'];
const object_types = [...object_types_with_version, ...object_types_without_version];
export const default_version = '1.0';

const log_update_messages = false;
const log_qop_stderr = false;

export class QorusProjectCodeInfo {
    private project: QorusProject;
    private iface_info: InterfaceInfo;

    private info_update_pending: any = {};
    private object_info: any = {};

    private yaml_data: any = {};

    private src_2_yaml: any = {};
    public yamlDataBySrcFile = file => this.yaml_data[this.src_2_yaml[file]];
    public yamlDataByFilePath = file => this.yaml_data[file];

    private class_2_yaml: any = {};
    private yamlDataByClass = class_name => this.yaml_data[this.class_2_yaml[class_name]];

    private name_2_yaml: any = {};
    private yamlDataByName = (type, name) => this.yaml_data[this.name_2_yaml[type][name]];
    private yamlDataByType = type => {
        let ret_val = {};
        for (const name in this.name_2_yaml[type] || {}) {
            ret_val[name] = this.yamlDataByName(type, name);
        }
        return ret_val;
    }

    private yaml_2_src: any = {};
    private class_2_src: any = {};
    private file_tree: any = {};
    private dir_tree: any = {};
    private all_dir_tree: any = {};
    private inheritance_pairs: any = {};
    private edit_info: any = {};
    private modules: string[] = [];
    private service_classes = {};
    private job_classes = {};
    private workflow_classes = {};
    private step_classes = {};
    private source_directories = [];
    private mapper_types: any[] = [];

    private all_files_watcher: vscode.FileSystemWatcher;
    private yaml_files_watcher: vscode.FileSystemWatcher;
    private base_classes_files_watcher: vscode.FileSystemWatcher;
    private parsable_files_watcher: vscode.FileSystemWatcher;
    private module_files_watcher: vscode.FileSystemWatcher;
    private config_file_watcher: vscode.FileSystemWatcher;

    private notif_trees = {};

    constructor(project: QorusProject) {
        this.project = project;
        this.initInfo();
        this.initFileWatchers();
        this.update(undefined, true);
        this.iface_info = new InterfaceInfo(this);
    }

    get interface_info(): any {
        return this.iface_info;
    }

    addText(document: vscode.TextDocument) {
        const file = document.uri.fsPath;

        if (!this.edit_info[file]) {
            this.edit_info[file] = {};
        }
        this.edit_info[file].text_lines = [];
        for (let i = 0; i < document.lineCount; i++) {
            this.edit_info[file].text_lines.push(document.lineAt(i).text);
        }
    }

    addTextLines(file: string, contents: string) {
        if (!this.edit_info[file]) {
            this.edit_info[file] = {};
        }
        this.edit_info[file].text_lines = contents.split(/\r?\n/);
    }

    private addMethodInfo(
        file: string,
        method_name: string,
        decl_range: any,
        name_range: any)
    {
        if (!this.edit_info[file]) {
            this.edit_info[file] = {};
        }
        if (!this.edit_info[file].method_decl_ranges) {
            this.edit_info[file].method_decl_ranges = {};
            this.edit_info[file].method_name_ranges = {};
        }
        this.edit_info[file].method_decl_ranges[method_name] = decl_range;
        this.edit_info[file].method_name_ranges[method_name] = name_range;
    }

    isSymbolExpectedClass = (symbol: any, class_name?: string): boolean =>
        class_name &&
        symbol.nodetype === 1 &&
        symbol.kind === 1 &&
        symbol.name &&
        class_name === symbol.name.name

    addClassCodeInfo = (file: string, symbol: any, base_class_name?: string, message_on_mismatch: boolean = true) => {
        const class_def_range: vscode.Range = loc2range(symbol.loc);
        const class_name_range: vscode.Range = loc2range(symbol.name.loc, 'class ');

        const num_inherited = (symbol.inherits || []).length;

        const addClassInfo = (main_base_class_ord: number = -1) => {
            if (!this.edit_info[file]) {
                this.edit_info[file] = {};
            }
            Object.assign(this.edit_info[file], {
                class_def_range,
                class_name_range,
                main_base_class_name_range: main_base_class_ord === -1
                    ? undefined
                    : loc2range(symbol.inherits[main_base_class_ord].name.loc),
                first_base_class_line: num_inherited > 0
                    ? loc2range(symbol.inherits[0].name.loc).start.line
                    : undefined,
                last_class_line: loc2range(symbol.loc).end.line,
                has_other_base_class: num_inherited > 1 || (num_inherited > 0 && main_base_class_ord === -1),
                main_base_class_ord
            });
        };

        if (num_inherited > 0) {
            if (base_class_name) {
                const index = symbol.inherits.findIndex(inherited =>
                    inherited.name && inherited.name.name === base_class_name);

                if (index > -1) {
                    addClassInfo(index);
                } else {
                    if (message_on_mismatch) {
                        msg.error(t`SrcAndYamlBaseClassMismatch ${base_class_name} ${file}`);
                    }
                    addClassInfo();
                }
            } else {
                addClassInfo();
            }
        } else {
            if (base_class_name) {
                msg.error(t`SrcAndYamlBaseClassMismatch ${base_class_name} ${file}`);
            }
            addClassInfo();
        }
    }

    addClassDeclCodeInfo = (file: string, decl: any): boolean => {
        if (decl.nodetype !== 1 || decl.kind !== 4) { // declaration && function
            return false;
        }

        if (decl.modifiers.indexOf('private') > -1) {
            return false;
        }

        const method_name = decl.name.name;
        const decl_range = loc2range(decl.loc);
        const name_range = loc2range(decl.name.loc);

        this.addMethodInfo(file, method_name, decl_range, name_range);

        return true;
    }

    addFileCodeInfo(file: string, class_name?: string, base_class_name?: string, force: boolean = true): Promise<void> {
        const iface_kind = suffixToIfaceKind(path.extname(file));
        if (this.edit_info[file] && !force) {
            return Promise.resolve();
        }

        const doc: QoreTextDocument = qoreTextDocument(file);
        this.addTextLines(file, doc.text);

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            symbols.forEach(symbol => {
                if (!this.isSymbolExpectedClass(symbol, class_name)) {
                    return;
                }

                this.addClassCodeInfo(file, symbol, base_class_name);

                if (iface_kind !== 'service') {
                    return;
                }

                for (let decl of symbol.declarations || []) {
                    this.addClassDeclCodeInfo(file, decl);
                }
            });
            return Promise.resolve();
        });
    }

    editInfo(file: string) {
        return this.edit_info[file];
    }

    registerTreeForNotifications(name, tree) {
        if (!this.notif_trees[name]) {
            this.notif_trees[name] = tree;
        }
    }

    unregisterTreeForNotifications(name) {
        delete this.notif_trees[name];
    }

    notifyTrees() {
        for (const key in this.notif_trees) {
            this.notif_trees[key].treeNotify();
        }
    }

    fileTree() {
        return this.file_tree;
    }

    getInterfaceDataList(iface_kind): Promise<any[] | undefined> {
        return this.waitForPending(['yaml']).then(() => {
            const yaml_data = this.yamlDataByType(iface_kind);
            const interfaces = Object.keys(yaml_data).map(name => ({
                name,
                data: yaml_data[name]
            }));
            return sortBy(interfaces, ['name']);
        });
    }

    getListOfInterfaces = iface_kind => {
        this.waitForPending(['yaml']).then(() => {
            const yaml_data = this.yamlDataByType(iface_kind);
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

    getInterfaceData = ({ iface_kind, name, include_tabs }) => {
        const name_key = object_types_with_version.includes(iface_kind) ? name : name.split(/:/)[0];
        this.waitForPending(['yaml', 'edit_info']).then(() =>
            qorus_webview.postMessage({
                action: 'return-interface-data',
                data: {
                    iface_kind: iface_kind,
                    [iface_kind]: this.yamlDataByName(iface_kind, name_key),
                    ... include_tabs
                        ? {
                              tab: 'CreateInterface',
                              subtab: iface_kind,
                          }
                        : {},
                },
            })
        );
    }

    pairFile = (file: string): string | undefined => {
        if (!hasSuffix(file, 'yaml')) {
            return (this.yamlDataBySrcFile(file) || {}).yaml_file;
        }

        const yaml_data = this.yaml_data[file] || {};
        if (['service', 'job', 'workflow', 'step', 'class', 'constant', 'function'].includes(yaml_data.type)) {
            return this.yaml_2_src[file];
        }
        return undefined;
    }

    stepData = (step_structure: any[]): any => {
        const step_names: string[] = flatten(step_structure);
        let step_data = {};
        step_names.forEach(name => {
            step_data[name] = { ...this.yamlDataByName('step', name) };
            delete step_data[name].yaml_file;
        });
        return step_data;
    }

    getMapperCodeMethods = name => {
        const mapper_code = this.yamlDataByName('mapper-code', name);
        if (!mapper_code) {
            msg.log(t`MapperCodeNotFound ${name}`);
        }
        const methods = (mapper_code && mapper_code.methods) || [];
        qorus_webview.postMessage({
            action: 'return-mapper-code-methods',
            name,
            methods
        });
    }

    fixData(data: any): any {
        if (data.autostart) {
            data[data.type + '-autostart'] = data.autostart;
            delete data.autostart;
        }

        let fields_to_complexify = ['functions', 'constants', 'mappers', 'value_maps', 'author'];

        if (data['class-prefixes']) {
            data.classes = data['class-prefixes'].map(class_prefix_data => ({
                name: class_prefix_data.class,
                prefix: class_prefix_data.prefix
            }));
        } else {
            fields_to_complexify.push('classes');
        }

        fields_to_complexify.forEach(tag => {
            if (data[tag]) {
                data[tag] = data[tag].map(value => ({ name: value }));
            }
        });

        const array_of_pairs_fields = ['tags', 'define-auth-label', 'options', 'statuses'];
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

        for (const method of data.methods || []) {
            if (method.author) {
                method.author = method.author.map(value => ({ name: value }));
            }
        }

        if (data.schedule) {
            const ordered_values = ['minutes', 'hours', 'days', 'months', 'dow'].map(key => data.schedule[key]);
            data.schedule = ordered_values.join(' ');
        }

        if (data.steps) {
            data['steps-info'] = this.stepData(data.steps);
        }

        delete data.code;
        delete data.yaml_file;

        return data;
    }

    private initInfo() {
        for (const type of [...object_info_types, 'author']) {
            this.object_info[type] = {};
        }

        for (const type of object_types) {
            this.name_2_yaml[type] = {};
        }

        this.service_classes = { [root_service]: true };
        this.job_classes = { [root_job]: true };
        this.workflow_classes = { [root_workflow]: true };

        for (const step_type of root_steps) {
            this.step_classes[step_type] = { [step_type]: true };
        }

        this.file_tree = {};
        this.dir_tree = {};
        this.class_2_src = {};
        this.inheritance_pairs = {};
        this.yaml_data = {};
        this.src_2_yaml = {};
        this.yaml_2_src = {};
        this.class_2_yaml = {};
    }

    private flattenedStepClasses = () => {
        let ret_val = {};
        for (const step_type of root_steps) {
            Object.assign(ret_val, this.step_classes[step_type]);
        }
        return ret_val;
    }

    private initFileWatchers() {
        this.all_files_watcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.all_files_watcher.onDidCreate(() => {
            this.update(['file_tree']);
            this.notifyTrees();
        });
        this.all_files_watcher.onDidDelete(() => {
            this.update(['file_tree']);
            this.notifyTrees();
        });

        this.yaml_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.yaml');
        this.yaml_files_watcher.onDidCreate((uri: vscode.Uri) => this.addSingleYamlInfo(uri.fsPath));
        this.yaml_files_watcher.onDidChange(() => {
            this.update(['yaml']);
            this.notifyTrees();
        });
        this.yaml_files_watcher.onDidDelete(() => this.update(['yaml']));

        this.base_classes_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.{qclass,qfd}');
        this.base_classes_files_watcher.onDidCreate(() => this.update(['lang_client']));
        this.base_classes_files_watcher.onDidChange(() => this.update(['lang_client']));
        this.base_classes_files_watcher.onDidDelete(() => this.update(['lang_client']));

        this.parsable_files_watcher
            = vscode.workspace.createFileSystemWatcher('**/*.{qfd,qsd,qjob,qclass,qconst,qmapper,qvmap,java}');
        this.parsable_files_watcher.onDidCreate(() => this.update(['objects']));
        this.parsable_files_watcher.onDidChange(() => this.update(['objects']));
        this.parsable_files_watcher.onDidDelete(() => this.update(['objects']));

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

    waitForPending(info_list: string[], timeout: number = 30000): Promise<void> {
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

    getObjects(object_type: string) {
        const maybeSortObjects = (objects: any): any => {
            // For now, only arrays will be sorted
            if (isArray(objects)) {
                // Check if this collection is made of objects or strings
                if (objects.every((obj: any) => isObject(obj))) {
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
                this.waitForPending(['yaml']).then(() => {
                    const objects = this.yamlDataByType('workflow-step' ? 'step' : object_type);
                    postMessage('objects', Object.keys(objects).map(key => ({
                        name: key,
                        desc: objects[key].desc
                    })));
                });
                break;
            case 'service-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.service_classes, [root_service]))
                );
                break;
            case 'job-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.job_classes, [root_job]))
                );
                break;
            case 'workflow-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.workflow_classes, [root_workflow]))
                );
                break;
            case 'step-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() =>
                    postMessage('objects', this.addDescToClasses(this.flattenedStepClasses(), root_steps))
                );
                break;
            case 'base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() => {
                    const classes = { ...this.class_2_src };
                    const current_class =
                        qorus_webview.opening_data &&
                        qorus_webview.opening_data.class &&
                        qorus_webview.opening_data.class['class-name'];
                    delete classes[current_class];
                    postMessage('objects', this.addDescToClasses(
                        [ ...Object.keys(classes), ...all_root_classes ],
                        all_root_classes,
                    ));
                });
                break;
            case 'author':
            case 'function':
            case 'class':
            case 'constant':
            case 'mapper':
            case 'value-map':
            case 'group':
            case 'event':
            case 'queue':
                this.waitForPending(['objects', 'yaml']).then(() => postMessage('objects',
                    Object.keys(this.object_info[object_type]).map(key => this.object_info[object_type][key]))
                );
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
                this.waitForPending(['file_tree']).then(() => postMessage('directories', this.dir_tree, false));
                break;
            case 'all_dirs':
                this.waitForPending(['file_tree']).then(() => qorus_webview.postMessage({
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
                }, 0);
            }

            if (file_data.source_directories.length === 0) {
                info_keys.forEach(key => key !== 'file_tree' && this.setPending(key, false));
                return;
            }

            if (is_initial_update) {
                msg.log(t`CodeInfoUpdateStarted ${this.project.folder}` + ' ' + new Date().toString());
            }

            if (info_list.includes('lang_client')) {
                setTimeout(() => {
                    this.updateLanguageClientInfo(file_data.source_directories);
                }, 0);
            }
            if (info_list.includes('yaml')) {
                setTimeout(() => {
                    this.updateYamlInfo(file_data.source_directories);
                }, 0);
            }
            if (info_list.includes('objects')) {
                setTimeout(() => {
                    this.updateObjects(file_data.source_directories);
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
            if (this.step_classes[step_type][base_class]) {
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

    addSingleYamlInfo(file: string) {
        let parsed_data: any;
        try {
            parsed_data = jsyaml.safeLoad(fs.readFileSync(file));
        } catch (error) {
            msg.debug({ file, error });
            return;
        }

        let yaml_data = {
            ...parsed_data,
            yaml_file: file,
            target_dir: path.dirname(file),
        };
        yaml_data.target_file = yaml_data.code;

        this.yaml_data[file] = yaml_data;

        if (yaml_data.code) {
            const src = path.join(path.dirname(file), yaml_data.code);
            this.src_2_yaml[src] = file;
            this.yaml_2_src[file] = src;
        }
        const class_name = yaml_data['class-name'];
        if (class_name) {
            this.class_2_yaml[class_name] = file;
        }

        const addObjectName = (type: string, name: string) => {
            if (!this.object_info[type][name]) {
                this.object_info[type][name] = { name };
            }
        };

        if (yaml_data.name && yaml_data.type) {
            const name = object_types_with_version.includes(yaml_data.type)
                ? `${yaml_data.name}:${yaml_data.version || default_version}`
                : yaml_data.name;

            this.name_2_yaml[yaml_data.type][name] = file;

            if (object_info_types.includes(yaml_data.type)) {
                addObjectName(yaml_data.type, name);
            }

            if (class_name) {
                const base_class_name = this.yaml_data[file]['base-class-name'];

                if (base_class_name) {
                    this.yaml_data[file]['base-class-name'] = base_class_name;

                    if (yaml_data.type === 'step' && base_class_name) {
                        const step_type = this.stepType(base_class_name);
                        if (step_type) {
                            this.yaml_data[file]['step-type'] = step_type;
                        }
                    }
                }
            }
        }

        for (const name of yaml_data.author || []) {
            addObjectName('author', name);
        }

        if (class_name) {
            addObjectName('class', class_name);
            if (yaml_data.desc) {
                this.object_info.class[class_name].desc = yaml_data.desc;
            }
        }
    }

    private updateYamlInfo(source_directories: string[]) {
        this.setPending('yaml', true);
        for (let dir of source_directories) {
            const full_dir = path.join(this.project.folder, dir);
            if (!fs.existsSync(full_dir)) {
                continue;
            }

            let files = filesInDir(full_dir, path => hasSuffix(path, 'yaml'));
            for (let file of files) {
                this.addSingleYamlInfo(file);
            }
        }
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

    private baseClassesFromInheritancePairs() {
        const baseClasses = (base_classes: any, inheritance_pairs: any): any => {
            let any_new = true;
            while (any_new) {
                any_new = false;
                for (let name in inheritance_pairs) {
                    if (inheritance_pairs[name].some(base_class_name => base_classes[base_class_name])) {
                        base_classes[name] = true;
                        delete inheritance_pairs[name];
                        any_new = true;
                        break;
                    }
                }
            }
            return base_classes;
        };

        baseClasses(this.service_classes, { ...this.inheritance_pairs });
        baseClasses(this.job_classes, { ...this.inheritance_pairs });
        baseClasses(this.workflow_classes, { ...this.inheritance_pairs });
        for (const step_type of root_steps) {
            this.step_classes[step_type] = baseClasses(this.step_classes[step_type], { ...this.inheritance_pairs });
        }
    }

    private updateLanguageClientInfo(source_directories: string[]) {
        this.setPending('lang_client', true);
        this.processDocumentSymbols(source_directories, canDefineInterfaceBaseClass, (symbol, file) => {
            if (symbol.nodetype !== 1 || symbol.kind !== 1 || !symbol.name || !symbol.name.name) {
                return;
            }

            const class_name = symbol.name.name;
            this.class_2_src[class_name] = file;

            if (!symbol.inherits || !symbol.inherits.length) {
                return;
            }

            this.inheritance_pairs[class_name] = [];

            symbol.inherits.forEach(inherited => {
                if (inherited.name && inherited.name.name) {
                    this.inheritance_pairs[class_name].push(inherited.name.name);
                }
            });
        }).then(() => {
            this.baseClassesFromInheritancePairs();
            this.setPending('lang_client', false);
        });
    }

    classYamlData = class_name => {
        const class_src_file = this.class_2_src[class_name];
        const class_yaml_data = this.yamlDataBySrcFile(class_src_file);
        if (!class_yaml_data && !QorusProjectCodeInfo.isRootBaseClass(class_name)) {
            msg.log(t`UnableFindYamlForClass ${class_name}`);
        }
        return class_yaml_data;
    }

    private addDescToClasses(base_classes: any, root_classes: string[] = []): any[] {
        if (!Array.isArray(base_classes)) {
            return this.addDescToClasses(Object.keys(base_classes), root_classes);
        }

        let ret_val = [];
        for (const base_class of base_classes) {
            const desc = root_classes.includes(base_class)
                ? gettext(`${base_class}Desc`)
                : (this.yamlDataByClass(base_class) || {}).desc;
            ret_val.push({name: base_class, desc});
        }
        return ret_val;
    }

    private processDocumentSymbols(
        source_directories: string[],
        file_filter: Function,
        process: Function
    ): Promise<void> {
        return new Promise(resolve => {
            let num_pending = 0;
            for (let dir of source_directories) {
                const full_dir = path.join(this.project.folder, dir);
                if (!fs.existsSync(full_dir)) {
                    continue;
                }

                let files = filesInDir(full_dir, file_filter);
                for (let file of files) {
                    num_pending++;

                    const doc: QoreTextDocument = qoreTextDocument(file);
                    qore_vscode.activate().then(() => {
                        qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
                            symbols.forEach(symbol => {
                                process(symbol, file);
                            });
                            num_pending--;
                        });
                    });
                }
            }

            let interval_id: any;
            const interval = 200;
            let n = 500;

            const checkPending = () => {
                if (!num_pending || !--n) {
                    clearInterval(interval_id);
                    if (n === 0) {
                        msg.error(t`GettingDocSymbolsTimedOut`);
                    }
                    resolve();
                }
            };

            interval_id = setInterval(checkPending, interval);
        });
    }

    setPending(info_key: string, value: boolean, never_message: boolean = false) {
        this.info_update_pending[info_key] = value;
        if (!never_message) {
            this.logUpdateMessage(info_key);
        }
    }

    private updateFileTree(source_directories: string[]) {
        this.setPending('file_tree', true);
        const dirItem = (abs_path: string, only_dirs: boolean, is_root: boolean = false) => ({
            abs_path,
            rel_path: is_root ? '.' : vscode.workspace.asRelativePath(abs_path, false),
            dirs: [],
            ... only_dirs ? {} : { files: [] }
        });

        const subDirRecursion = (tree_item: any, only_dirs: boolean) => {
            const dir_entries: string[] = fs.readdirSync(tree_item.abs_path);
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
                        name: entry,
                    });
                }
            }
        };

        let file_tree: any = dirItem(this.project.folder, false, true);
        let dir_tree: any = dirItem(this.project.folder, true, true);
        let all_dir_tree: any = dirItem(this.project.folder, true, true);

        for (let dir of source_directories) {
            let file_tree_root = dirItem(path.join(this.project.folder, dir), false);
            file_tree.dirs.push(file_tree_root);
            subDirRecursion(file_tree_root, false);

            let dir_tree_root = dirItem(path.join(this.project.folder, dir), true);
            dir_tree.dirs.push(dir_tree_root);
            subDirRecursion(dir_tree_root, true);
        }

        let all_dir_tree_root = dirItem(this.project.folder, true);
        all_dir_tree.dirs.push(all_dir_tree_root);
        subDirRecursion(all_dir_tree_root, true);

        this.file_tree = file_tree;
        this.dir_tree = dir_tree;
        this.all_dir_tree = all_dir_tree;
        this.setPending('file_tree', false);
    }

    private async updateObjects(source_directories: string[]) {
        this.setPending('objects', true);
        try {
            await qorus_vscode.waitForContext();
        } catch (error) {
            this.setPending('objects', false);
            return;
        }

        const object_parser_dir = path.join(qorus_vscode.context.extensionPath, object_parser_subdir);
        const object_parser_path = path.join(object_parser_dir, object_parser_script);
        let num_pending = 0;
        let child_process_failed: boolean = false;

        for (let dir of source_directories) {
            if (child_process_failed) {
                break;
            }

            const full_dir = path.join(this.project.folder, dir);
            if (!fs.existsSync(full_dir)) {
                continue;
            }

            let files = filesInDir(full_dir, canBeParsed);

            while (files.length) {
                if (child_process_failed) {
                    break;
                }

                this.setPending('objects', true, true);
                num_pending++;

                let command_parts = files.splice(0, object_chunk_length);
                command_parts.unshift(object_parser_path);
                const command: string = command_parts.join(' ');
                const options = {
                    maxBuffer: 99999999,
                    env: {
                        ...process.env,
                        QORE_MODULE_DIR: object_parser_dir,
                    },
                };

                child_process.exec(command, options, (error, stdout, stderr) => {
                    if (stderr && log_qop_stderr) {
                        msg.error(stderr);
                    }

                    if (error) {
                        msg.error(t`QopError ${error}`);
                        this.setPending('objects', false, true);
                        child_process_failed = true;
                        return;
                    }

                    const objects: any[] = JSON.parse(stdout.toString()) || [];

                    for (let obj of objects) {
                        const authors = obj.tags.author || obj.tags.serviceauthor || [];
                        for (const author of authors) {
                            this.object_info.author[author] = { name: author };
                        }

                        obj.type = obj.type.replace(/ /g, '-');

                        if (!object_info_types.includes(obj.type)) {
                            continue;
                        }
                        if (obj.type === 'function' && obj.tags.type !== 'GENERIC') {
                            continue;
                        }

                        const name = object_types_with_version.includes(obj.type)
                            ? `${obj.tags.name}:${obj.tags.version || default_version}`
                            : obj.tags.name;

                        this.object_info[obj.type][name] = {
                            name: name,
                            desc: obj.tags.desc,
                        };
                    }
                    if (--num_pending == 0) {
                        this.setPending('objects', false);
                    }
                });
            }
        }
    }
}
