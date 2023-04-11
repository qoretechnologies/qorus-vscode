import { IReqoreNotificationData } from '@qoretechnologies/reqore/dist/containers/ReqoreProvider';
import { cloneDeep } from 'lodash';
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
import shortid from 'shortid';
import { IProviderType } from '../components/Field/connectors';
import { IOptions } from '../components/Field/systemOptions';
import { interfaceKindTransform } from '../constants/interfaces';
import { Messages } from '../constants/messages';
import { IFSMState, IFSMStates, IFSMTransition } from '../containers/InterfaceCreator/fsm';
import { TAction } from '../containers/InterfaceCreator/fsm/stateDialog';
import { addMessageListener, postMessage } from '../hocomponents/withMessageHandler';
const md5 = require('md5');

const functionOrStringExp: Function = (item: Function | string, ...itemArguments) =>
  typeof item === 'function' ? item(...itemArguments) : item;

const getType = (item: any): string => {
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

  if (isFunction(item)) {
    return 'function';
  }

  if (isObject(item)) {
    return 'object';
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

export const insertAtIndex = (array: any[] = [], index = 0, value) => {
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
  interfaceName?: string | IProviderType;
  connectorName?: string;
  interfaceKind?: 'if' | 'block' | 'processor' | TAction | 'transaction';
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
  console.log(data);
  if (!data) {
    return Promise.resolve(null);
  }

  if (data.interfaceKind === 'transaction') {
    return null;
  }

  if (
    data.interfaceKind === 'apicall' ||
    data.interfaceKind === 'send-message' ||
    data.interfaceKind === 'search-single' ||
    data.interfaceKind === 'search' ||
    data.interfaceKind === 'update' ||
    data.interfaceKind === 'create' ||
    data.interfaceKind === 'delete'
  ) {
    return Promise.resolve({
      ...(data?.interfaceName as IProviderType),
      typeAction: data.interfaceKind,
    });
  }

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
    return Promise.resolve(true);
  }

  let output = cloneDeep(await getStateProvider(outputTypeData, 'output'));
  let input = cloneDeep(await getStateProvider(inputTypeData, 'input'));

  if (!input || !output) {
    return Promise.resolve(true);
  }

  output.options = await formatAndFixOptionsToKeyValuePairs(output.options);
  input.options = await formatAndFixOptionsToKeyValuePairs(input.options);

  const comparison = await fetchData('/dataprovider/compareTypes?context=ui', 'PUT', {
    base_type: input,
    type: output,
  });

  if (!comparison.ok) {
    return true;
  }

  return comparison.data;
};

export const formatAndFixOptionsToKeyValuePairs = async (options?: IOptions): Promise<IOptions> => {
  const newOptions = cloneDeep(options || {});

  for await (const optionName of Object.keys(newOptions || {})) {
    let newValue = newOptions[optionName].value;

    if (newOptions[optionName].type === 'file-as-string') {
      // We need to fetch the file contents from the server
      // Load the contents into the schema string
      const { fileData } = await callBackendBasic(Messages.GET_FILE_CONTENT, undefined, {
        file: newOptions[optionName].value,
      });

      newValue = fileData;
    }

    newOptions[optionName] = newValue;
  }

  return newOptions;
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
  toastMessage?: string,
  addNotificationCall?: any
) => Promise<any> = async (getMessage, returnMessage, data, toastMessage, addNotificationCall) => {
  // Create the unique ID for this request
  const uniqueId: string = shortid.generate();
  // Create new toast
  if (toastMessage) {
    addNotificationCall?.({
      content: toastMessage || 'Request in progress',
      intent: 'warning',
      duration: 30000,
      id: uniqueId,
    } as IReqoreNotificationData);
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
        if (toastMessage) {
          addNotificationCall?.({
            content: data.message || `Request ${getMessage} failed!`,
            intent: data.ok ? 'success' : 'danger',
            duration: 3000,
            id: uniqueId,
          });
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
    // If the element is a queue or a start element (a circle with no value / data) it's automatically compatible
    if (element.type === 'queue' || element.type === 'start') {
      Promise.resolve();
    } else {
      const isCompatibleWithParent = await areTypesCompatible(
        getPipelineClosestParentOutputData(element.parent, inputProvider),
        {
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

export const fetchData: (
  url: string,
  method?: string,
  body?: { [key: string]: any }
) => Promise<any> = async (url, method = 'GET', body) => {
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

export const deleteDraft = async (
  interfaceKind,
  fileName,
  notify: boolean = false,
  addNotification?: any
) => {
  await callBackendBasic(
    Messages.DELETE_DRAFT,
    undefined,
    {
      iface_id: fileName,
      iface_kind: interfaceKindTransform[interfaceKind],
    },
    notify ? 'DeletingDraft' : undefined,
    addNotification
  );
};

export const getTargetFile = (data: any) => {
  if (data?.target_dir && data?.target_file) {
    return `${data.target_dir}/${data.target_file}`;
  }

  if (data?.yaml_file) {
    return data.yaml_file;
  }

  return null;
};

export const insertUrlPartBeforeQuery = (url: string, part: string, query?: string) => {
  const urlParts = url.split('?');
  const urlWithoutQuery = urlParts[0];
  const q = `?${urlParts[1] || ''}${urlParts[1] && query ? '&' : ''}${query ? query : ''}`;

  return `${urlWithoutQuery}${part}${q}`;
};

export const hasValue = (value) => {
  if (value && value !== '') {
    return true;
  } else {
    return false;
  }
};
export const getDraftId = (data, interfaceId) => {
  if (data && getTargetFile(data)) {
    return md5(getTargetFile(data));
  }

  return interfaceId;
};
