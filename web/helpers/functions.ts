import forEach from 'lodash/forEach';
import isArray from 'lodash/isArray';
import isBoolean from 'lodash/isBoolean';
import isFunction from 'lodash/isFunction';
import isNull from 'lodash/isNull';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isObject';
import isString from 'lodash/isString';
import isUndefined from 'lodash/isUndefined';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import omit from 'lodash/omit';
import set from 'lodash/set';
import size from 'lodash/size';
import path from 'path';
import shortid from 'shortid';
import { AppToaster } from '../components/Toast';
import { interfaceKindTransform } from '../constants/interfaces';
import { Messages } from '../constants/messages';
import { IFSMState, IFSMStates, IFSMTransition } from '../containers/InterfaceCreator/fsm';
import { addMessageListener, postMessage } from '../hocomponents/withMessageHandler';

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

  const { execution_order }: IFSMState =
    maxBy(
      map(states, (state: IFSMState) => state),
      'execution_order'
    ) || {};

  return execution_order || 0;
};

export const isStateIsolated = (
  stateKey: string,
  states: IFSMStates,
  checkedStates: string[] = []
): boolean => {
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

export interface ITypeComparatorData {
  interfaceName?: string;
  connectorName?: string;
  interfaceKind?: 'mapper' | 'pipeline' | 'connector' | 'processor' | 'if' | 'block';
  typeData?: any;
}

export const getProviderFromInterfaceObject = (
  data,
  type: 'input' | 'output',
  connectorName?: string
) => {
  switch (data.type) {
    case 'mapper': {
      return data?.mapper_options?.[`mapper-${type}`];
    }
    case 'class': {
      if (connectorName) {
        return data?.['class-connectors']?.find((connector) => connector.name === connectorName)?.[
          `${type}-provider`
        ];
      }

      return data?.processor?.[`processor-${type}-type`];
    }
    case 'pipeline': {
      return data?.[`${type}-provider`];
    }
  }
};

export const getStateProvider = async (
  data: ITypeComparatorData,
  providerType: 'input' | 'output'
) => {
  if ('typeData' in data && !data.typeData) {
    return Promise.resolve(null);
  }

  if (data.typeData) {
    return Promise.resolve(data.typeData);
  }

  const interfaceKind =
    data.interfaceKind === 'connector' || data.interfaceKind === 'processor'
      ? 'class'
      : data.interfaceKind;
  const interfaceData = await callBackendBasic(
    Messages.GET_INTERFACE_DATA,
    'return-interface-data-complete',
    {
      name: data.interfaceName,
      iface_kind: interfaceKind,
    }
  );

  if (!interfaceData.ok) {
    return null;
  }

  return getProviderFromInterfaceObject(
    interfaceData.data[interfaceKind],
    providerType,
    data.connectorName
  );
};

export const areTypesCompatible = async (
  outputTypeData?: ITypeComparatorData,
  inputTypeData?: ITypeComparatorData
): Promise<boolean> => {
  if (!outputTypeData || !inputTypeData) {
    return true;
  }

  let output = await getStateProvider(outputTypeData, 'output');
  let input = await getStateProvider(inputTypeData, 'input');

  if (!input || !output) {
    return true;
  }

  const comparison = await fetchData('/dataprovider/compareTypes', 'PUT', {
    base_type: omit(output, ['options']),
    type: omit(input, ['options']),
  });

  return comparison.data;
};

export const areConnectorsCompatible = async (
  type: 'input' | 'output',
  value: string,
  data: any,
  isMapper?: boolean
) => {
  // First check if this input is compatible with previous output
  const currentInputOutput: ITypeComparatorData = isMapper
    ? {
        interfaceKind: 'mapper',
        interfaceName: value,
      }
    : {
        interfaceKind: 'connector',
        interfaceName: data.class,
        connectorName: value,
      };

  let item;
  let mapper;

  if (isMapper) {
    item = type === 'input' ? data.previousItemData : data.nextItemData;
    mapper = null;
  } else {
    item = type === 'input' ? data.previousItemData : data.nextItemData;
    mapper = type === 'input' ? data.mapper : data.nextItemData?.mapper;
  }

  let isCompatibleWithItem;

  if (item) {
    const comparator: ITypeComparatorData = mapper
      ? {
          interfaceKind: 'mapper',
          interfaceName: mapper,
        }
      : {
          interfaceKind: 'connector',
          interfaceName: item.class,
          connectorName: item.connector,
        };

    isCompatibleWithItem = await areTypesCompatible(
      type === 'input' ? comparator : currentInputOutput,
      type === 'input' ? currentInputOutput : comparator
    );
  } else {
    isCompatibleWithItem = true;
    Promise.resolve();
  }

  return isCompatibleWithItem ? true : false;
};

export const isFSMStateValid = (state: IFSMState) => {
  if (state.type === 'state') {
    return !!(state.action?.type && state.action?.value);
  }

  return true;
};

export const callBackendBasic: (
  getMessage: string,
  returnMessage?: string,
  data?: any,
  toastMessage?: string
) => Promise<any> = async (getMessage, returnMessage, data, toastMessage) => {
  // Create the unique ID for this request
  const uniqueId: string = shortid.generate();
  // Create new toast
  if (toastMessage) {
    AppToaster.show(
      {
        message: toastMessage || 'Request in progress',
        intent: 'warning',
        timeout: 30000,
        icon: 'info-sign',
      },
      uniqueId
    );
  }

  return new Promise((resolve, reject) => {
    // Create a timeout that will reject the request
    // after 2 minutes
    let timeout: NodeJS.Timer | null = setTimeout(() => {
      resolve({
        ok: false,
        message: 'Request timed out',
      });
    }, 300000);
    // Watch for the request to complete
    // if the ID matches then resolve
    addMessageListener(returnMessage || `${getMessage}-complete`, (data) => {
      if (data.request_id === uniqueId) {
        if (toastMessage || !data.ok) {
          AppToaster.show(
            {
              message: data.message || `Request ${getMessage} failed!`,
              intent: data.ok ? 'success' : 'danger',
              timeout: 3000,
              icon: data.ok ? 'small-tick' : 'error',
            },
            uniqueId
          );
        }

        clearTimeout(timeout);
        timeout = null;
        resolve(data);
      }
    });

    // Fetch the data
    postMessage(getMessage, {
      request_id: uniqueId,
      ...data,
    });
  });
};

export const getPipelineClosestParentOutputData = (
  item: any,
  pipelineInputProvider?: any
): ITypeComparatorData => {
  if (!item || item.type === 'start') {
    return {
      typeData: pipelineInputProvider,
    };
  }

  if (item.type === 'queue') {
    return getPipelineClosestParentOutputData(item.parent, pipelineInputProvider);
  }

  return {
    interfaceName: item.name,
    interfaceKind: item.type,
  };
};

const flattenPipeline = (data, parent?: any) => {
  return data.reduce((newData, element) => {
    const newElement = { ...element };

    if (parent) {
      newElement.parent = parent;
    }

    if (size(newElement.children) === 0) {
      return [...newData, newElement];
    }

    return [...newData, newElement, ...flattenPipeline(newElement.children, newElement)];
  }, []);
};

export const checkPipelineCompatibility = async (elements, inputProvider) => {
  const flattened = flattenPipeline(elements);
  const newElements = [...elements];

  for await (const element of flattened) {
    if (element.type === 'queue') {
      Promise.resolve();
    } else {
      const isCompatibleWithParent = await areTypesCompatible(
        getPipelineClosestParentOutputData(element.parent, inputProvider),
        element.type === 'start'
          ? {
              typeData: inputProvider,
            }
          : {
              interfaceKind: element.type,
              interfaceName: element.name,
            }
      );

      if (!isCompatibleWithParent) {
        set(newElements, element.path, { ...omit(element, ['parent']), isCompatible: false });
      } else {
        set(newElements, element.path, { ...omit(element, ['parent', 'isCompatible']) });
      }
    }
  }

  return newElements;
};

const fetchData: (url: string, method: string, body?: { [key: string]: any }) => Promise<any> =
  async (url, method = 'GET', body) => {
    // Create the unique ID for this request
    const uniqueId: string = shortid.generate();

    return new Promise((resolve, reject) => {
      // Create a timeout that will reject the request
      // after 2 minutes
      let timeout: NodeJS.Timer | null = setTimeout(() => {
        reject({
          error: true,
          msg: 'Request timed out',
        });
      }, 120000);
      // Watch for the request to complete
      // if the ID matches then resolve
      const listener = addMessageListener('fetch-data-complete', (data) => {
        if (data.id === uniqueId) {
          clearTimeout(timeout);
          timeout = null;
          resolve(data);
          //* Remove the listener after the call is done
          listener();
        }
      });
      // Fetch the data
      postMessage('fetch-data', {
        id: uniqueId,
        url,
        method,
        body,
      });
    });
  };

export { functionOrStringExp, getType };

export const deleteDraft = async (interfaceKind, fileName, notify?: boolean) => {
  await callBackendBasic(
    Messages.DELETE_DRAFT,
    undefined,
    {
      iface_id: fileName,
      iface_kind: interfaceKindTransform[interfaceKind],
    },
    notify ? 'DeletingDraft' : undefined
  );
};

export const getTargetFile = (data: any) => {
  if (data?.yaml_file) {
    return data.yaml_file;
  }

  if (data?.target_dir && data?.target_file) {
    return path.join(data.target_dir, data.target_file);
  }
};

export const hasValue = (value) => value && value !== '';
export const getDraftId = (data, interfaceId) => {
  if (data && getTargetFile(data)) {
    return btoa(getTargetFile(data));
  }

  return interfaceId;
};
