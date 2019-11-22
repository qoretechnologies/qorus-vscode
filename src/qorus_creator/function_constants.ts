import { field } from './common_constants';

export const function_template = {
    qore: '${this.name}() {\n}\n',
    java: 'void ${this.name}() {\n}\n',
};

export const libraryFields = ({default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.version,
    field.desc,
    {
        ...field.desc,
        mandatory: false,
    },
    field.author,
];

export const function_fields = [
    field.name,
    field.desc,
];
