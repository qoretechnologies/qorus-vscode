import { QorusProjectInterfaceInfo } from '../QorusProjectInterfaceInfo';

const types = ['string', 'int', 'bool', 'float', 'date', 'hash', 'list', 'any'];

export const configItemFields = (params) => {
    const iface_info: QorusProjectInterfaceInfo = params?.interface_info;
    const { iface_id, name } = params || {};

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
            mandatory: iface_info?.isConfigItemValueSetByParent(iface_id, name, 'can_be_undefined'),
            type: 'boolean',
            default_value: false,
        },
        {
            name: 'default_value',
            mandatory: iface_info?.isConfigItemValueSetByParent(iface_id, name, 'default_value'),
            type: 'auto',
            'type-depends-on': 'type',
            'allowed-types': types,
        },
        {
            name: 'strictly_local',
            mandatory: iface_info?.isConfigItemValueSetByParent(iface_id, name, 'strictly_local'),
            type: 'boolean',
            default_value: false,
        },
        {
            name: 'config_group',
            default_value: iface_info?.last_config_group,
        },
        {
            name: 'allowed_values',
            mandatory: iface_info?.isConfigItemValueSetByParent(iface_id, name, 'allowed_values'),
            type: 'array-auto',
            'type-depends-on': 'type',
            'allowed-types': types,
        },
        {
            name: 'sensitive',
            mandatory: iface_info?.isConfigItemValueSetByParent(iface_id, name, 'sensitive'),
            type: 'boolean',
            default_value: false
        },
    ];
};

export const defaultValue = name => (configItemFields({}).find(field => field.name === name) || {}).default_value;
