import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yamljs';
import * as shortid from 'shortid';
import { qore_vscode } from './qore_vscode';
import { QorusExtension } from './qorus_vscode';
import { QorusProject } from './QorusProject';
import { qorus_webview } from './QorusWebview';
import { filesInDir, canBeParsed, canDefineInterfaceBaseClass, suffixToIfaceKind } from './qorus_utils';
import { QoreTextDocument, qoreTextDocument, loc2range } from './QoreTextDocument';
import { t, gettext } from 'ttag';
import * as msg from './qorus_message';
import { hasSuffix, flatten } from './qorus_utils';

const object_parser_subdir = 'qorus-object-parser';
const object_parser_script = 'qop.q -i';
const object_chunk_length = 100;
const root_service = 'QorusService';
const root_job = 'QorusJob';
const root_workflow = 'QorusWorkflow';
const root_steps = ['QorusAsyncStep', 'QorusEventStep', 'QorusNormalStep', 'QorusSubworkflowStep',
                    'QorusAsyncArrayStep', 'QorusEventArrayStep', 'QorusNormalArrayStep', 'QorusSubworkflowArrayStep'];
const log_update_messages = false;
const object_info_types = ['author', 'class', 'function', 'constant', 'mapper', 'value-map'];
const info_keys = ['file_tree', 'yaml', 'lang_client', 'objects', 'modules'];
const iface_kinds = ['service', 'job', 'workflow', 'step', 'class'];
const yaml_types = [...iface_kinds, 'config-item-values', 'config-items', 'connection', 'constant',
                    'event', 'function', 'group', 'mapper', 'queue', 'value-map'];
const default_version = '1.0';

export class QorusProjectCodeInfo {
    private project: QorusProject;

    private info_update_pending: any = {};
    private object_info: any = {};
    private yaml_data_by_src_file: any = {};
    private yaml_data_by_yaml_file: any = {};
    private yaml_data_by_class: any = {};
    private yaml_data_by_name: any = {};
    private yaml_2_src: any = {};
    private class_2_src: any = {};
    private file_tree: any = {};
    private dir_tree: any = {};
    private inheritance_pairs: any = {};
    private edit_info: any = {};
    private modules: string[] = [];
    private service_classes = {};
    private job_classes = {};
    private workflow_classes = {};
    private step_classes = {};
    private iface_by_id = {};

    private all_files_watcher: vscode.FileSystemWatcher;
    private yaml_files_watcher: vscode.FileSystemWatcher;
    private base_classes_files_watcher: vscode.FileSystemWatcher;
    private parsable_files_watcher: vscode.FileSystemWatcher;
    private module_files_watcher: vscode.FileSystemWatcher;

    constructor(project: QorusProject) {
        this.project = project;
        this.initInfo();
        this.initFileWatchers();
        this.update(undefined, true);
    }

    get yaml_info_by_src_file(): any {
        return this.yaml_data_by_src_file;
    }

    getYamlData(yaml_file: string): any {
        return this.yaml_data_by_yaml_file[yaml_file];
    }

    addText(document: vscode.TextDocument) {
        const file = document.uri.fsPath;
        const iface_kind = suffixToIfaceKind(path.extname(file));

        if (!this.edit_info[iface_kind][file]) {
            this.edit_info[iface_kind][file] = {};
        }
        this.edit_info[iface_kind][file].text_lines = [];
        for (let i = 0; i < document.lineCount; i++) {
            this.edit_info[iface_kind][file].text_lines.push(document.lineAt(i).text);
        }
    }

    addTextLines(file: string, contents: string) {
        const iface_kind = suffixToIfaceKind(path.extname(file));

        if (!this.edit_info[iface_kind][file]) {
            this.edit_info[iface_kind][file] = {};
        }
        this.edit_info[iface_kind][file].text_lines = contents.split(/\r?\n/);
    }

