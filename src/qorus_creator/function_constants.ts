import { field } from './common_constants';

export const mapperLibraryFields = ({default_target_dir}) => [
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

export const mapper_function_fields = [
    field.name,
    field.desc,
];
