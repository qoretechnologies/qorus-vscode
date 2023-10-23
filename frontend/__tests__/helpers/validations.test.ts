import { fixOperatorValue } from '../../src/components/Field/systemOptions';
import { getAddress } from '../../src/components/Field/urlField';
import { splitByteSize } from '../../src/helpers/functions';
import {
  getTypeFromValue,
  getValueOrDefaultValue,
  isValueSet,
  validateField,
} from '../../src/helpers/validations';

test('validateField should validate the value for the field type', () => {
  expect(validateField('string', 123)).toEqual(false);
  expect(validateField('string', '123')).toEqual(true);
  expect(validateField('mapper', '234')).toEqual(true);
  expect(validateField('file-string', 'file')).toEqual(true);
  expect(validateField('array-of-pairs', 'array')).toEqual(false);
  expect(validateField('class-connectors', [{ name: 'name', method: 'method' }])).toEqual(true);
});

test('validateField should return false if class-connector value does not have required properties', () => {
  // name and method are required properties for class-connector value
  expect(validateField('class-connectors', [{ name: 'name' }])).toEqual(false);
  expect(validateField('class-connectors', [])).toEqual(false);
  expect(validateField('class-connectors', '')).toEqual(false);
});

test('validateField should return true if the value is a number', () => {
  expect(validateField('int', 2)).toEqual(true);
  expect(validateField('softint', 2)).toEqual(true);
  expect(validateField('number', 2)).toEqual(true);
  expect(validateField('float', 2)).toEqual(true);
});

test('validateField should return false if the value is not a number', () => {
  expect(validateField('int', '2')).toEqual(false);
  expect(validateField('softint', '2')).toEqual(false);
  expect(validateField('number', '2')).toEqual(false);
  expect(validateField('float', '2')).toEqual(false);
});

test('validateField should return false if the value is a array with at least one item', () => {
  expect(validateField('select-array', [])).toEqual(false);
  expect(validateField('file-tree', [])).toEqual(false);
  expect(validateField('array', [])).toEqual(false);
});

test('validateField should return true if the value is a array with at least one item', () => {
  expect(validateField('select-array', ['"Qorus test string"'])).toEqual(true);
  expect(validateField('file-tree', ['"Qorus test string"'])).toEqual(true);
  expect(validateField('array', ['"Qorus test string"'])).toEqual(true);
});

test('validateField should return true if the value is a valid date', () => {
  expect(validateField('date', new Date())).toEqual(true);
});

test('validateField should return false if the value is not a valid date', () => {
  expect(validateField('date', '"Qorus test string"')).toEqual(false);
});

test('validateField should return false if the value is not an object', () => {
  expect(validateField('hash', '"Qorus test string"')).toEqual(false);
  expect(validateField('hash<auto>', '"Qorus test string"')).toEqual(false);
});

test('validateField should return true if the value is a object', () => {
  expect(validateField('hash', {})).toEqual(true);
  expect(validateField('hash<auto>', {})).toEqual(true);
});

test('validateField should return false if the value a empty object', () => {
  expect(validateField('list', {})).toEqual(false);
  expect(validateField('list<auto>', {})).toEqual(false);
  expect(validateField('softlist<auto>', {})).toEqual(false);
});

test('validateField should return false if the value is not an list of objects', () => {
  expect(validateField('list', 'Qorus test string')).toEqual(false);
  expect(validateField('list<auto>', 'Qorus test string')).toEqual(false);
  expect(validateField('softlist<auto>', 'Qorus test string')).toEqual(false);
});

test('validateField should return false if the value is not a valid mapper-code string', () => {
  expect(validateField('mapper-code', 'Qorus test string')).toEqual(false);
});

test('validateField should return true if the value is a valid mapper-code string', () => {
  expect(validateField('mapper-code', 'code::method')).toEqual(true);
});

test('validateField should return false if the value is not a valid context-selector string', () => {
  expect(validateField('context-selector', 'Qorus test string')).toEqual(false);
});