    addClassInfo(file: string, class_name_range: any, base_class_name_range: any) {
        const iface_kind = suffixToIfaceKind(path.extname(file));

        if (!this.edit_info[iface_kind][file]) {
            this.edit_info[iface_kind][file] = {};
        }
        this.edit_info[iface_kind][file].class_name_range = class_name_range;
        this.edit_info[iface_kind][file].base_class_name_range = base_class_name_range;
    }

    addServiceMethodInfo(file: string, method_name: string, decl_range: any, name_range: any) {

        if (!this.edit_info.service[file]) {
            this.edit_info.service[file] = {};
        }
        if (!this.edit_info.service[file].method_decl_ranges) {
            this.edit_info.service[file].method_decl_ranges = {};
            this.edit_info.service[file].method_name_ranges = {};
        }
        this.edit_info.service[file].method_decl_ranges[method_name] = decl_range;
        this.edit_info.service[file].method_name_ranges[method_name] = name_range;
    }

    addSymbolCodeInfo = (file: string, symbol: any): boolean => {
        if (symbol.nodetype !== 1 || symbol.kind !== 1 || ! symbol.inherits) { // declaration && class
            return false;
        }

        this.addClassInfo(
            file,
            loc2range(symbol.name.loc, 'class '),
            loc2range(symbol.inherits[0].name.loc)
        );

        return true;
    }

    addSymbolDeclCodeInfo = (file: string, decl: any): boolean => {
        if (decl.nodetype !== 1 || decl.kind !== 4) { // declaration && function
            return false;
        }

        if (decl.modifiers.indexOf('private') > -1) {
            return false;
        }

        const method_name = decl.name.name;
        const decl_range = loc2range(decl.loc);
        const name_range = loc2range(decl.name.loc);

        this.addServiceMethodInfo(
            file,
            method_name,
            decl_range,
            name_range
        );

        return true;
    }

