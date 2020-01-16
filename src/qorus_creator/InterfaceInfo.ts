import * as jsyaml from 'js-yaml';
import * as shortid from 'shortid';
import * as flattenDeep from 'lodash/flattenDeep';
import { qorus_webview } from '../QorusWebview';
import { default_version, QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { defaultValue } from './config_item_constants';
import { hasConfigItems } from '../qorus_utils';
import { t } from 'ttag';
import * as msg from '../qorus_message';


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
        if (!this.checkIfaceId(iface_id)) {
            return;
        }

        this.iface_by_id[iface_id]['config-items'] =
            JSON.parse(JSON.stringify(this.iface_by_id[iface_id]['orig-config-items'] || []));
        this.iface_by_id[iface_id]['orig-config-items'] = [];
        this.are_orig_config_items_set = false;
    }

    setOrigConfigItems = iface_id => {
        if (!this.checkIfaceId(iface_id)) {
            return;
        }

        this.iface_by_id[iface_id]['orig-config-items'] =
            JSON.parse(JSON.stringify(this.iface_by_id[iface_id]['config-items'] || []));
        this.are_orig_config_items_set = true;
    }

    private checkIfaceId = (iface_id): boolean => {
        if (!this.iface_by_id[iface_id]) {
            msg.log(t`UnexpectedIfaceId`);
            return false;
        }
        return true;
    }

    addIfaceById = (data: any, iface_kind: string): string => {
        const id = shortid.generate();
        this.initIfaceId(id, iface_kind);
        this.iface_by_id[id] = data;
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

        const parseValue = value_type => {
            const non_star_type = (value_type && value_type[0] === '*') ? value_type.substr(1) : value_type;
            switch (non_star_type) {
                case 'int': return parseInt(value);
                case 'float': return parseFloat(value);
                case 'bool': return JSON.parse(value);
                default: return jsyaml.safeLoad(value);
            }
        };

        if (level === 'workflow') {
            if (iface_kind !== 'workflow') {
                msg.error(t`WorkflowConfigItemValueForNonWorkflow`);
                return;
            }

            const items = this.workflowStepsConfigItems(this.iface_by_id[iface_id].steps);
            const index = items.findIndex(item => item.name === name);
            if (index > -1 && items[index].type) {
                const type = items[index].type;

                this.iface_by_id[iface_id]['config-item-values']
                    = this.iface_by_id[iface_id]['config-item-values'] || [];

                const index2 = this.iface_by_id[iface_id]['config-item-values']
                    .findIndex(ci_value => ci_value.name === name);

                if (index2 > -1) {
                    this.iface_by_id[iface_id]['config-item-values'][index2].value = parseValue(type);
                } else {
                    this.iface_by_id[iface_id]['config-item-values'].push({name, value: parseValue(type)});
                }
            } else {
                msg.error(t`CannotDetermineConfigItemValueType`);
            }
        } else {
            if (parent_class) {
                this.addClassConfigItems(iface_id, parent_class);
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
                    if (level === 'global') {
                        item['remove-global-value'] = true;
                    }
                    return;
                }

                item[level + '-value'] = parseValue(item.type);
            });
        }
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

    deleteConfigItem = ({iface_id, iface_kind, name}) => {
        if (!this.checkIfaceId(iface_id)) {
            return;
        }

        iface_kind = iface_kind || this.iface_by_id[iface_id].type;

        const index = this.iface_by_id[iface_id]['config-items'].findIndex(item => item.name === name);
        if (index > -1) {
            this.iface_by_id[iface_id]['config-items'].splice(index, 1);
        } else {
            msg.error(t`ConfigItemNotFound ${name}`);
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

    private addClassConfigItems = (iface_id, class_name, prefix?) => {
        const class_yaml_data = this.code_info.classYamlData(class_name);
        if (!class_yaml_data) {
            return;
        }

        const version = class_yaml_data.version || default_version;

        (class_yaml_data['config-items'] || []).forEach(raw_item => {
            let item = { ...this.configItemInheritedData(raw_item) };

            item.parent_data = { ...item };
            item.parent = {
                'interface-type': 'class',
                'interface-name': class_name,
                'interface-version': version.toString()
            };
            item.parent_class = class_name;
            if (prefix) {
                item.prefix = prefix;
            }

            const index = this.iface_by_id[iface_id]['config-items'].findIndex(item2 =>
                item2.name === raw_item.name && item2.prefix === raw_item.prefix
            );

            if (index > -1) {
                this.iface_by_id[iface_id]['config-items'][index] = {
                    ... this.iface_by_id[iface_id]['config-items'][index],
                    ... item
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

        this.iface_by_id[iface_id]['config-items'] = this.iface_by_id[iface_id]['config-items'].filter(item =>
            !item.parent || item.parent['interface-name'] !== base_class_name || item.prefix
        );
    }

    removeClasses = ({iface_id, iface_kind}) => {
        this.initIfaceId(iface_id, iface_kind);
        this.removeClassesConfigItems(iface_id);
        delete this.iface_by_id[iface_id].classes;
        delete this.iface_by_id[iface_id].requires;
        this.getConfigItems({iface_id, iface_kind});
    }

    private removeClassesConfigItems = (iface_id, classes?) => {
        const removeClassConfigItems = (class_name, is_base_class) => {
            this.iface_by_id[iface_id]['config-items'] = this.iface_by_id[iface_id]['config-items'].filter(item =>
                !item.parent || item.parent['interface-name'] !== class_name ||
                (is_base_class && !item.prefix)
            );
        }

        const iface_data = this.iface_by_id[iface_id];
        const base_class_name = iface_data['base-class-name'];

        (classes || iface_data.classes || iface_data.requires || []).forEach(class_data => {
            removeClassConfigItems(class_data.name, class_data.name === base_class_name);
        });
    }

    private workflowStepsConfigItems = steps => {
        let items = [];
        flattenDeep(steps).forEach(name => {
            const step_data = this.code_info.yamlDataByName('step', name);
            const iface_id = this.addIfaceById(step_data, 'step');
            if (step_data['base-class-name']) {
                this.addClassConfigItems(iface_id, step_data['base-class-name']);
            }
            (step_data.classes || []).forEach(class_data => {
                class_data.name && this.addClassConfigItems(iface_id, class_data.name, class_data.prefix);
            });
            (step_data['config-items'] || []).forEach(item => {
                if (items.findIndex(item2 => item2.name === item.name) === -1) {
                    items.push(item);
                }
            });
        });
        return items;
    }

    getConfigItems = params => {
        const {'base-class-name': base_class_name, classes, requires, iface_id, iface_kind} = params;
        if (!iface_id) {
            return;
        }
        this.initIfaceId(iface_id, iface_kind);

        const classes_or_requires = requires ? requires : classes;

        this.code_info.waitForPending(['yaml']).then(() => {
            if (base_class_name) {
                if (base_class_name !== this.iface_by_id[iface_id]['base-class-name']) {
                    this.removeBaseClass({iface_id, iface_kind});
                }
                this.addClassConfigItems(iface_id, base_class_name);
                this.iface_by_id[iface_id]['base-class-name'] = base_class_name;
            }
            if (classes_or_requires) {
                this.removeClassesConfigItems(iface_id, classes_or_requires);
            }
            (classes_or_requires || []).forEach(class_data => {
                class_data.name && this.addClassConfigItems(iface_id, class_data.name, class_data.prefix);
            });

            const default_type = defaultValue('type');

            const fixLocalItem = (item: any): any => {
                delete item.value;
                if (item.default_value !== undefined) {
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

                const hasNormalValue = value => typeof value !== 'undefined' && value !== null;

                let yaml_data_tag = {
                    ... hasNormalValue(item.value) ? {value: toYaml(item.value)} : {},
                    ... hasNormalValue(item.default_value) ? {default_value: toYaml(item.default_value)} : {},
                    ... item.allowed_values
                        ? {allowed_values: item.allowed_values.map(value => toYaml(value))}
                        : {}
                };

                return { ...item, yamlData: yaml_data_tag };
            };

            let items: any[];
            if (iface_kind === 'workflow') {
                items = this.workflowStepsConfigItems(this.iface_by_id[iface_id].steps);
            } else {
                items = [ ...this.iface_by_id[iface_id]['config-items'] || []];
            }

            const local_items = (items || []).map(item => fixLocalItem(item));

            const global_items = local_items.filter(item => !item.strictly_local)
                                            .map(item => checkValueLevel({ ...item }, 'global'));

            let message: any;
            if (iface_kind === 'workflow') {
                const workflow_values = this.iface_by_id[iface_id]['config-item-values'] || [];
                let workflow_items = local_items.filter(item => !item.strictly_local);

                workflow_items.forEach(item => {
                    const index = workflow_values.findIndex(item2 => item2.name === item.name);
                    if (index > -1) {
                        item['workflow-value'] = workflow_values[index].value;
                    }
                    delete item.default_value;
                });
                workflow_items = workflow_items.map(item => checkValueLevel({ ...item }, 'workflow'));

                message = {
                    action: 'return-config-items',
                    workflow_items: workflow_items.map(item => addYamlData(item)),
                    global_items: global_items.map(item => addYamlData(item))
                };
            } else {
                message = {
                    action: 'return-config-items',
                    items: local_items.map(item => addYamlData(item)),
                    global_items: global_items.map(item => addYamlData(item))
                };
            }

            qorus_webview.postMessage(message);

            if (!this.are_orig_config_items_set) {
                this.setOrigConfigItems(iface_id);
            }
        });
    }
}
