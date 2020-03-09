import { reduce, size, findIndex } from 'lodash';
// This functions flattens the fields, by taking all the
// deep fields from `type` and adds them right after their
// respective parent field
export const flattenFields: (
    fields: any,
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
            const newPath = level === 0 ? name : `${path}.${name}`;
            const parentPath = level !== 0 && `${path}`;
            // Add the current field
            res = [...res, { name, ...{ ...field, isChild, level, parent, path: newPath, parentPath } }];
            // Check if this field has hierarchy
            if (size(field.type.fields)) {
                // Recursively add deep fields
                res = [...res, ...flattenFields(field.type.fields, true, name, level + 1, newPath)];
            }
            // Return the new fields
            return res;
        },
        []
    );

export const getLastChildIndex = (field: any, fields: any[]) => {
    // Only get the child index for fields
    // that actually have children
    if (size(field.type.fields)) {
        // Get the name of the last field
        const name: string = Object.keys(field.type.fields).find(
            (_name, index) => index === size(field.type.fields) - 1
        );
        // Get the index of the last field in this
        // hierarchy based on the name
        return findIndex(fields, curField => curField.path === `${field.path}.${name}`);
    }
    // Return nothing
    return 0;
};
