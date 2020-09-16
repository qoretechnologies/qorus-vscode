import isArray from 'lodash/isArray';
import isString from 'lodash/isString';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import isBoolean from 'lodash/isBoolean';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import size from 'lodash/size';
import forEach from 'lodash/forEach';
import { IFSMState, IFSMStates, IFSMTransition } from '../containers/InterfaceCreator/fsm';

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

export const insertAtIndex = (array = [], index = 0, value) => {
    return [...array.slice(0, index), value, ...array.slice(index)];
};

export const getMaxExecutionOrderFromStates = (states: IFSMStates): number => {
    if (!states || size(states) === 0) {
        return 0;
    }

    const { execution_order }: IFSMState = maxBy(
        map(states, (state: IFSMState) => state),
        'execution_order'
    );

    return execution_order;
};

export const isStateIsolated = (stateKey: string, states: IFSMStates, checkedStates: string[] = []): boolean => {
    if (states[stateKey].initial) {
        return false;
    }

    let isIsolated = true;

    forEach(states, (stateData, keyId) => {
        if (isIsolated) {
            if (
                stateData.transitions &&
                stateData.transitions.find((transition: IFSMTransition) => transition.state === stateKey)
            ) {
                // If the state already exists in the list, do not check it again
                if (!checkedStates.includes(keyId)) {
                    isIsolated = isStateIsolated(keyId, states, [...checkedStates, stateKey]);
                }
            }
        }
    });

    return isIsolated;
};

export { functionOrStringExp, getType };
