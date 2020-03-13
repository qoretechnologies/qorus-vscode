import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as isArray from 'lodash/isArray';
import * as isObject from 'lodash/isObject';
import * as sortBy from 'lodash/sortBy';
import * as flattenDeep from 'lodash/flattenDeep';
import * as path from 'path';
import { t, gettext } from 'ttag';
import * as vscode from 'vscode';
import { TextDocument as lsTextDocument } from 'vscode-languageserver-types';

import { qore_vscode } from './qore_vscode';
import { parseJavaInheritance } from './qorus_java_utils';
import * as msg from './qorus_message';
import { filesInDir, hasSuffix, makeFileUri, suffixToIfaceKind } from './qorus_utils';
import { config_filename, QorusProject } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { loc2range, QoreTextDocument, qoreTextDocument } from './QoreTextDocument';
import { qorus_webview } from './QorusWebview';
import { field } from './qorus_creator/common_constants';
import { InterfaceInfo } from './qorus_creator/InterfaceInfo';
import * as globals from './global_config_item_values';
import { getJavaDocumentSymbolsWithWait } from './vscode_java';

const root_service = 'QorusService';
const root_job = 'QorusJob';
const root_workflow = 'QorusWorkflow';
const root_steps = ['QorusAsyncStep', 'QorusEventStep', 'QorusNormalStep', 'QorusSubworkflowStep',
                    'QorusAsyncArrayStep', 'QorusEventArrayStep', 'QorusNormalArrayStep', 'QorusSubworkflowArrayStep'];
const all_root_classes = [...root_steps, root_service, root_job, root_workflow];
const object_info_types = ['class', 'function', 'constant', 'mapper', 'value-map', 'group', 'event', 'queue'];
const info_keys = ['file_tree', 'yaml', 'modules'];
const object_types_with_version = ['step', 'mapper'];
const object_types_without_version = ['service', 'job', 'workflow', 'config-item-values', 'config-items',
                                      'class', 'constant', 'function', 'connection', 'event', 'group',
                                      'queue', 'value-map', 'mapper-code', 'type'];
const object_types = [...object_types_with_version, ...object_types_without_version];
export const default_version = '1.0';

const log_update_messages = false;

export class QorusProjectCodeInfo {
    private project: QorusProject;
    private iface_info: InterfaceInfo;

    private info_update_pending: any = {};
    private object_info: any = {};

    private yaml_data: any = {};

    private src_2_yaml: any = {};
    public yamlDataBySrcFile = file => this.yaml_data[this.src_2_yaml[file]];
    public yamlDataByFilePath = file => this.yaml_data[file];

    private class_2_yaml: any = {};       // all classes
    private java_class_2_yaml: any = {};  // only java classes
    public yamlDataByClass = class_name => this.yaml_data[this.class_2_yaml[class_name]];

    private name_2_yaml: any = {};
    public yamlDataByName = (type, name) => this.yaml_data[this.name_2_yaml[type][name]];
    private yamlDataByType = type => {
        let ret_val = {};
        for (const name in this.name_2_yaml[type] || {}) {
            ret_val[name] = this.yamlDataByName(type, name);
        }
        return ret_val;
    }

    private yaml_2_src: any = {};
    private file_tree: any[] = [];
    private dir_tree: any[] = [];
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

    private java_inheritance_pairs: any = {};
    private java_job_classes = {};
    private java_service_classes = {};
    private java_step_classes = {};
    private java_workflow_classes = {};

    private all_files_watcher: vscode.FileSystemWatcher;
    private yaml_files_watcher: vscode.FileSystemWatcher;
    private base_classes_files_watcher: vscode.FileSystemWatcher;
    private java_files_watcher: vscode.FileSystemWatcher;
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

    isJavaSymbolExpectedClass = (symbol: any, class_name?: string): boolean =>
        class_name &&
        symbol.kind === 5 &&
        class_name === symbol.name

