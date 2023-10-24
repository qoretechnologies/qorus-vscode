import { formatFields, sortFields } from '../../src/containers/InterfaceCreator/typeView';
import {
  filterInternalData,
  fixRelations,
  flattenFields,
  getLastChildIndex,
  getStaticDataFieldname,
  hasStaticDataField,
  rebuildOptions,
  unEscapeMapperName,
} from '../../src/helpers/mapper';
const fields = [
  {
    parent: 1,
    input: 'test',
    canBeNull: true,
    type: {
      fields: {
        2: {
          input: 'child-1',
        },
      },
    },
  },
  { input: 'some', canBeNull: true, isCustom: true },
];

test('flattenFields should arrange fields with deps', () => {
  const result = [
    {
      name: 0,
      input: 'test',
      canBeNull: true,
      type: { fields: { '2': { input: 'child-1' } } },
      isMapperChild: false,
      level: 0,
      path: 0,
      parentPath: false,
    },
    {
      name: '2',
      input: 'child-1',
      isMapperChild: true,
      level: 1,
      parent: 0,
      path: '0.2',
      parentPath: '0',
    },
    {
      name: 1,
      input: 'some',
      canBeNull: true,
      isMapperChild: false,
      level: 0,
      path: 1,
      parentPath: false,
      isCustom: true,
    },
  ];
  const flattenedFields = flattenFields(fields);
  expect(flattenedFields).toEqual(result);
});

test('sortFields should order fields', () => {
  const fields = {
    field1: {
      name: 'field1',
      type: {
        fields: {
          fieldDeep1: {
            name: 'fieldDeep1',
            order: 0,
            input: 'child-1',
            type: {
              fields: {
                fieldDeep2: {
                  name: 'fieldDeep2',
                  order: 1,
                  type: {
                    fields: {
                      fieldDeep3: {
                        name: 'fieldDeep3',
                        order: 1,
                        type: { fields: {} },
                      },
                      fieldDeep4: {
                        name: 'fieldDeep4',
                        order: 3,
                        type: { fields: {} },
                      },
                      fieldDeep5: {
                        name: 'fieldDeep5',
                        order: 2,
                        type: { fields: {} },
                      },
                      fieldDeep6: {
                        name: 'fieldDeep6',
                        order: 0,
                        type: { fields: {} },
                      },
                    },
                  },
                  desc: 'Field deep 2 description',
                },
                fieldDeep7: {
                  name: 'fieldDeep7',
                  order: 0,
                  type: { fields: {} },
                },
              },
            },
          },
        },
      },
      desc: 'Field 1 description',
      order: 0,
    },
    field2: {
      name: 'field2',
      desc: 'Field 2 description',
      order: 2,
      type: { fields: {} },
    },
    field3: {
      name: 'field3',
      desc: 'Field 3 description',
      order: 1,
      type: { fields: {} },
    },
  };

  const sortedFields = sortFields(fields);

  expect(sortedFields).toEqual({
    field1: {
      name: 'field1',
      type: {
        fields: {
          fieldDeep1: {
            name: 'fieldDeep1',
            order: 0,
            input: 'child-1',
            type: {
              fields: {
                fieldDeep7: {
                  name: 'fieldDeep7',
                  order: 0,
                  type: { fields: {} },
                },
                fieldDeep2: {
                  name: 'fieldDeep2',
                  order: 1,
                  type: {
                    fields: {
                      fieldDeep6: {
                        name: 'fieldDeep6',
                        order: 0,
                        type: { fields: {} },
                      },
                      fieldDeep3: {
                        name: 'fieldDeep3',
                        order: 1,
                        type: { fields: {} },
                      },
                      fieldDeep5: {
                        name: 'fieldDeep5',
                        order: 2,
                        type: { fields: {} },
                      },
                      fieldDeep4: {
                        name: 'fieldDeep4',
                        order: 3,
                        type: { fields: {} },
                      },
                    },
                  },
                  desc: 'Field deep 2 description',
                },
              },
            },
          },
        },
      },
      desc: 'Field 1 description',
      order: 0,
    },
    field3: {
      name: 'field3',
      desc: 'Field 3 description',
      order: 1,
      type: { fields: {} },
    },
    field2: {
      name: 'field2',
      desc: 'Field 2 description',
      order: 2,
      type: { fields: {} },
    },
  });
});

