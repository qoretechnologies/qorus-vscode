import { classToPythonModule, root_steps } from '../qorus_constants';
import { field } from './common_constants';

export const stepImports = (lang: string, base_class_name: string) => {
  switch (lang) {
    case 'python':
      // FIXME: we need to know the language of the base class to generate the import statement correctly
      // here we just assume Qore for now
      return root_steps.includes(base_class_name)
        ? [`from ${classToPythonModule(base_class_name)} import ${base_class_name}`]
        : [`from qore.__root__ import ${base_class_name}`];
    case 'java':
      return [
        'import qore.OMQ.*;',
        'import qore.OMQ.UserApi.*;',
        'import qore.OMQ.UserApi.Workflow.*;',
      ];
    default:
      return [];
  }
};

export const stepFields = ({ default_target_dir, limited_editing }) => [
  field.targetDir(default_target_dir),
  field.targetFile,
  field.name,
  field.desc,
  field.author,
  field.version,
  {
    ...field.class_name,
    disabled: limited_editing,
  },
  {
    ...field.lang,
    default_value: limited_editing ? 'python' : 'qore',
  },
  field.classes,
  field.mappers,
  field.vmaps,
  {
    name: 'base-class-name',
    type: 'select-string',
    get_message: {
      action: 'creator-get-objects',
      object_type: 'step-base-class',
    },
    return_message: {
      action: 'creator-return-objects',
      object_type: 'step-base-class',
      return_value: 'objects',
    },
    on_change: ['get-config-items', 'creator-set-fields'],
    notify_on_remove: true,
    disabled: limited_editing,
  },
  {
    name: 'event',
    mandatory: false,
    type: 'select-string',
    get_message: {
      action: 'creator-get-objects',
      object_type: 'event',
    },
    return_message: {
      action: 'creator-return-objects',
      object_type: 'event',
      return_value: 'objects',
    },
    reference: {
      iface_kind: 'event',
    },
    group: 'resources',
    compact: true,
  },
  {
    name: 'queue',
    mandatory: false,
    type: 'select-string',
    get_message: {
      action: 'creator-get-objects',
      object_type: 'queue',
    },
    return_message: {
      action: 'creator-return-objects',
      object_type: 'queue',
      return_value: 'objects',
    },
    reference: {
      iface_kind: 'queue',
    },
    group: 'resources',
    compact: true,
  },
  {
    name: 'fsm',
    mandatory: false,
    type: 'fsm-list',
    reference: {
      iface_kind: 'fsm',
    },
  },
];

export const stepTypeHeaders = (step_type) => {
  switch (step_type) {
    case 'QorusAsyncStep':
      return { steptype: 'ASYNC' };
    case 'QorusEventStep':
      return { steptype: 'EVENT' };
    case 'QorusNormalStep':
      return { steptype: 'NORMAL' };
    case 'QorusSubworkflowStep':
      return { steptype: 'SUBWORKFLOW' };
    case 'QorusAsyncArrayStep':
      return { steptype: 'ASYNC', arraytype: 'SERIES' };
    case 'QorusEventArrayStep':
      return { steptype: 'EVENT', arraytype: 'SERIES' };
    case 'QorusNormalArrayStep':
      return { steptype: 'NORMAL', arraytype: 'SERIES' };
    case 'QorusSubworkflowArrayStep':
      return { steptype: 'SUBWORKFLOW', arraytype: 'SERIES' };
    default:
      return {};
  }
};
