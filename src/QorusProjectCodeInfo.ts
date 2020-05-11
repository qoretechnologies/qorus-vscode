import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as lodashIsArray from 'lodash/isArray';
import * as lodashIsObject from 'lodash/isObject';
import * as sortBy from 'lodash/sortBy';
import * as flattenDeep from 'lodash/flattenDeep';
import * as path from 'path';
import { t, gettext } from 'ttag';
import * as vscode from 'vscode';
import { TextDocument as lsTextDocument } from 'vscode-languageserver-types';

import { QorusProjectYamlInfo} from './QorusProjectYamlInfo';
import { qore_vscode } from './qore_vscode';
import { parseJavaInheritance } from './qorus_java_utils';
import * as msg from './qorus_message';
import { types_with_version, root_steps, root_service, root_job, root_workflow,
         all_root_classes } from './qorus_constants';
import { filesInDir, hasSuffix, makeFileUri, suffixToIfaceKind, capitalize, isObject } from './qorus_utils';
import { config_filename, QorusProject } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { loc2range, QoreTextDocument, qoreTextDocument } from './QoreTextDocument';
import { qorus_webview } from './QorusWebview';
import { field } from './qorus_creator/common_constants';
import { InterfaceInfo } from './qorus_creator/InterfaceInfo';
import * as globals from './global_config_item_values';
import { getJavaDocumentSymbolsWithWait } from './vscode_java';
import { interface_tree } from './QorusInterfaceTree';

const info_keys = ['file_tree', 'yaml', 'modules'];

const log_update_messages = false;

export class QorusProjectCodeInfo {
    private project: QorusProject;
    private iface_info: InterfaceInfo;
    private yaml_files_info: QorusProjectYamlInfo;

    private info_update_pending: any = {};
    private file_tree: any[] = [];
    private dir_tree: any[] = [];
    private all_dir_tree: any = {};
    private edit_info: any = {};
    private modules: string[] = [];
    private source_directories = [];
    private mapper_types: any[] = [];

    private all_files_watcher: vscode.FileSystemWatcher;
    private yaml_files_watcher: vscode.FileSystemWatcher;
    private base_classes_files_watcher: vscode.FileSystemWatcher;
    private java_files_watcher: vscode.FileSystemWatcher;
    private module_files_watcher: vscode.FileSystemWatcher;
    private config_file_watcher: vscode.FileSystemWatcher;

    private notif_trees = [interface_tree];

    constructor(project: QorusProject) {
        this.project = project;
        this.yaml_files_info = new QorusProjectYamlInfo();
        this.iface_info = new InterfaceInfo(this.yaml_files_info);
        this.initInfo();
        this.initFileWatchers();
        this.update(undefined, true);
    }

    get interface_info(): any {
        return this.iface_info;
    }

    get yaml_info(): any {
        return this.yaml_files_info;
    }

