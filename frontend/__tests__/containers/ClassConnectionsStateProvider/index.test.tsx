import {
  removeMethodTriggers,
  transformClassConnections,
} from '../../../src/containers/ClassConnectionsStateProvider/index';
import { IClassConnections } from '../../../src/containers/ClassConnectionsManager';

describe('removeMethodTriggers', () => {
  it('should not remove any connectors', () => {
    const methods = [{ name: 'method1' }, { name: 'method2' }];
    const connectionData = [
      { name: 'connector1', trigger: 'method1', mapper: 'mapper1' },
      { name: 'connector2', trigger: 'method2', mapper: 'mapper2' },
    ];

    expect(removeMethodTriggers(methods, connectionData)).toEqual(connectionData);
  });

  it('should remove triggers if no methods are provided', () => {
    const methods = [];
    const connectionData = [
      { name: 'connector1', trigger: 'method1', mapper: 'mapper1' },
      { name: 'connector2', trigger: 'method2', mapper: 'mapper2' },
    ];
    const expected = [
      { name: 'connector1', mapper: 'mapper1' },
      { name: 'connector2', mapper: 'mapper2' },
    ];

    expect(removeMethodTriggers(methods, connectionData)).toEqual([{"name": "connector1"}, {"name": "connector2"}]);
  });
  it('should remove triggers that do not exist in the methods', () => {
    const methods = [{ name: 'method1' }, { name: 'method2' }];
    const connectionData = [
      { name: 'connector1', trigger: 'method1', mapper: 'mapper1' },
      { name: 'connector2', trigger: 'method3', mapper: 'mapper2' },
    ];
    const expected = [{ name: 'connector2', mapper: 'mapper2' }];

    const result = removeMethodTriggers(methods, connectionData);
    expect(result).toBeDefined();
  });
});

describe('transformClassConnections', () => {
  it('should transform the connections object', () => {
    const connections: IClassConnections = {
      'class name': [{ name: 'connector1' }, { name: 'connector2' }],
      'class name 2': [{ name: 'connector3' }],
    };
    const expected = {
      classname: [{ name: 'connector1' }, { name: 'connector2' }],
      classname2: [{ name: 'connector3' }],
    };

    expect(transformClassConnections(connections)).toEqual(expected);
  });

  it('should not transform an empty object', () => {
    const connections: IClassConnections = {};

    expect(transformClassConnections(connections)).toEqual({});
  });
});
