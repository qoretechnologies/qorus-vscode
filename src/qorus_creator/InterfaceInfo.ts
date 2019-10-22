import * as jsyaml from 'js-yaml';
import * as shortid from 'shortid';
import { qorus_webview } from '../QorusWebview';
import { default_version, QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { defaultValue } from './config_item_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';

export class InterfaceInfo {
    private code_info: QorusProjectCodeInfo;
    private iface_by_id = {};
    private last_conf_group: string;

    constructor(project_code_info: QorusProjectCodeInfo) {
        this.code_info = project_code_info;
    }

    private initIfaceId = iface_id => {
        if (!this.iface_by_id[iface_id]) {
            this.iface_by_id[iface_id] = {};
        }
        if (!this.iface_by_id[iface_id]['config-items']) {
            this.iface_by_id[iface_id]['config-items'] = [];
        }
    }

    addIfaceById = (data: any): string => {
        const id = shortid.generate();
        this.iface_by_id[id] = data;
        if (data['base-class-name']) {
            this.addClassConfigItems(data['base-class-name'], id);
        }
        return id;
    }

    getInfo = (id: string): any => {
        return this.iface_by_id[id];
    }

    get last_config_group(): string | undefined {
        return this.last_conf_group;
    }

    updateConfigItemValue = ({iface_id, iface_kind, name, value, level, parent_class}) => {
        this.initIfaceId(iface_id);

        if (parent_class) {
            this.addClassConfigItems(parent_class, iface_id);
        }

        this.iface_by_id[iface_id]['config-items'].forEach(item => {
            if (item.name !== name || !level) {
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

            if (['step', 'job', 'service'].includes(level)) {
                level = 'local';
            }
            item[level + '-value'] = val;
        });

        this.getConfigItems({iface_id, iface_kind});
    }

    updateConfigItem = ({iface_id, iface_kind, data: item}) => {
        this.initIfaceId(iface_id);

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

        return this.configItemInheritedData(parent_data['config-items'][index]);
    }

    private addClassConfigItems = (class_name, iface_id) => {
        this.initIfaceId(iface_id);

        const class_yaml_data = this.code_info.classYamlData(class_name);
        if (!class_yaml_data) {
            return;
        }

        this.iface_by_id[iface_id].base_class_name = class_name;

        const version = class_yaml_data.version || default_version;

        (class_yaml_data['config-items'] || []).forEach(raw_item => {
            let item = { ...this.configItemInheritedData(raw_item) };

            const index = this.iface_by_id[iface_id]['config-items'].findIndex(item2 => item2.name === raw_item.name);

            item.parent_data = { ...item };
            item.parent = {
                'interface-type': 'class',
                'interface-name': class_name,
                'interface-version': parseFloat(version) == version ? `"${version}"` : version
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

    getConfigItems(params) {
        const {'base-class-name': base_class_name, iface_id, iface_kind} = params;
        if (!iface_id) {
            return;
        }
        this.initIfaceId(iface_id);

        this.code_info.waitForPending(['yaml', 'lang_client']).then(() => {
            if (base_class_name) {
                this.addClassConfigItems(base_class_name, iface_id);
            }
            const items = [ ...this.iface_by_id[iface_id]['config-items'] || []];

            const fixLocalItems = (item: any): any => {
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

                item.type = item.type || defaultValue('type');

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

            const local_items = (items || []).map(item => fixLocalItems(item));

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
        });
    }
}