    getProject(): QorusProject {
        return this.project;
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

        let lines = contents.split(/\r?\n/);
        while (lines[0] === '') {
            lines.shift();
        }
        while (lines[lines.length-1] === '') {
            lines.pop();
        }

        this.edit_info[file].text_lines = lines;
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

    static isSymbolExpectedClass = (symbol: any, class_name?: string): boolean =>
        class_name &&
        symbol.nodetype === 1 &&
        symbol.kind === 1 &&
        symbol.name &&
        class_name === symbol.name.name

    isJavaSymbolExpectedClass = (symbol: any, class_name?: string): boolean =>
        class_name &&
        symbol.kind === 5 &&
        class_name === symbol.name

    private addClassCodeInfo = (file: string, symbol: any, base_class_name?: string, message_on_mismatch: boolean = true) => {
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

    static isDeclPublicMethod = (decl: any): boolean => {
        if (decl.nodetype !== 1 || decl.kind !== 4) { // declaration && function
            return false;
        }

        if (decl.modifiers.indexOf('private') > -1) {
            return false;
        }

        return true;
    }

    private addClassDeclCodeInfo = (file: string, decl: any) => {
        if (!QorusProjectCodeInfo.isDeclPublicMethod(decl)) {
            return;
        }

        const method_name = decl.name.name;
        const decl_range = loc2range(decl.loc);
        const name_range = loc2range(decl.name.loc);

        this.addMethodInfo(file, method_name, decl_range, name_range);
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
                if (!QorusProjectCodeInfo.isSymbolExpectedClass(symbol, class_name)) {
                    return;
                }

                this.addClassCodeInfo(file, symbol, base_class_name);

                if (!['service', 'mapper-code'].includes(iface_kind)) {
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
        const yaml_info = this.yaml_info.yamlDataBySrcFile(file_path);
        const iface_kind = yaml_info.type;
        if (this.edit_info[file_path] && !force) {
            return Promise.resolve();
        }

        const doc: QoreTextDocument = qoreTextDocument(file_path);
        this.addTextLines(file_path, doc.text);

        return getJavaDocumentSymbolsWithWait(makeFileUri(file_path)).then(async symbols => {
            if (!symbols || !symbols.length) {
                return Promise.reject(t`NoEditInfo ${file_path}`);
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

    getInterfaceData = ({ iface_kind, name, class_name, include_tabs, custom_data }) => {
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
                action: 'return-interface-data',
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

        const type = this.yaml_info.yamlDataByName('type', path.join(name, path_in_data));
        if (type) {
            const {typeinfo} = type;
            if (typeinfo) {
                postMessage(typeinfo);
                return;
            }
        }

        const onSuccess = response => {
            const data = JSON.parse(response);
            postMessage(data);
        };

        const onError = error => {
            msg.error(error);
            postMessage();
        };

        qorus_request.doRequest(url, 'GET', onSuccess, onError);
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
                    const splitter = field.code.indexOf('::') > -1 ? '::' : '.';
                    const code_parts = field.code.split(splitter);
                    if (code_parts.length === 2) {
                        const [class_name, method] = code_parts;
                        const mapper_code = this.yaml_info.yamlDataByName('mapper-code', class_name);
                        if (mapper_code) {
                            field.code = `${mapper_code.name}.${method}`;
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
            const step_type = (data.lang === 'java')
                ? this.javaStepType(data['base-class-name'])
                : this.stepType(data['base-class-name']);
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
        this.yaml_files_watcher.onDidCreate((uri: vscode.Uri) => this.yaml_info.addSingleYamlInfo(uri.fsPath));
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
            case 'service-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.javaServiceClasses(), [root_service]))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.serviceClasses(), [root_service]))
                    );
                }
                break;
            case 'job-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.javaJobClasses(), [root_job]))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.jobClasses(), [root_job]))
                    );
                }
                break;
            case 'workflow-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.javaWorkflowClasses(), [root_workflow]))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.workflowClasses(), [root_workflow]))
                    );
                }
                break;
            case 'step-base-class':
                if (lang === 'java') {
                    this.waitForPending(['yaml', 'java_lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.allJavaStepClasses(), root_steps))
                    );
                } else {
                    this.waitForPending(['yaml', 'lang_client']).then(() =>
                        postMessage('objects', this.addDescToClasses(this.yaml_info.allStepClasses(), root_steps))
                    );
                }
                break;
            case 'base-class':
                this.waitForPending(['yaml']).then(() => {
                    const classes = this.yaml_info.yamlDataByType('class');
                    const user_classes = Object.keys(classes).map(key => ({
                        name: key,
                        desc: classes[key].desc
                    }));

                    const qorus_root_classes = this.addDescToClasses(all_root_classes, all_root_classes);

                    postMessage('objects', [ ...user_classes, ...qorus_root_classes ]);
                });

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
                    this.yaml_info.baseClassesFromInheritancePairs();
                    this.yaml_info.javaBaseClassesFromInheritancePairs();
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
                        array: {signature: 'Object[] array()'}
                    });
                default:
                    return {};
            }
        };

        return stepTriggerSignatures[lang](base_class);
    }

    javaStepType = (base_class: string): string | undefined => {
        for (const step_type of root_steps) {
            if (this.yaml_info.javaStepClasses(step_type)[base_class]) {
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
        vscode.window.showWarningMessage(
            t`ConfirmDeleteInterface ${iface_kind} ${name}`, t`Yes`, t`No`
        ).then(
            selection => {
                if (selection !== t`Yes`) {
                    return;
                }

                const iface_data = this.yaml_info.yamlDataByName(iface_kind, name);
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
