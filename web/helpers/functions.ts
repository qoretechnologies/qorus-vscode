import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import isBoolean from 'lodash/isBoolean';

const functionOrStringExp: Function = (item: Function | string, ...itemArguments) =>
    typeof item === 'function' ? item(...itemArguments) : item;

const getType: Function = (item: any): string => {
    if (isBoolean(item)) {
        return 'boolean';
    }

    if (isString(item)) {
        return 'string';
    }

    if (isNumber(item)) {
        return 'number';
    }

    if (isArray(item)) {
        return 'array';
    }

    if (isObject(item)) {
        return 'object';
    }

    if (isFunction(item)) {
        return 'function';
    }

    if (isNull(item) || isUndefined(item)) {
        return 'null';
    }

    return 'null';
};

export const splitByteSize = (value: string): [number, string] => {
    const bytes: string[] = (value || '').match(/\d+/g);
    const size: string[] = (value || '').match(/[a-zA-Z]+/g);

    return [Number(bytes?.[0]), size?.[0]];
};

export { functionOrStringExp, getType };
