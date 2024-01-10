import '@testing-library/jest-dom/extend-expect';
import { IFSMStates } from '../../src/containers/InterfaceCreator/fsm';
import {
  deleteDraft,
  getDraftId,
  getMaxExecutionOrderFromStates,
  getProviderFromInterfaceObject,
  getStateProvider,
  getTargetFile,
  getType,
  hasValue,
  insertAtIndex,
  insertUrlPartBeforeQuery,
  isFSMStateValid,
  ITypeComparatorData,
  splitByteSize,
} from '../../src/helpers/functions';

import multipleStatesInMultipleRows from './json/fsmMultipleStatesInMultipleRows.json';
import statesObj from './json/fsmStates.json';

test('getType should return the defined type for the input', () => {
  const stringType = getType('type');
  const booleanType = getType(true);
  const numberType = getType(123);
  const arrayType = getType([1, 2, 3]);
  const objectType = getType({ type: 'object' });
  const functionType = getType(() => {});
  const nullType = getType(null);

  expect(stringType).toEqual('string');
  expect(booleanType).toEqual('boolean');
  expect(numberType).toEqual('number');
  expect(arrayType).toEqual('array');
  expect(objectType).toEqual('object');
  expect(functionType).toEqual('function');
  expect(nullType).toEqual('null');
});

test('splitByteSize should split the byteSize string to array with byte and size', () => {
  const byteSize = splitByteSize('34MB');
  expect(byteSize[0]).toEqual(34);
  expect(byteSize[1]).toEqual('MB');
});

test('insertAtIndex should append the provided value at the provided index in the provided array', () => {
  const newArr = insertAtIndex([1, 2, 3], 1, 4);
  expect(newArr).toEqual([1, 4, 2, 3]);
});

test('getMaxExecutionOrderFromStates should find the state with the maximum execution_order and return the execution_order value', () => {
  const maxExecutionOrder = getMaxExecutionOrderFromStates(statesObj as IFSMStates);
  const maxExecutionOrder2 = getMaxExecutionOrderFromStates(
    multipleStatesInMultipleRows as IFSMStates
  );
  expect(maxExecutionOrder2).toEqual(0);
  expect(maxExecutionOrder).toEqual(1);
});

test('getProviderFromInterfaceObject should check the type of interface object and return the appropriate provider object', () => {
  const mapperTypeInterfaceObj = {
    type: 'mapper',
    mapper_options: {
      'mapper-input': 'input',
    },
  };
  const mapperTypeValue = getProviderFromInterfaceObject(mapperTypeInterfaceObj, 'input');
  expect(mapperTypeValue).toEqual('input');

  const classTypeInterfaceObj = {
    type: 'class',
    processor: {
      'processor-input-type': 'input',
    },
  };
  const classTypeValue = getProviderFromInterfaceObject(classTypeInterfaceObj, 'input');
  expect(classTypeValue).toEqual('input');

  const pipelineTypeInterfaceObj = {
    type: 'pipeline',
    'input-provider': 'input',
  };
  const pipelineTypeValue = getProviderFromInterfaceObject(pipelineTypeInterfaceObj, 'input');
  expect(pipelineTypeValue).toEqual('input');
});

test('isFSMStateValid should verify if the state is valid', () => {
  const isValid1 = isFSMStateValid((statesObj as IFSMStates)['1']);
  expect(isValid1).toEqual(true);

  const isValid2 = isFSMStateValid((statesObj as IFSMStates)['2']);
  expect(isValid2).toEqual(true);
});

test('getTargetFile should find the target file and return the address', () => {
  const fileAddress = getTargetFile({ target_dir: 'target/dir', target_file: 'fileName' });
  expect(fileAddress).toEqual('target/dir/fileName');

  const fileAddressNull = getTargetFile({ target_file: 'fileName' });
  expect(fileAddressNull).toEqual(null);

  const fileAddressYaml = getTargetFile({ yaml_file: 'fileName' });
  expect(fileAddressYaml).toEqual('fileName');
});

test('hasValue should validate the string value', () => {
  const value = hasValue('');
  expect(value).toEqual(false);

  const valueExist = hasValue('value');
  expect(valueExist).toEqual(true);
});

test('insertUrlPartBeforeQuery should insert the part provided before the url query', () => {
  const url = 'https://www.example.com/?id:1';
  const urlWithParts = insertUrlPartBeforeQuery(url, 'event');
  expect(urlWithParts).toEqual('https://www.example.com/event?id:1');
});

test('getStateProvider should return the provider of the state', async () => {
  const data1: ITypeComparatorData = {
    interfaceKind: 'apicall',
    interfaceName: { name: 'test', type: 'apicall', path: '/path' },
  };
  const provider1 = await getStateProvider(data1, 'input');
  expect(provider1).toEqual({
    name: 'test',
    type: 'apicall',
    path: '/path',
    typeAction: 'apicall',
  });

  const data2: ITypeComparatorData = {
    interfaceName: 'interfaceName2',
    connectorName: 'connectorName2',
    interfaceKind: 'pipeline',
    typeData: undefined,
  };
  const provider2 = await getStateProvider(data2, 'input');
  expect(provider2).toEqual(null);
});

describe('callBackendBasic', () => {
  it('does not call callBackendBasic if fileName is falsy', async () => {
    const callBackendBasic = jest.fn();

    await deleteDraft('some-kind', undefined);

    expect(callBackendBasic).not.toHaveBeenCalled();
  });

  it('does not call callBackendBasic if interfaceKind is falsy', async () => {
    const callBackendBasic = jest.fn();

    await deleteDraft(undefined, 'some-file-name');

    expect(callBackendBasic).not.toHaveBeenCalled();
  });
});

describe('getTargetFile', () => {
  it('should return the correct id', () => {
    const data = { id: 'test' };
    expect(getTargetFile(data)).toBe('test');
  });
});

describe('insertUrlPartBeforeQuery', () => {
  it('should insert the part before the query', () => {
    const url = 'http://example.com/path?query=value';
    const part = 'prefix-';
    const query = 'new=value';
    expect(insertUrlPartBeforeQuery(url, part, query)).toBe(
      'http://example.com/pathprefix-?query=value&new=value'
    );
  });
});

describe('hasValue', () => {
  it('should return true for non-empty values', () => {
    expect(hasValue('value')).toBe(true);
    expect(hasValue(1)).toBe(true);
    expect(hasValue(true)).toBe(true);
  });

  it('should return false for empty values', () => {
    expect(hasValue('')).toBe(false);
    expect(hasValue(null)).toBe(false);
    expect(hasValue(undefined)).toBe(false);
    expect(hasValue(0)).toBe(false);
    expect(hasValue(false)).toBe(false);
  });
});

describe('getDraftId', () => {
  it('should return the interfaceId if data object does not have an id', () => {
    const data = { display_name: 'value' };
    const interfaceId = 'def456';

    const result = getDraftId(data, interfaceId);

    expect(result).toEqual(interfaceId);
  });

  it('should return the interfaceId if data object is null or undefined', () => {
    const data = null;
    const interfaceId = 'ghi789';

    const result = getDraftId(data, interfaceId);

    expect(result).toEqual(interfaceId);
  });
});
