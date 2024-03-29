import { QorusProjectInterfaceInfo } from '../QorusProjectInterfaceInfo';

const types = ['string', 'int', 'bool', 'float', 'date', 'hash', 'list', 'any'];
const interfaceTypes = [
  'mapper',
  'value-map',
  'data-provider',
  'connection',
  'workflow',
  'job',
  'service',
];

export const configItemFields = (params) => {
  params = params || {};
  const iface_info: QorusProjectInterfaceInfo = params.interface_info;

  return [
    {
      name: 'name',
      compact: true,
      group: 'info',
    },
    {
      name: 'description',
      type: 'long-string',
      markdown: true,
    },
    {
      name: 'type',
      type: 'enum',
      items: [
        { isDivider: true, title: 'Basic types' },
        ...types.map((type) => ({ value: type })),
        { isDivider: true, title: 'Interface subtypes' },
        ...interfaceTypes.map((type) => ({ value: type })),
      ],
      default_value: 'string',
      on_change: 'config-item-type-changed',
    },
    {
      name: 'can_be_undefined',
      mandatory: iface_info?.isConfigItemFieldSetByParent(params, 'can_be_undefined'),
      type: 'boolean',
      default_value: false,
      compact: true,
      group: 'info',
    },
    {
      name: 'default_value',
      mandatory: iface_info?.isConfigItemFieldSetByParent(params, 'default_value'),
      type: 'auto',
      'type-depends-on': 'type',
      'allowed-types': types,
    },
    {
      name: 'strictly_local',
      mandatory: false,
      type: 'boolean',
      default_value: false,
      compact: true,
      group: 'info',
    },
    {
      name: 'config_group',
      default_value: iface_info?.last_config_group,
      compact: true,
      group: 'info',
    },
    {
      name: 'allowed_values',
      mandatory: iface_info?.isConfigItemFieldSetByParent(params, 'allowed_values'),
      type: 'array-auto',
      'type-depends-on': 'type',
      'allowed-types': types,
    },
    {
      name: 'sensitive',
      mandatory: iface_info?.isConfigItemFieldSetByParent(params, 'sensitive'),
      type: 'boolean',
      default_value: false,
      compact: true,
      group: 'info',
    },
  ].map((field) => ({
    ...field,
    'is-set': iface_info?.isConfigItemFieldSet(params, field.name),
    'parent-value': iface_info?.parentConfigItemFieldValue(params, field.name),
  }));
};

export const defaultValue = (name) =>
  (configItemFields({}).find((field) => field.name === name) || {}).default_value;
