import { reduce, size, findIndex, omit } from 'lodash';
import { providers } from '../containers/Mapper/provider';
import { addTrailingSlash } from '../hocomponents/withMapper';

export interface IMapperFieldType {
    base_type: string;
    can_manage_fields: boolean;
    fields: { [name: string]: IMapperField };
    mandatory: boolean;
    name: string;
    options: { [optionName: string]: any };
    supported_options: { [optionName: string]: any };
    typeName: string;
    types_acctepted: string[];
    types_returned: string[];
}

export interface IMapperField {
    canBeNull?: boolean;
    desc: string;
    isChild?: boolean;
    isCustom?: boolean;
    level?: number;
    name: string;
    parent?: string;
    parentPath?: string;
    path?: string;
    type: IMapperFieldType;
}
// This functions flattens the fields, by taking all the
// deep fields from `type` and adds them right after their
// respective parent field
export const flattenFields: (
    fields: { [name: string]: IMapperField },
    isChild?: boolean,
    parent?: string,
    level?: number,
    path?: string
) => any[] = (fields, isChild = false, parent, level = 0, path = '') =>
    reduce(
        fields,
        (newFields, field, name) => {
            let res = [...newFields];
            // Build the path for the child fields
            console.log('in flatten fields', field.name);
            const newPath = level === 0 ? field.name : `${path}.${field.name}`;
            const parentPath = level !== 0 && `${path}`;
            // Add the current field
            res = [...res, { name: field.name, ...{ ...field, isChild, level, parent, path: newPath, parentPath } }];
            // Check if this field has hierarchy
            if (size(field.type.fields)) {
                // Recursively add deep fields
                res = [...res, ...flattenFields(field.type.fields, true, field.name, level + 1, newPath)];
            }
            // Return the new fields
            return res;
        },
        []
    );

export const getLastChildIndex = (field: IMapperField, fields: IMapperField[]): number => {
    // Only get the child index for fields
    // that actually have children
    if (size(field.type.fields)) {
        // Get the name of the last field
        const name: string = Object.keys(field.type.fields).find(
            (_name, index) => index === size(field.type.fields) - 1
        );
        // Get the index of the last field in this
        // hierarchy based on the name
        return findIndex(fields, (curField: IMapperField) => curField.path === `${field.path}.${name}`);
    }
    // Return nothing
    return 0;
};

export const filterInternalData = (fields) => {
    return reduce(
        fields,
        (newFields, fieldData, field) => {
            return {
                ...newFields,
                [field]: {
                    ...omit(fieldData, [
                        'canBeNull',
                        'firstCustomInHierarchy',
                        'parent',
                        'isChild',
                        'isCustom',
                        'level',
                    ]),
                    type: {
                        ...fieldData.type,
                        fields: filterInternalData(fieldData.type.fields),
                    },
                },
            };
        },
        {}
    );
};

export const areFieldsUnique: (fieldNames: string[], targetFieldNames: string[]) => boolean = (
    fieldNames,
    targetFieldNames
) => !fieldNames.some((fieldName: string) => targetFieldNames.includes(fieldName));

export const getFieldSiblings: (fields: IMapperField[], field: IMapperField) => IMapperField[] = (fields, field) =>
    fields.filter((currentField) => currentField.parentPath === field.parentPath);

export const hasDuplicateSiblings: (fields: IMapperField[], field: IMapperField) => boolean = (fields, field) => {
    // Get the field siblings
    const siblings: IMapperField[] = getFieldSiblings(fields, field);

    return siblings && siblings.filter((sibling) => sibling.path === field.path).length > 1;
};

export const hasStaticDataField = (context: string) =>
    context.startsWith('$static') && !context.startsWith('$static:*');

export const getStaticDataFieldname = (context: string) => {
    return context.match(/\{([^}]+)\}/)?.[1];
};
