import * as jsyaml from 'js-yaml';
import * as shortid from 'shortid';
import { qorus_webview } from '../QorusWebview';
import { default_version, QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { defaultValue } from './config_item_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';

const hasConfigItems = iface_kind => ['job', 'service', 'class', 'step'].includes(iface_kind);

export class InterfaceInfo {
    private code_info: QorusProjectCodeInfo;
    private iface_by_id = {};
    private last_conf_group: string;
    private are_orig_config_items_set: boolean = false;

    constructor(project_code_info: QorusProjectCodeInfo) {
        this.code_info = project_code_info;
    }

    private initIfaceId = (iface_id, iface_kind) => {
        if (!this.iface_by_id[iface_id]) {
            this.iface_by_id[iface_id] = {};
        }
        if (hasConfigItems(iface_kind) && !this.iface_by_id[iface_id]['config-items']) {
            this.iface_by_id[iface_id]['config-items'] = [];
            this.iface_by_id[iface_id]['orig-config-items'] = [];
        }
    }

    resetConfigItemsToOrig = iface_id => {
        this.iface_by_id[iface_id]['config-items'] =
            JSON.parse(JSON.stringify(this.iface_by_id[iface_id]['orig-config-items']));
        this.iface_by_id[iface_id]['orig-config-items'] = [];
        this.are_orig_config_items_set = false;
    }

    setOrigConfigItems = iface_id => {
        this.iface_by_id[iface_id]['orig-config-items'] =
            JSON.parse(JSON.stringify(this.iface_by_id[iface_id]['config-items']));
        this.are_orig_config_items_set = true;
    }

    addIfaceById = (data: any, iface_kind: string): string => {
        const id = shortid.generate();
        this.initIfaceId(id, iface_kind);
        this.iface_by_id[id] = data;
        this.code_info.waitForPending(['yaml']).then(() => {
            if (data['base-class-name']) {
                this.addClassConfigItems(data['base-class-name'], id);
            }
            (data.classes || []).forEach(class_data => {
                class_data.name && this.addClassConfigItems(class_data.name, id);
            });
        });
        return id;
    }

    getInfo = (id: string): any => {
        return this.iface_by_id[id];
    }

    get last_config_group(): string | undefined {
        return this.last_conf_group;
    }

    updateConfigItemValue = ({iface_id, iface_kind, name, value, level, parent_class, remove}) => {
        this.initIfaceId(iface_id, iface_kind);

        if (parent_class) {
            this.addClassConfigItems(parent_class, iface_id);
        }

        this.iface_by_id[iface_id]['config-items'].forEach(item => {
            if (item.name !== name || !level) {
                return;
            }

            if (['step', 'job', 'service', 'class'].includes(level)) {
                level = 'local';
            }

            if (value === null && remove) {
                delete item[level + '-value'];
                return;
            }

            let val;
            const non_star_type = (item.type && item.type[0] === '*') ? item.type.substr(1) : item.type;
            switch (non_star_type) {
                case 'int': val = parseInt(value); break;
                case 'float': val = parseFloat(value); break;
                case 'bool': val = JSON.parse(value); break;
                default: val = jsyaml.safeLoad(value);
            }

            item[level + '-value'] = val;
        });

        this.getConfigItems({iface_id, iface_kind});
    }

    updateConfigItem = ({iface_id, iface_kind, data: item}) => {
        this.initIfaceId(iface_id, iface_kind);

        if (item.can_be_undefined && item.type) {
            item.type = '*' + item.type
        }
        delete item.can_be_undefined;

        const index = this.iface_by_id[iface_id]['config-items'].findIndex(item2 => item2.name === item.name);
        if (index > -1) {
            this.iface_by_id[iface_id]['config-items'][index] = {
                ... this.iface_by_id[iface_id]['config-items'][index],
                ... item
            };
        }
        else {
            this.iface_by_id[iface_id]['config-items'].push(item);
        }

        if (item.config_group) {
            this.last_conf_group = item.config_group;
        }

        this.getConfigItems({iface_id, iface_kind});
    }

    private configItemInheritedData = raw_item => {
        if (!raw_item.parent) {
            return raw_item;
        }

        const parent_name = raw_item.parent['interface-name'];
        const parent_data = this.code_info.classYamlData(parent_name);
        if (!parent_data) {
            return raw_item;
        }

        const index = (parent_data['config-items'] || []).findIndex(item => item.name === raw_item.name);
        if (index === -1) {
            msg.error(t`ParentDoesNotHaveConfigItem ${parent_name} ${raw_item.name}`);
            return raw_item;
        }

        return {
            ... this.configItemInheritedData(parent_data['config-items'][index]),
            ... parent_data['config-items'][index]
        }
    }

    private addClassConfigItems = (class_name, iface_id) => {
        const class_yaml_data = this.code_info.classYamlData(class_name);
        if (!class_yaml_data) {
            return;
        }

        const version = class_yaml_data.version || default_version;

        (class_yaml_data['config-items'] || []).forEach(raw_item => {
            let item = { ...this.configItemInheritedData(raw_item) };

            const index = this.iface_by_id[iface_id]['config-items'].findIndex(item2 => item2.name === raw_item.name);

            item.parent_data = { ...item };
            item.parent = {
                'interface-type': 'class',
                'interface-name': class_name,
                'interface-version': version.toString()
            };
            item.parent_class = class_name;

            if (index > -1) {
                this.iface_by_id[iface_id]['config-items'][index] = {
                    ... item,
                    ... this.iface_by_id[iface_id]['config-items'][index]
                };
            }
            else {
                this.iface_by_id[iface_id]['config-items'].push(item);
            }
        });
    }

    getConfigItem = ({iface_id, name}) => {
        const config_items = iface_id && this.iface_by_id[iface_id] && this.iface_by_id[iface_id]['config-items'];
        const config_item = config_items ? config_items.find(item => item.name === name) : undefined;

        const message = {
            action: 'return-config-item',
            item: config_item
        };

        qorus_webview.postMessage(message);
    }

    removeBaseClass = ({iface_id, iface_kind}) => {
        this.initIfaceId(iface_id, iface_kind);
        const base_class_name = this.iface_by_id[iface_id]['base-class-name'];
        if (!base_class_name) {
            return;
        }

        delete this.iface_by_id[iface_id]['base-class-name'];

        if (!hasConfigItems(iface_kind)) {
            return;
        }

        const class_names = (this.iface_by_id[iface_id].classes || []).map(class_data => class_data.name);
        if (!class_names.includes(base_class_name)) {
            this.removeClassConfigItems(iface_id, base_class_name);
        }
        this.getConfigItems({iface_id, iface_kind});
    }

    removeClasses = ({iface_id, iface_kind}) => {
        this.initIfaceId(iface_id, iface_kind);
        this.removeClassesConfigItems(iface_id);
        delete this.iface_by_id[iface_id].classes;
        this.getConfigItems({iface_id, iface_kind});
    }

    private removeClassConfigItems = (iface_id, class_name) => {
        this.iface_by_id[iface_id]['config-items'] = this.iface_by_id[iface_id]['config-items'].filter(item =>
            !item.parent || item.parent['interface-name'] !== class_name
        );
    }

    private removeClassesConfigItems = (iface_id, new_classes_data = []) => {
        const new_classes = new_classes_data.map(class_data => class_data.name);
        const to_remove = (this.iface_by_id[iface_id].classes || []).filter(class_data =>
            !new_classes.includes(class_data.name) &&
            class_data.name !== this.iface_by_id[iface_id]['base-class-name']
        );
        to_remove.forEach(class_data => {this.removeClassConfigItems(iface_id, class_data.name)});
    }

    getConfigItems = params => {
        const {'base-class-name': base_class_name, classes, iface_id, iface_kind} = params;
        if (!iface_id) {
            return;
        }
        this.initIfaceId(iface_id, iface_kind);

        this.code_info.waitForPending(['yaml']).then(() => {
            if (base_class_name) {
                this.addClassConfigItems(base_class_name, iface_id);
                this.iface_by_id[iface_id]['base-class-name'] = base_class_name;
            }
            if (classes) {
                this.removeClassesConfigItems(iface_id, classes);
            }
            (classes || []).forEach(class_data => {
                class_data.name && this.addClassConfigItems(class_data.name, iface_id);
            });

            const items = [ ...this.iface_by_id[iface_id]['config-items'] || []];

            const default_type = defaultValue('type');

            const fixLocalItem = (item: any): any => {
                if (item.default_value) {
                    item.value = item.default_value;
                    item.level = 'default';
                    item.is_set = true;
                }
                for (const level of ['global', 'workflow', 'local']) {
                    const key = level + '-value';
                    if (item[key] !== undefined) {
                        item.value = item[key];
                        item.level = level === 'local' ? iface_kind : level;
                        item.is_set = true;
                    }
                }

                item.type = (item.type || default_type);

                return { ...item };
            };

            const checkValueLevel = (item: any, level: string): any => {
                const key = level + '-value';
                if (item[key] !== undefined) {
                    item.value = item[key];
                }
                else {
                    delete item.value;
                    delete item.is_set;
                }
                return { ...item };
            }

            const addYamlData = (item: any): any => {
                const toYaml = str => jsyaml.safeDump(str).replace(/\r?\n$/, '');

                let yaml_data_tag = {
                    ... item.value !== undefined ? {value: toYaml(item.value)} : {},
                    ... item.default_value !== undefined ? {default_value: toYaml(item.default_value)} : {},
                    ... item.allowed_values
                        ? {allowed_values: item.allowed_values.map(value => toYaml(value))}
                        : {}
                };

                return { ...item, yamlData: yaml_data_tag };
            };

            const local_items = (items || []).map(item => fixLocalItem(item));

            const global_items = local_items.filter(item => !item.strictly_local)
                                            .map(item => checkValueLevel({ ...item }, 'global'));

            const workflow_items = (iface_kind === 'step')
                ? local_items.filter(item => !item.strictly_local)
                             .map(item => checkValueLevel({ ...item }, 'workflow'))
                : [];

            const message = {
                action: 'return-config-items',
                items: local_items.map(item => addYamlData(item)),
                workflow_items: workflow_items.map(item => addYamlData(item)),
                global_items: global_items.map(item => addYamlData(item))
            };

            qorus_webview.postMessage(message);

            if (!this.are_orig_config_items_set) {
                this.setOrigConfigItems(iface_id);
            }
        });
    }
}
