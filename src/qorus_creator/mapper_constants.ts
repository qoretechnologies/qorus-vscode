import { field } from './common_constants';

export const mapperFields = ({default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.version,
    {
        name: 'mappertype',
    },
    field.author,
    field.functions,
];

export const mapperLibraryFields = ({default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.version,
    {
        ...field.desc,
        mandatory: false,
    },
    field.author,
];

export const mapper_function_fields = [
    field.name,
    field.desc,
];