test('formatFields should add order key if not present', () => {
  const fields = {
    field1: {
      type: {
        fields: {
          fieldDeep1: {
            input: 'child-1',
            type: {
              fields: {
                fieldDeep2: {
                  type: {
                    fields: {
                      fieldDeep3: {},
                      fieldDeep4: {},
                      fieldDeep5: {},
                      fieldDeep6: {},
                    },
                  },
                  desc: 'Field deep 2 description',
                },
                fieldDeep7: {},
              },
            },
          },
        },
      },
      desc: 'Field 1 description',
    },
    field2: {
      desc: 'Field 2 description',
    },
    field3: {
      desc: 'Field 3 description',
    },
  };

  const sortedFields = formatFields(fields);

  expect(sortedFields).toEqual({
    field1: {
      name: 'field1',
      type: {
        fields: {
          fieldDeep1: {
            name: 'fieldDeep1',
            order: 0,
            input: 'child-1',
            type: {
              fields: {
                fieldDeep2: {
                  name: 'fieldDeep2',
                  order: 0,
                  type: {
                    fields: {
                      fieldDeep3: {
                        name: 'fieldDeep3',
                        order: 0,
                        type: { fields: {} },
                      },
                      fieldDeep4: {
                        name: 'fieldDeep4',
                        order: 1,
                        type: { fields: {} },
                      },
                      fieldDeep5: {
                        name: 'fieldDeep5',
                        order: 2,
                        type: { fields: {} },
                      },
                      fieldDeep6: {
                        name: 'fieldDeep6',
                        order: 3,
                        type: { fields: {} },
                      },
                    },
                  },
                  desc: 'Field deep 2 description',
                },
                fieldDeep7: {
                  name: 'fieldDeep7',
                  order: 1,
                  type: { fields: {} },
                },
              },
            },
          },
        },
      },
      desc: 'Field 1 description',
      order: 0,
    },
    field2: {
      name: 'field2',
      desc: 'Field 2 description',
      order: 1,
      type: { fields: {} },
    },
    field3: {
      name: 'field3',
      desc: 'Field 3 description',
      order: 2,
      type: { fields: {} },
    },
  });
});

test('getLastChildIndex should return the last child from the fields array', () => {
  const field = getLastChildIndex(fields[0], fields);
  expect(field).toEqual(-1);
});

test('filterInternalData should filter the fields that needs to be omitted', () => {
  const result = {
    '0': { input: 'test', type: { fields: { '2': { input: 'child-1', type: { fields: {} } } } } },
    '1': { input: 'some', type: { fields: {} } },
  };
  const field = filterInternalData(fields);
  expect(field).toEqual(result);
});

test('hasStaticDataField should check if the context starts with a keyword $static and not with $static:*', () => {
  expect(hasStaticDataField('$static:test')).toEqual(true);
  expect(hasStaticDataField('$static:*test')).toEqual(false);
});

test('getStaticDataFieldname should return the name of the context', () => {
  expect(getStaticDataFieldname('$static:{some:field}')).toEqual('some:field');
});

test('rebuildOptions should return the options object', () => {
  const result = { test: 'test' };
  const options = [{ name: 'test', value: 'test' }];
  const field = rebuildOptions(options);
  expect(field).toEqual(result);
});

test('fixRelations should return the relations object', () => {
  const result = { '0': { '2': 1 } };
  const relations = { '0': { '2': 1 } };
  const outputs = [];
  const inputs = [];
  const field = fixRelations(relations, outputs, inputs);
  expect(field).toEqual(result);
});

test('unEscapeMapperName should return the name of the mapper', () => {
  const result = 'foo.bar';
  const name = 'foo.bar';
  const field = unEscapeMapperName(name);
  expect(field).toEqual(result);
});