test('validateField should return true if the value is a valid context-selector string', () => {
  expect(validateField('context-selector', 'code:method')).toEqual(true);
});

test('validateField should return true if the value is a valid url string', () => {
  expect(validateField('url', 'https://www.something.com')).toEqual(true);
});

test('validateField should return false if the value is not a valid url string', () => {
  expect(validateField('url', 'Qorus test string')).toEqual(false);
});

test('validateField should return false if the type is nothing', () => {
  expect(validateField('nothing', 'Qorus test string')).toEqual(false);
});

test('validateField should return false if the value does not contain required fields for byte-size', () => {
  expect(validateField('byte-size', 'Qorus test string')).toEqual(false);
  expect(validateField('byte-size', 'MB')).toEqual(false);
  expect(validateField('byte-size', '23')).toEqual(false);
  expect(validateField('byte-size', 23)).toEqual(false);
});

test('validateField should return true if the value contains valid string for byte-size', () => {
  expect(validateField('byte-size', '23MB')).toEqual(true);
});

test('validateField should return true if the value for endpoint is a string for api-endpoints', () => {
  expect(validateField('api-endpoints', [{ value: 'endpoint' }])).toEqual(true);
});

test('validateField should return false if the value for endpoint is not a string for api-endpoints', () => {
  expect(validateField('api-endpoints', [{ value: 3 }])).toEqual(false);
  expect(validateField('api-endpoints', [])).toEqual(false);
  expect(validateField('api-endpoints', 'Qorus test string')).toEqual(false);
});

test('validateField should return true if all the required fields are valid for api-manager', () => {
  expect(
    validateField('api-manager', {
      factory: 'factory',
      'provider-options': 'some',
      endpoints: [{ value: 'endpoint' }],
    })
  ).toEqual(true);
});

test('validateField should return false if the required fields are not provided for api-manager', () => {
  expect(
    validateField('api-manager', {
      'provider-options': 'some',
      endpoints: [{ value: 'endpoint' }],
    })
  ).toEqual(false);

  expect(validateField('api-manager', {})).toEqual(false);
});

test('validateField should return false if the value is empty or not a string', () => {
  expect(validateField('options', '')).toEqual(false);
  expect(validateField('pipeline-options', '')).toEqual(false);
  expect(validateField('mapper-options', '')).toEqual(false);
  expect(validateField('system-options', '')).toEqual(false);
});

test('validateField should return true if the value is not a empty string', () => {
  expect(validateField('options', 'Qorus test string')).toEqual(true);
  expect(validateField('pipeline-options', 'Qorus test string')).toEqual(true);
  expect(validateField('mapper-options', 'Qorus test string')).toEqual(true);
  expect(validateField('system-options', 'Qorus test string')).toEqual(true);
});

test('validateField should return true if the value is a type of string and is not', () => {
  expect(validateField('options', 'Qorus test string')).toEqual(true);
  expect(validateField('pipeline-options', 'Qorus test string')).toEqual(true);
  expect(validateField('mapper-options', 'Qorus test string')).toEqual(true);
  expect(validateField('system-options', 'Qorus test string')).toEqual(true);
});