    addFileCodeInfo(file: string, force: boolean = true): Promise<void> {
        const iface_kind = suffixToIfaceKind(path.extname(file));
        if (this.edit_info[iface_kind][file] && !force) {
            return Promise.resolve();
        }

        const doc: QoreTextDocument = qoreTextDocument(file);
        this.addTextLines(file, doc.text);

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            symbols.forEach(symbol => {
                this.addSymbolCodeInfo(file, symbol);

                if (iface_kind !== 'service') {
                    return;
                }

                for (let decl of symbol.declarations || []) {
                    this.addSymbolDeclCodeInfo(file, decl);
                }
            });
            return Promise.resolve();
        });
    }

    codeInfo(iface_kind: string, file: string) {
        return this.edit_info[iface_kind][file];
    }

    baseClassName(class_name: string): string | undefined {
        return this.inheritance_pairs[class_name];
    }

    addIfaceById = (data: any): string => {
        const id = shortid.generate();
        this.iface_by_id[id] = data;
        if (data['base-class-name']) {
            this.addClassConfigItems(data['base-class-name'], id);
        }
        return id;
    }

    ifaceById = (id: string): any => {
        return this.iface_by_id[id];
    }

    updateConfigItemValue = ({iface_id, name, value, level, parent_class}) => {
        this.initIfaceId(iface_id);

        if (parent_class) {
            this.addClassConfigItems(parent_class, iface_id);
        }

        this.iface_by_id[iface_id]['config-items'].forEach(item => {
            if (item.name === name && level) {
                item[level + '-value'] = value;
            }
        });

        this.getConfigItems({iface_id});
    }

    getInterfaceData = ({iface_kind, name, include_tabs}) => {
        this.waitForPending(['yaml', 'edit_info']).then(() => qorus_webview.postMessage({
            action: 'return-interface-data',
            data: {
                iface_kind: iface_kind,
                [iface_kind]: this.yaml_data_by_name[iface_kind][name],
                ... include_tabs ? {
                    tab: 'CreateInterface',
                    subtab: iface_kind
                } : {}
            }
        }));
    }

    pairFile = (file: string): string | undefined => {
        if (hasSuffix(file, 'yaml')) {
            return this.yaml_2_src[file];
        }
        return this.yaml_data_by_src_file[file] && this.yaml_data_by_src_file[file].yaml_file;
    }

    stepData = (step_structure: any[]): any => {
        const step_names: string[] = flatten(step_structure);
        let step_data = {};
        step_names.forEach(name => {
            step_data[name] = { ...this.yaml_data_by_name.step[name] };
            delete step_data[name].yaml_file;
        });
        return step_data;
    }

    private initInfo() {
        for (const type of object_info_types) {
            this.object_info[type] = {};
        }

        for (const iface_kind of iface_kinds) {
            this.edit_info[iface_kind] = {};
        }

        for (const yaml_type of yaml_types) {
            this.yaml_data_by_name[yaml_type] = {};
        }

        this.service_classes = {[root_service]: true};
        this.job_classes = {[root_job]: true};
        this.workflow_classes = {[root_workflow]: true};

        for (const step_type of root_steps) {
            this.step_classes[step_type] = {[step_type]: true};
        }
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

        this.parsable_files_watcher
            = vscode.workspace.createFileSystemWatcher('**/*.{qfd,qsd,qjob,qclass,qconst,qmapper,qvmap,java}');
        this.parsable_files_watcher.onDidCreate(() => this.update(['objects']));
        this.parsable_files_watcher.onDidChange(() => this.update(['objects']));
        this.parsable_files_watcher.onDidDelete(() => this.update(['objects']));

        this.module_files_watcher = vscode.workspace.createFileSystemWatcher('**/*.qm');
        this.module_files_watcher.onDidCreate(() => this.update(['modules']));
        this.module_files_watcher.onDidDelete(() => this.update(['modules']));
    }

    waitForPending(info_list: string[], timeout: number = 30000): Promise<void> {
        let interval_id: any;
        const interval = 100;
        let n = timeout/interval;

        return new Promise((resolve, reject) => {
            const checkPending = () => {
                const pending_list = info_list.filter(key => this.info_update_pending[key]);
                if (!pending_list.length || !--n) {
                    clearInterval(interval_id);
                    if (n > 0) {
                        resolve();
                    }
                    else {
                        const error = t`CodeInfoUpdateTimedOut`
                            + pending_list.map(key => gettext(key + '_info_update_pending')) .join(', ');
                        msg.error(error);
                        reject(error);
                    }
                }
            };

            interval_id = setInterval(checkPending, interval);
        });
    }

    getObjects(object_type: string) {
        const postMessage = (return_type: string, objects: any) => {
            qorus_webview.postMessage({
                action: 'creator-return-' + return_type,
                object_type,
                [return_type]: objects
            });
        };

        switch (object_type) {
            case 'workflow-step':
                const steps = this.yaml_data_by_name.step;
                this.waitForPending(['objects', 'yaml']).then(() => postMessage('objects',
                    Object.keys(steps).map(key => ({
                        name: key,
                        desc: steps[key].desc
                    }))));
                break;
            case 'service-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() => postMessage('objects',
                    this.addDescToBaseClasses(this.service_classes, [root_service])));
                break;
            case 'job-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() => postMessage('objects',
                    this.addDescToBaseClasses(this.job_classes, [root_job])));
                break;
            case 'workflow-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() => postMessage('objects',
                    this.addDescToBaseClasses(this.workflow_classes, [root_workflow])));
                break;
            case 'step-base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() => postMessage('objects',
                    this.addDescToBaseClasses(this.flattenedStepClasses(), root_steps)));
                break;
            case 'base-class':
                this.waitForPending(['yaml', 'lang_client']).then(() => {
                    const classes = {...this.class_2_src};
                    const current_class =
                        qorus_webview.opening_data &&
                        qorus_webview.opening_data.class &&
                        qorus_webview.opening_data.class['class-name'];
                    delete classes[current_class];
                    postMessage('objects', this.addDescToBaseClasses(classes));
                });
                break;
            case 'author':
            case 'function':
            case 'class':
            case 'constant':
            case 'mapper':
            case 'value-map':
                this.waitForPending(['objects', 'yaml']).then(() => postMessage('objects',
                    Object.keys(this.object_info[object_type]).map(key => this.object_info[object_type][key])));
                break;
            case 'module':
                this.waitForPending(['modules']).then(() => postMessage('objects',
                    this.modules.map(name => ({name}))));
                break;
            case 'resource':
            case 'text-resource':
            case 'bin-resource':
            case 'template':
                this.waitForPending(['file_tree']).then(() => postMessage('resources', this.file_tree));
                break;
            case 'target_dir':
                this.waitForPending(['file_tree']).then(() => postMessage('directories', this.dir_tree));
                break;
            default:
                msg.error(t`UnknownInterfaceProperty ${object_type}`);
        }
    }

    private setAllPending(pending: boolean = true) {
        for (const key of info_keys) {
            this.info_update_pending[key] = pending;
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

    update(info_list: string[] = info_keys, is_initial_update: boolean = false) {
        this.project.validateConfigFileAndDo(file_data => {
            if (file_data.source_directories.length === 0) {
                this.setAllPending(false);
                return;
            }
            if (is_initial_update) {
                this.setAllPending(true);
            }

            if (info_list.includes('file_tree')) {
                setTimeout(() => {
                    this.updateFileTree(file_data.source_directories);
                }, 0);
            }
            if (info_list.includes('lang_client')) {
                setTimeout(() => {
                    this.updateLanguageClientInfo(file_data.source_directories);
                }, 0);
            }
            if (info_list.includes('yaml')) {
                this.waitForPending(['lang_client']).then(() => {
                    setTimeout(() => {
                        this.updateYamlInfo(file_data.source_directories);
                    }, 0);
                });
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
                msg.log(t`CodeInfoUpdateStarted ${this.project.folder}` + ' ' + new Date().toString());

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

    private stepType = (base_class: string): string | undefined => {
        for (const step_type of root_steps) {
            if (this.step_classes[step_type][base_class]) {
                return step_type;
            }
        }
        return undefined;
    }

    addSingleYamlInfo(file: string) {
        let parsed_data: any;
        try {
            parsed_data = yaml.load(file);
        } catch (error) {
            msg.debug({file, error});
            return;
        }

        let yaml_data = {
            ...parsed_data,
            yaml_file: file,
            target_dir: path.dirname(file)
        };
        yaml_data.target_file = yaml_data.code;

        this.yaml_data_by_yaml_file[file] = yaml_data;

        if (yaml_data.steps) {
            try {
                yaml_data.steps = JSON.parse(yaml_data.steps);
            } catch (error) {
                msg.debug({file, error});
            }
        }

        if (yaml_data.code) {
            const src = path.join(path.dirname(file), yaml_data.code);
            this.yaml_data_by_src_file[src] = yaml_data;
            this.yaml_2_src[file] = src;
        }
        const class_name = yaml_data['class-name'];
        if (class_name) {
            this.yaml_data_by_class[class_name] = yaml_data;
        }

        if (yaml_data.name && yaml_data.type) {
            const name_version = `${yaml_data.name}:${yaml_data.version || default_version}`;
            this.yaml_data_by_name[yaml_data.type][name_version] = yaml_data;

            if (class_name) {
                const base_class_name = this.baseClassName(class_name);

                if (base_class_name) {
                    this.yaml_data_by_name[yaml_data.type][name_version]['base-class-name'] = base_class_name;

                    if (yaml_data.type === 'step' && base_class_name) {
                        const step_type = this.stepType(base_class_name);
                        if (step_type) {
                            this.yaml_data_by_name.step[name_version]['step-type'] = step_type;
                        }
                    }
                }
            }
        }

        const addObjectName = (type: string, name: string) => {
            if (!this.object_info[type][name]) {
                this.object_info[type][name] = { name };
            }
        };
        const types = {
            author: 'author',
            classes: 'class',
            functions: 'function',
            constants: 'constant',
            mappers: 'mapper',
            vmaps: 'value-map'
        };
        for (const key of Object.keys(types)) {
            for (const name of yaml_data[key] || []) {
                addObjectName(types[key], name);
            }
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
                    if (base_classes[inheritance_pairs[name]]) {
                        base_classes[name] = true;
                        delete inheritance_pairs[name];
                        any_new = true;
                        break;
                    }
                }
            }
            return base_classes;
        };

        baseClasses(this.service_classes, {...this.inheritance_pairs});
        baseClasses(this.job_classes, {...this.inheritance_pairs});
        baseClasses(this.workflow_classes, {...this.inheritance_pairs});
        for (const step_type of root_steps) {
            this.step_classes[step_type] = baseClasses(this.step_classes[step_type], {...this.inheritance_pairs});
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

            const inherited = symbol.inherits[0];
            if (inherited.name && inherited.name.name) {
                this.inheritance_pairs[class_name] = inherited.name.name;
            }
        }).then(() => {
            this.baseClassesFromInheritancePairs();
            this.setPending('lang_client', false);
        });
    }

    private initIfaceId = iface_id => {
        if (!this.iface_by_id[iface_id]) {
            this.iface_by_id[iface_id] = {};
        }
        if (!this.iface_by_id[iface_id]['config-items']) {
            this.iface_by_id[iface_id]['config-items'] = [];
        }
    }

    private addClassConfigItems = (class_name, iface_id) => {
        this.initIfaceId(iface_id);

        if (class_name && this.iface_by_id[iface_id].base_class_name !== class_name) {
            this.iface_by_id[iface_id].base_class_name = class_name;

            const class_src_file = this.class_2_src[class_name];
            const class_yaml_data = this.yaml_data_by_src_file[class_src_file];
            if (!class_yaml_data) {
                msg.log(t`UnableFindYamlForClass ${class_name}`);
            }

            const version = this.yaml_data_by_class[class_name].version || default_version;

            (class_yaml_data['config-items'] || []).forEach(item => {
                const index = this.iface_by_id[iface_id]['config-items'].findIndex(item2 => item2.name === item.name);

                if (index > -1) {
                    this.iface_by_id[iface_id]['config-items'][index] = {
                        ... item,
                        ... this.iface_by_id[iface_id]['config-items'][index]
                    }
                }
                else {
                    item.parent = {
                        'interface-type': 'class',
                        'interface-name': class_name,
                        'interface-version': version
                    }
                    item.parent_class = class_name;
                    this.iface_by_id[iface_id]['config-items'].push(item);
                }
            });
        }
    }

    getConfigItems(params) {
        const {'base-class-name': base_class_name, iface_id, iface_kind} = params;
        if (!iface_id) {
            return;
        }
        this.initIfaceId(iface_id);

        this.waitForPending(['yaml', 'lang_client']).then(() => {
            if (base_class_name) {
                this.addClassConfigItems(base_class_name, iface_id);
            }
            const items = [ ...this.iface_by_id[iface_id]['config-items'] || []];

            const addOtherTags = (item: any): any => {
                let yaml_data_tag = {
                    ... item.value ? {value: yaml.stringify(item.value)} : {},
                    ... item.default_value ? {default_value: yaml.stringify(item.default_value)} : {},
                    ... item.allowed_values
                        ? {allowed_values: item.allowed_values.map(value => yaml.stringify(value))}
                        : {}
                };
                return {...item, yamlData: yaml_data_tag};
            };

            const local_items = (items || []).map(item => addOtherTags(item));
            const global_items = local_items.filter(item => !item.strictly_local && item.is_set);
            const workflow_items = (iface_kind === 'step')
                ? local_items.filter(item => !item.strictly_local)
                : [];

            const renameValue = (item, prefix) => {
                const key = prefix + '-value';
                if (item[key]) {
                    item.value = item[key];
                    delete item[key];
                }
                return item;
            }

            const message = {
                action: 'return-config-items',
                items: local_items.map(item => renameValue(item, 'local')),
                global_items: global_items.map(item => renameValue(item, 'global')),
                workflow_items: workflow_items.map(item => renameValue(item, 'workflow'))
            };

            qorus_webview.postMessage(message);
        });
    }

    private addDescToBaseClasses(base_classes: any, root_classes: string[] = []): any[] {
        let ret_val = [];
        for (const base_class of Object.keys(base_classes)) {
            const desc = root_classes.includes(base_class)
                ? gettext(`${base_class}Desc`)
                : this.yaml_data_by_class[base_class]
                    ? this.yaml_data_by_class[base_class].desc
                    : undefined;
            ret_val.push({name: base_class, desc});
        }
        return ret_val;
    }

    private processDocumentSymbols(
            source_directories: string[],
            file_filter: Function,
            process: Function): Promise<void>
    {
        return new Promise((resolve, reject) => {
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
                    n > 0 ? resolve() : reject(t`GettingDocSymbolsTimedOut`);
                }
            };

            interval_id = setInterval(checkPending, interval);
        });
    }

    setPending(info_key: string, value: boolean) {
        this.info_update_pending[info_key] = value;
        this.logUpdateMessage(info_key);
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
                const entry_path: string = path.join(tree_item.abs_path, entry);
                if (fs.lstatSync(entry_path).isDirectory()) {
                    let dir_item = dirItem(entry_path, only_dirs);
                    tree_item.dirs.push(dir_item);
                    subDirRecursion(dir_item, only_dirs);
                } else if (!only_dirs) {
                    tree_item.files.push({
                        abs_path: tree_item.abs_path,
                        rel_path: vscode.workspace.asRelativePath(tree_item.abs_path, false),
                        name: entry
                    });
                }
            }
        };

        let file_tree: any = dirItem(this.project.folder, false, true);
        let dir_tree: any = dirItem(this.project.folder, true, true);

        for (let dir of source_directories) {
            let file_tree_root = dirItem(path.join(this.project.folder, dir), false);
            file_tree.dirs.push(file_tree_root);
            subDirRecursion(file_tree_root, false);

            let dir_tree_root = dirItem(path.join(this.project.folder, dir), true);
            dir_tree.dirs.push(dir_tree_root);
            subDirRecursion(dir_tree_root, true);
        }

        this.file_tree = file_tree;
        this.dir_tree = dir_tree;
        this.setPending('file_tree', false);
    }

    private updateObjects(source_directories: string[]) {
        const object_parser_dir = path.join(QorusExtension.context.extensionPath, object_parser_subdir);
        const object_parser_path = path.join(object_parser_dir, object_parser_script);
        this.setPending('objects', true);
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

                this.info_update_pending['objects'] = true;
                num_pending++;

                let command_parts = files.splice(0, object_chunk_length);
                command_parts.unshift(object_parser_path);
                const command: string = command_parts.join(' ');
                const options = {
                    maxBuffer: 99999999,
                    env: {
                        ... process.env,
                        QORE_MODULE_DIR: object_parser_dir
                    }
                };

                child_process.exec(command, options, (error, stdout, stderr) => {

                    if (error) {
                        msg.error(t`QopError ${error}`);
                        if (stderr) {
                            msg.error(stderr);
                        }
                        this.info_update_pending['objects'] = false;
                        child_process_failed = true;
                        return;
                    }

                    const objects: any[] = JSON.parse(stdout.toString());

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

                        this.object_info[obj.type][obj.tags.name] = {
                            name: obj.tags.name,
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
