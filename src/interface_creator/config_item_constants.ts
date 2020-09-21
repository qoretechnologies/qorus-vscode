import { QorusProjectInterfaceInfo } from '../QorusProjectInterfaceInfo';

const types = ['string', 'int', 'bool', 'float', 'date', 'hash', 'list', 'any'];

export const configItemFields = (params) => {
    params = params || {};
    const iface_info: QorusProjectInterfaceInfo = params.interface_info;

    return [
        {
            name: 'name',
        },
        {
            name: 'description',
            type: 'long-string',
            markdown: true,
        },
        {
            name: 'type',
            type: 'enum',
            items: types.map(type => ({ value: type })),
            default_value: 'string',
            on_change: 'config-item-type-changed',
        },
        {
            name: 'can_be_undefined',
            mandatory: iface_info?.isConfigItemAttributeSetByParent(params, 'can_be_undefined'),
            type: 'boolean',
            default_value: false,
        },
        {
            name: 'default_value',
            mandatory: iface_info?.isConfigItemAttributeSetByParent(params, 'default_value'),
            type: 'auto',
            'type-depends-on': 'type',
            'allowed-types': types,
        },
        {
            name: 'strictly_local',
            mandatory: iface_info?.isConfigItemAttributeSetByParent(params, 'strictly_local'),
            type: 'boolean',
            default_value: false,
        },
        {
            name: 'config_group',
            default_value: iface_info?.last_config_group,
        },
        {
            name: 'allowed_values',
            mandatory: iface_info?.isConfigItemAttributeSetByParent(params, 'allowed_values'),
            type: 'array-auto',
            'type-depends-on': 'type',
            'allowed-types': types,
        },
        {
            name: 'sensitive',
            mandatory: iface_info?.isConfigItemAttributeSetByParent(params, 'sensitive'),
            type: 'boolean',
            default_value: false,
        },
    ].map(field => ({
        ...field,
        'is-set': iface_info?.isConfigItemAttributeSet(params, field.name),
        'is-set-by-parent': iface_info?.isConfigItemAttributeSetByParent(params, field.name),
    }));
};

export const defaultValue = name => (configItemFields({}).find(field => field.name === name) || {}).default_value;