describe.only('Options', () => {
  test('should return false if any required options are missing', () => {
    expect(
      validateField(
        'options',
        {
          option1: {
            type: 'string',
            value: 'test',
          },
        },
        {
          optionSchema: {
            option1: {
              required: true,
            },
            option3: {
              required: true,
            },
          },
        }
      )
    ).toEqual(false);
  });

  test('should return true if all required options are filled', () => {
    expect(
      validateField(
        'options',
        {
          option1: {
            type: 'string',
            value: 'test',
          },
          option3: {
            type: 'string',
            value: 'test',
          },
        },
        {
          optionSchema: {
            option1: {
              required: true,
            },
            option3: {
              required: true,
            },
          },
        }
      )
    ).toEqual(true);
  });

  test('should return false if any depend_on dependencies are incorrect', () => {
    expect(
      validateField(
        'options',
        {
          option1: {
            type: 'string',
            value: 'test',
          },
          option2: {
            type: 'string',
            value: undefined,
          },
          option3: {
            type: 'string',
            value: 'test 2',
          },
        },
        {
          optionSchema: {
            option2: {
              depends_on: ['option1'],
            },
            option3: {
              depends_on: ['option2'],
            },
          },
        }
      )
    ).toEqual(false);
  });

  test('should return true if all depend_on dependencies are correct', () => {
    expect(
      validateField(
        'options',
        {
          option1: {
            type: 'string',
            value: 'test',
          },
          option2: {
            type: 'string',
            value: 'test 3',
          },
          option3: {
            type: 'string',
            value: 'test 2',
          },
        },
        {
          optionSchema: {
            option2: {
              depends_on: ['option1'],
            },
            option3: {
              depends_on: ['option2'],
            },
          },
        }
      )
    ).toEqual(true);
  });
});

test('validateField should return true if the value contains valid required fields for fsm-list', () => {
  expect(validateField('fsm-list', [{ name: 'Qorus test string' }])).toEqual(true);
});

test('validateField should return false if the value does not contains valid required fields for fsm-list', () => {
  expect(validateField('fsm-list', [{ name: 2 }])).toEqual(false);
  expect(validateField('fsm-list', [])).toEqual(true);
  expect(validateField('fsm-list', [{}])).toEqual(false);
});

test('validateField should return true if the value is valid yaml', () => {
  expect(validateField('any', [{ something: { something: { something: 'value' } } }])).toEqual(
    true
  );
  expect(validateField('auto', [{ something: { something: { something: 'value' } } }])).toEqual(
    true
  );
});

test('validateField should return false if the value is not valid yaml', () => {
  expect(validateField('any', [])).toEqual(false);
  expect(validateField('auto', '')).toEqual(false);
});

test('validateField should return true if the value is not valid yaml', () => {
  expect(validateField('any', [])).toEqual(false);
  expect(validateField('auto', '')).toEqual(false);
});

test('validateField should return true if the provided value is an object', () => {
  expect(validateField('data-provider', { type: 'factory', name: 'factory' })).toEqual(true);
  expect(
    validateField('type-selector', { type: 'type-selector', name: 'factory', path: 'factory' })
  ).toEqual(true);
});

test('validateField should return false if the provided value not a valid object', () => {
  expect(validateField('data-provider', {})).toEqual(false);
  expect(validateField('type-selector', [])).toEqual(false);
});

test('validateField should return true if all the required values are valid for processor', () => {
  expect(
    validateField('processor', {
      'processor-input-type': { type: 'type-selector', name: 'factory', path: 'factory' },
      'processor-output-type': { type: 'type-selector', name: 'factory', path: 'factory' },
    })
  ).toEqual(true);
});

test('validateField should return false if the required values for the processor are not valid', () => {
  expect(validateField('processor', {})).toEqual(false);
  expect(
    validateField('processor', {
      'processor-input-type': { type: 'type-selector', name: 'factory', path: 'factory' },
    })
  ).toEqual(false);
  expect(
    validateField('processor', {
      'processor-output-type': { type: 'type-selector', name: 'factory', path: 'factory' },
    })
  ).toEqual(false);
});

test('validateField should return false if the provided data is not a valid system-options-with-operators', () => {
  expect(
    validateField('system-options-with-operators', [
      {
        type: 'any',
        value: [{ something: { something: { something: 'value' } } }],
        op: ['some'],
      },
    ])
  ).toEqual(false);
});

test('validateField should return true if the value is a valid class-array', () => {
  expect(validateField('class-array', [{ name: 'Qorus test string' }])).toEqual(true);
});

test('validateField should return false if the value is not a valid class-array', () => {
  expect(validateField('class-array', [])).toEqual(false);
});

