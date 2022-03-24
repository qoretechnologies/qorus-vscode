import { cloneDeep } from 'lodash';
import { field } from './common_constants';

// ================================================================

export const mapper_code_method_template = {
  qore: '    static auto ${this.name}(auto ctx, hash<auto> record) {\n' + '    }\n',
  python: '    @staticmethod\n' + '    def ${this.method}():\n' + '        pass\n',
  java:
    '    public static Object ${this.name}(Object ctx, Map<String, Object> record) {\n' + '    }\n',
};

// ================================================================

export const mapperFields = ({ default_target_dir, context }) => {
  let cont = cloneDeep(context);

  if (cont) {
    delete cont.target_dir;
    delete cont.default_values;
    if (!Object.keys(cont).length) {
      cont = undefined;
    }
  }

  return [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.version,
    {
      name: 'mappertype',
      default_value: 'Mapper',
      read_only: true,
    },
    {
      name: 'mapper_options',
      type: 'options',
      mandatory: false,
      url: 'mapper',
      requires_fields: 'mappertype',
    },
    field.author,
    {
      name: 'codes',
      type: 'select-array',
      mandatory: false,
      get_message: {
        action: 'creator-get-objects',
        object_type: 'mapper-code',
      },
      return_message: {
        action: 'creator-return-objects',
        object_type: 'mapper-code',
        return_value: 'objects',
      },
      reference: {
        iface_kind: 'mapper-code',
      },
    },
    field.classes,
    {
      name: 'context',
      type: 'context-selector',
      default_value: cont,
      mandatory: !!cont,
      disabled: !!cont,
    },
  ];
};

export const mapperCodeFields = ({ default_target_dir, limited_editing }) => [
  field.targetDir(default_target_dir),
  field.targetFile,
  {
    name: 'class-class-name',
    has_to_be_valid_identifier: true,
  },
  field.version,
  {
    ...field.desc,
    mandatory: false,
  },
  {
    ...field.lang,
    mandatory: false,
  },
  field.author,
];

export const mapperMethodFields = ({ limited_editing }) => [
  {
    ...field.name,
    has_to_be_valid_identifier: true,
  },
  field.desc,
];