    addClassCodeInfo = (file: string, symbol: any, base_class_name?: string, message_on_mismatch: boolean = true) => {
        const class_def_range: vscode.Range = loc2range(symbol.loc);
        const class_name_range: vscode.Range = loc2range(symbol.name.loc, 'class ');

        const num_inherited = (symbol.inherits || []).length;
        const base_class_names = (symbol.inherits || []).map(inherited => inherited.name.name);

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
                base_class_names,
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

    addJavaClassCodeInfo = (file: string, symbol: any, base_class_name?: string, message_on_mismatch: boolean = true) => {
        const class_def_range: vscode.Range = symbol.range;
        const class_name_range: vscode.Range = symbol.selectionRange;

        const addClassInfo = (main_base_class_ord: number = -1) => {
            if (!this.edit_info[file]) {
                this.edit_info[file] = {};
            }
            Object.assign(this.edit_info[file], {
                class_def_range,
                class_name_range,
                main_base_class_name_range: main_base_class_ord === -1
                    ? undefined
                    : symbol.extends.range,
                first_base_class_line: symbol.extends
                    ? symbol.extends.range.start.line
                    : undefined,
                last_class_line: symbol.range.end.line,
                base_class_names: base_class_name ? [base_class_name] : [],
                main_base_class_ord
            });
        };

        if (symbol.extends) {
            if (base_class_name) {
                if (symbol.extends.name === base_class_name) {
                    addClassInfo(0);
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

    addJavaClassDeclCodeInfo = (file: string, decl: any): boolean => {
        if (decl.kind !== 6) { // must be method
            return false;
        }

        this.addMethodInfo(file, decl.name.replace('()', ''), decl.range, decl.selectionRange);

        return true;
    }

    addFileCodeInfo(file: string, class_name?: string, base_class_name?: string, force: boolean = true): Promise<void> {
        const iface_kind = suffixToIfaceKind(path.extname(file));
        if (!iface_kind || (this.edit_info[file] && !force)) {
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

                for (const decl of symbol.declarations || []) {
                    this.addClassDeclCodeInfo(file, decl);
                }
            });
            return Promise.resolve();
        });
    }

    addJavaFileCodeInfo(file_path: string, class_name?: string, base_class_name?: string, force: boolean = true): Promise<void> {
        const yaml_info = this.yamlDataBySrcFile(file_path);
        const iface_kind = yaml_info.type;
        if (this.edit_info[file_path] && !force) {
            return Promise.resolve();
        }

        const doc: QoreTextDocument = qoreTextDocument(file_path);
        this.addTextLines(file_path, doc.text);

        return getJavaDocumentSymbolsWithWait(makeFileUri(file_path)).then(async symbols => {
            if (!symbols || !symbols.length) {
                return;
            }

            const lsdoc = lsTextDocument.create(
                makeFileUri(file_path), 'java', 1, fs.readFileSync(file_path).toString()
            );
            symbols.forEach(symbol => {
                if (!this.isJavaSymbolExpectedClass(symbol, class_name)) {
                    return;
                }

                parseJavaInheritance(lsdoc, symbol);
                this.addJavaClassCodeInfo(file_path, symbol, base_class_name);

                if (iface_kind !== 'service') {
                    return;
                }

                for (const child of symbol.children || []) {
                    this.addJavaClassDeclCodeInfo(file_path, child);
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

    private notifyTrees() {
        for (const key in this.notif_trees) {
            this.notif_trees[key].treeNotify();
        }
    }

    fileTree() {
        return this.file_tree;
    }

    interfaceDataByFile(file_path): Promise<any> {
        return this.waitForPending(['yaml']).then(() => {
            return this.yamlDataByFilePath(file_path);
        });
    }

    interfaceDataByType(iface_kind): Promise<any[]> {
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

    getInterfaceData = ({ iface_kind, name, class_name, include_tabs }) => {
        this.waitForPending(['yaml', 'edit_info']).then(() => {
            let raw_data;
            if (class_name) {
                raw_data = this.yamlDataByClass(class_name);
            } else {
                const name_key = object_types_with_version.includes(iface_kind) ? name : name.split(/:/)[0];
                raw_data = this.yamlDataByName(iface_kind, name_key);
            }
            const data = this.fixData(raw_data);

            const iface_id = this.iface_info.addIfaceById(data, iface_kind);

            qorus_webview.postMessage({
                action: 'return-interface-data',
                data: {
                    iface_kind,
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
        (this.yamlDataByClass(class_name)?.['class-connectors'] || [])
                .find(connector => connector.name === connector_name)

    pairFile = (file: string): string | undefined => {
        if (!hasSuffix(file, 'yaml')) {
            return (this.yamlDataBySrcFile(file) || {}).yaml_file;
        }

        const type = this.yaml_data[file]?.type;
        if (['service', 'job', 'workflow', 'step', 'class', 'constant', 'function', 'mapper-code'].includes(type)) {
            return this.yaml_2_src[file];
        }
        return undefined;
    }

    stepData = (step_structure: any[]): any => {
        const step_names: string[] = flattenDeep(step_structure);
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

    fixData(orig_data: any): any {
        let data = {...orig_data};

        if (data.options) {
            data[data.type + '_options'] = data.options;
            delete data.options;
        }
        if (data.autostart) {
            data[data.type + '-autostart'] = data.autostart;
            delete data.autostart;
        }

        ['functions', 'constants', 'mappers', 'value_maps', 'author',
            'mapper-code', 'groups', 'events', 'queues', 'keylist'].forEach(tag =>
        {
            if (data[tag]) {
                data[tag] = data[tag].map(name => ({ name }));
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
                    const splitter = field.code.indexOf('::') > -1 ? '::' : '.';
                    const code_parts = field.code.split(splitter);
                    if (code_parts.length === 2) {
                        const [class_name, method] = code_parts;
                        const mapper_code = this.yamlDataByClass(class_name);
                        if (mapper_code) {
                            field.code = `${mapper_code.name}.${method}`;
                        }
                    }
                }
            });
        }

        const classes_or_requires = data.type === 'class' ? 'requires' : 'classes';
        if (data[classes_or_requires]) {
            let classes = (data['class-prefixes'] || []).map(prefix_data => ({
                'class-name': prefix_data.class,
                name: this.yamlDataByClass(prefix_data.class)?.name,
                prefix: prefix_data.prefix
            }));

            data[classes_or_requires].forEach(class_name => {
                if (!classes.some(class_data => class_data['class-name'] === class_name)) {
                    classes.push({
                        name: this.yamlDataByClass(class_name)?.name,
                        'class-name': class_name
                    });
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

        (data['config-items'] || []).forEach(item => {

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

        for (const method of data.methods || []) {
            if (method.author) {
                method.author = method.author.map(value => ({ name: value }));
            }
        }

        if (data.type === 'mapper-code' && data.methods) {
            data['mapper-methods'] = data.methods;
            delete data.methods;
        }

        if (data.schedule) {
            const ordered_values = ['minutes', 'hours', 'days', 'months', 'dow'].map(key => data.schedule[key]);
            data.schedule = ordered_values.join(' ');
        }

        if (data.steps) {
            data['steps-info'] = this.stepData(data.steps);
        }

        if (data.type === 'step' && data['base-class-name']) {
            const step_type = (data.lang === 'java')
                ? this.javaStepType(data['base-class-name'])
                : this.stepType(data['base-class-name']);
            if (step_type) {
                data['step-type'] = step_type;
            }
        }

        if (!data.target_file && data.yaml_file) {
            data.target_file = path.basename(data.yaml_file);
        }

        delete data.code;
        delete data.yaml_file;

        return data;
    }

    private initInfo() {
        for (const type of [...object_info_types, 'author']) {
            this.object_info[type] = {};
        }

        this.job_classes = { [root_job]: true };
        this.service_classes = { [root_service]: true };
        this.workflow_classes = { [root_workflow]: true };

        this.java_job_classes = { [root_job]: true };
        this.java_service_classes = { [root_service]: true };
        this.java_workflow_classes = { [root_workflow]: true };

        for (const step_type of root_steps) {
            this.step_classes[step_type] = { [step_type]: true };
            this.java_step_classes[step_type] = { [step_type]: true };
        }

        this.file_tree = [];
        this.dir_tree = [];
        this.inheritance_pairs = {};
        this.java_inheritance_pairs = {};
        this.yaml_2_src = {};

        this.clearYamlInfo();
    }

    private clearYamlInfo = () => {
        this.yaml_data = {};

        this.src_2_yaml = {};
        this.class_2_yaml = {};

        for (const type of object_types) {
            this.name_2_yaml[type] = {};
        }
    }

    private flattenedStepClasses = () => {
        let ret_val = {};
        for (const step_type of root_steps) {
            Object.assign(ret_val, this.step_classes[step_type]);
        }
        return ret_val;
    }

    private flattenedJavaStepClasses = () => {
        let ret_val = {};
        for (const step_type of root_steps) {
            Object.assign(ret_val, this.java_step_classes[step_type]);
        }
        return ret_val;
    }

    private initFileWatchers() {
        this.all_files_watcher = vscode.workspace.createFileSystemWatcher('**/*');
        this.all_files_watcher.onDidCreate(() => this.update(['file_tree']));
        this.all_files_watcher.onDidDelete(() => this.update(['file_tree']));

        this.yaml_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.yaml');
        this.yaml_files_watcher.onDidCreate((uri: vscode.Uri) => this.addSingleYamlInfo(uri.fsPath));
        this.yaml_files_watcher.onDidChange(() => this.update(['yaml']));
        this.yaml_files_watcher.onDidDelete(() => this.update(['yaml']));

        this.base_classes_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.{qclass,qfd}');
        this.base_classes_files_watcher.onDidCreate(() => this.update(['lang_client']));
        this.base_classes_files_watcher.onDidChange(() => this.update(['lang_client']));
        this.base_classes_files_watcher.onDidDelete(() => this.update(['lang_client']));

        this.java_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.{java}');
        this.java_files_watcher.onDidCreate(() => this.update(['java_lang_client']));
        this.java_files_watcher.onDidChange(() => this.update(['java_lang_client']));
        this.java_files_watcher.onDidDelete(() => this.update(['java_lang_client']));

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

    getObjects(object_type: string, lang?: string) {
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
            case 'class':
                this.waitForPending(['yaml']).then(() => {
                    const objects = this.yamlDataByType(object_type === 'workflow-step' ? 'step' : object_type);
                    postMessage('objects', Object.keys(objects).map(key => ({
                        name: key,
                        desc: objects[key].desc
                    })));
                });
                break;
            case 'service-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.java_service_classes, [root_service]))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.service_classes, [root_service]))
                    );
                }
                break;
            case 'job-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.java_job_classes, [root_job]))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.job_classes, [root_job]))
                    );
                }
                break;
            case 'workflow-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.java_workflow_classes, [root_workflow]))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.workflow_classes, [root_workflow]))
                    );
                }
                break;
            case 'step-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.flattenedJavaStepClasses(), root_steps))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.flattenedStepClasses(), root_steps))
                    );
                }
                break;
            case 'base-class':
                this.waitForPending(['yaml']).then(() => {
                    const classes = lang === 'java' ? { ...this.java_class_2_yaml } : { ...this.class_2_yaml };
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
            case 'constant':
            case 'mapper':
            case 'value-map':
            case 'group':
            case 'event':
            case 'queue':
            case 'type':
                this.waitForPending(['yaml']).then(() => postMessage('objects',
                    Object.keys(this.object_info[object_type]).map(key => this.object_info[object_type][key]))
                );
                break;
            case 'class-with-connectors':
                this.waitForPending(['yaml']).then(() => {
                    const class_names = Object.keys(lang === 'java' ? this.java_class_2_yaml : this.class_2_yaml);
                    const classes = class_names.map(class_name => this.fixData(this.yamlDataByClass(class_name)))
                                               .filter(class_obj => class_obj['class-connectors']);
                    postMessage('objects', classes);
                });
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
                    this.baseClassesFromInheritancePairs();
                    this.javaBaseClassesFromInheritancePairs();
                    this.notifyTrees();
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

    mandatoryStepMethods = (base_class, lang) => {
        let { primary, array } = this.stepTriggerSignatures(base_class, lang);
        if (!primary) {
            return {};
        }

        primary.body = '';

        if (!array) {
            return { primary };
        }

        const array_body = {
            qore: 'return ();',
            java: 'return new Object[0];'
        };

        array.body = array_body[lang] || '';
        return { primary, array };
    }

    triggers = ({iface_kind, 'base-class-name': base_class = undefined}) => {
        switch (iface_kind) {
            case 'service': return ['start', 'stop', 'init'];
            case 'job':     return ['run'];
            case 'step':    return Object.keys(this.stepTriggerSignatures(base_class));
            default:        return [];
        }
    }

    stepTriggerSignatures = (base_class, lang = 'qore') => {
        let stepTriggerSignatures: any = {};

        stepTriggerSignatures.qore = base_class => {
            switch (this.stepType(base_class)) {
                case 'QorusNormalStep':
                    return {
                        primary: {signature: 'primary()'},
                        validation: {signature: 'string validation()'}
                    };
                case 'QorusNormalArrayStep':
                    return {
                        primary: {signature: 'primary(auto array_arg)', arg_names: ['array_arg']},
                        validation: {signature: 'string validation(auto array_arg)', arg_names: ['array_arg']},
                        array: {signature: 'softlist<auto> array()'}
                    };
                case 'QorusEventStep':
                case 'QorusSubworkflowStep':
                    return {
                        primary: {signature: 'primary()'}
                    };
                case 'QorusEventArrayStep':
                case 'QorusSubworkflowArrayStep':
                    return {
                        primary: {signature: 'primary(auto array_arg)', arg_names: ['array_arg']},
                        array: {signature: 'softlist<auto> array()'}
                    };
                case 'QorusAsyncStep':
                    return {
                        primary: {signature: 'primary()'},
                        validation: {signature: 'string validation(*string async_key)', arg_names: ['async_key']},
                        end: {signature: 'end(auto queue_data)', arg_names: ['queue_data']}
                    };
                case 'QorusAsyncArrayStep':
                    return {
                        primary: {signature: 'primary(auto array_arg)', arg_names: ['array_arg']},
                        validation: {signature: 'string validation(*string async_key, auto array_arg)', arg_names: ['async_key', 'array_arg']},
                        end: {signature: 'end(auto queue_data, auto array_arg)', arg_names: ['queue_data', 'array_arg']},
                        array: {signature: 'softlist<auto> array()'}
                    };
                default:
                    return {};
            }
        };

        stepTriggerSignatures.java = base_class => {
            const fixSignature = triggers => {
                Object.keys(triggers).forEach(trigger => {
                    triggers[trigger].signature = `public ${triggers[trigger].signature} throws Throwable`;
                });
                return triggers;
            };

            switch (this.javaStepType(base_class)) {
                case 'QorusNormalStep':
                    return fixSignature({
                        primary: {signature: 'void primary()'},
                        validation: {signature: 'String validation()'}
                    });
                case 'QorusNormalArrayStep':
                    return fixSignature({
                        primary: {signature: 'void primary(Object array_arg)', arg_names: ['array_arg']},
                        validation: {signature: 'String validation(Object array_arg)', arg_names: ['array_arg']},
                        array: {signature: 'Object[] array()'}
                    });
                case 'QorusEventStep':
                case 'QorusSubworkflowStep':
                    return fixSignature({
                        primary: {signature: 'void primary()'}
                    });
                case 'QorusEventArrayStep':
                case 'QorusSubworkflowArrayStep':
                    return fixSignature({
                        primary: {signature: 'void primary(Object array_arg)', arg_names: ['array_arg']},
                        array: {signature: 'Object[] array()'}
                    });
                case 'QorusAsyncStep':
                    return fixSignature({
                        primary: {signature: 'void primary()'},
                        validation: {signature: 'String validation(String async_key)', arg_names: ['async_key']},
                        end: {signature: 'void end(Object queue_data)', arg_names: ['queue_data']}
                    });
                case 'QorusAsyncArrayStep':
                    return fixSignature({
                        primary: {signature: 'void primary(Object array_arg)', arg_names: ['array_arg']},
                        validation: {signature: 'String validation(String async_key, Object array_arg)', arg_names: ['async_key', 'array_arg']},
                        end: {signature: 'void end(Object queue_data, Object array_arg)', arg_names: ['queue_data', 'array_arg']},
                        array: {signature: 'void Object[] array()'}
                    });
                default:
                    return {};
            }
        };

        return stepTriggerSignatures[lang](base_class);
    }

    javaStepType = (base_class: string): string | undefined => {
        for (const step_type of root_steps) {
            if (this.java_step_classes[step_type][base_class]) {
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
            if (yaml_data.lang === 'java') {
                this.java_class_2_yaml[class_name] = file;
            }
        }

        const addObjectName = (type: string, name: string) => {
            if (!this.object_info[type][name]) {
                this.object_info[type][name] = { name };
            }
        };

        for (const name of yaml_data.author || []) {
            addObjectName('author', name);
        }

        if (!yaml_data.type) {
            return;
        }

        const name = object_types_with_version.includes(yaml_data.type)
            ? `${yaml_data.name}:${yaml_data.version || default_version}`
            : yaml_data.type === 'type'
                ? yaml_data.path
                : yaml_data.name;

        if (!name) {
            return;
        }

        this.name_2_yaml[yaml_data.type][name] = file;

        if (object_info_types.includes(yaml_data.type)) {
            addObjectName(yaml_data.type, name);
        }

        const base_class_name = this.yaml_data[file]['base-class-name'];

        if (base_class_name) {
            this.yaml_data[file]['base-class-name'] = base_class_name;
        }

        if (class_name && base_class_name && ['class', 'step'].includes(yaml_data.type)) {
            this.inheritance_pairs[class_name] = [base_class_name];
            if (yaml_data.lang) {
                this.java_inheritance_pairs[class_name] = [base_class_name];
            }
        }
    }

    private updateYamlInfo(source_directories: string[]) {
        this.setPending('yaml', true);
        this.clearYamlInfo();
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

    private baseClasses = (base_classes: any, inheritance_pairs: any): any => {
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
    }

    private baseClassesFromInheritancePairs() {
        this.baseClasses(this.service_classes, { ...this.inheritance_pairs });
        this.baseClasses(this.job_classes, { ...this.inheritance_pairs });
        this.baseClasses(this.workflow_classes, { ...this.inheritance_pairs });
        for (const step_type of root_steps) {
            this.step_classes[step_type] =
                this.baseClasses(this.step_classes[step_type], { ...this.inheritance_pairs });
        }
    }

    private javaBaseClassesFromInheritancePairs() {
        this.baseClasses(this.java_service_classes, { ...this.java_inheritance_pairs });
        this.baseClasses(this.java_job_classes, { ...this.java_inheritance_pairs });
        this.baseClasses(this.java_workflow_classes, { ...this.java_inheritance_pairs });
        for (const step_type of root_steps) {
            this.java_step_classes[step_type] =
                this.baseClasses(this.java_step_classes[step_type], { ...this.java_inheritance_pairs });
        }
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

    setPending(info_key: string, value: boolean, never_message: boolean = false) {
        this.info_update_pending[info_key] = value;
        if (!never_message) {
            this.logUpdateMessage(info_key);
        }
    }

    private updateFileTree(source_directories: string[]) {
        this.setPending('file_tree', true);
        const dirItem = (abs_path: string, only_dirs: boolean) => ({
            abs_path,
            rel_path: this.project.relativeDirPath(abs_path),
            basename: path.basename(abs_path),
            dirs: [],
            ... only_dirs ? {} : { files: [] }
        });

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
            let file_tree_root = dirItem(path.join(this.project.folder, dir), false);
            file_tree.push(file_tree_root);
            subDirRecursion(file_tree_root, false);

            let dir_tree_root = dirItem(path.join(this.project.folder, dir), true);
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
            const all_mappers: any[] = Object.keys(this.object_info.mapper)
                                             .map(name => this.fixData(this.yamlDataByName('mapper', name)));

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
        vscode.window.showWarningMessage(
            t`ConfirmDeleteInterface ${iface_kind} ${name}`, t`Yes`, t`No`
        ).then(
            selection => {
                if (selection !== t`Yes`) {
                    return;
                }

                const iface_data = this.yamlDataByName(iface_kind, name);
                QorusProjectCodeInfo.deleteInterface({iface_kind, iface_data});
            }
        );
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