test('getTypeFromValue should return type of the value', () => {
  expect(getTypeFromValue(true)).toEqual('bool');
  expect(getTypeFromValue(1)).toEqual('int');
  expect(getTypeFromValue(0.1)).toEqual('float');
  expect(getTypeFromValue({})).toEqual('hash');
  expect(getTypeFromValue([])).toEqual('list');
  expect(getTypeFromValue(new Date())).toEqual('date');
  expect(getTypeFromValue('')).toEqual('string');
});

test('getAddress should return url string', () => {
  expect(getAddress('https://sandbox.qoretechnologies.com/')).toEqual(
    'sandbox.qoretechnologies.com/'
  );
});

test('fixOperatorValue should fix operator value', () => {
  expect(fixOperatorValue(['something'])).toEqual(['something']);
  expect(fixOperatorValue('something')).toEqual(['something']);
});

test('splitByteSize should return byte and size from a byteSize string', () => {
  expect(splitByteSize('32MB')).toEqual([32, 'MB']);
});

test('getValueOrDefaultValue should return the default value if the value is null', () => {
  expect(getValueOrDefaultValue(null, 'test', false)).toEqual('test');
  expect(getValueOrDefaultValue('test', null, true)).toEqual('test');
  expect(getValueOrDefaultValue(null, 'test', true)).toEqual(null);
  expect(getValueOrDefaultValue(null, 'test', true)).toEqual(null);
  expect(getValueOrDefaultValue(undefined, 'test', true)).toEqual('test');
  expect(getValueOrDefaultValue(undefined, null, true)).toEqual(null);
});

test('isValueSet should verify if the value is valid', () => {
  expect(isValueSet(null, true)).toEqual(true);
  expect(isValueSet(undefined, true)).toEqual(false);
  expect(isValueSet('test', true)).toEqual(true);
  expect(isValueSet(null, false)).toEqual(false);
});

it('should test validity of service events', () => {
  // Shouldn't pass
  expect(validateField('service-events', [])).toEqual(false);
  expect(validateField('service-events', [{}])).toEqual(false);
  expect(validateField('service-events', [{ type: 'factory', name: 'wsclient' }])).toEqual(false);
  expect(
    validateField('service-events', [{ type: 'factory', name: 'wsclient', handlers: {} }])
  ).toEqual(false);
  expect(
    validateField('service-events', [
      {
        type: 'factory',
        name: 'wsclient',
        handlers: {
          test: {
            type: 'wrong',
            value: 'ok',
          },
        },
      },
    ])
  ).toEqual(false);
  expect(
    validateField('service-events', [
      {
        type: 'factory',
        name: 'wsclient',
        options: { url: { type: 'string', value: 'test' } },
        handlers: {
          test: {
            type: 'fsm',
            value: 'ok',
          },
        },
      },
      {
        type: 'factory',
        name: 'wsclient',
        handlers: {
          test: {
            type: 'wrong',
            value: 'ok',
          },
        },
      },
    ])
  ).toEqual(false);
  expect(
    validateField('service-events', [
      {
        type: 'factory',
        name: 'wsclient',
        options: { url: { type: 'string', value: 'test' } },
        handlers: {
          test: {
            type: 'fsm',
            value: 'ok',
          },
        },
      },
      {},
    ])
  ).toEqual(false);

  // Should pass
  expect(
    validateField('service-events', [
      {
        type: 'factory',
        name: 'wsclient',
        options: { url: { type: 'string', value: 'test' } },
        handlers: {
          test: {
            type: 'fsm',
            value: 'ok',
          },
        },
      },
    ])
  ).toEqual(true);
  expect(
    validateField('service-events', [
      {
        type: 'factory',
        name: 'wsclient',
        options: { url: { type: 'string', value: 'test' } },
        handlers: {
          test: {
            type: 'fsm',
            value: 'ok',
          },
        },
      },
      {
        type: 'factory',
        name: 'wsclient',
        options: { url: { type: 'string', value: 'test' } },
        handlers: {
          test: {
            type: 'method',
            value: 'ok',
          },
        },
      },
    ])
  ).toEqual(true);
});
