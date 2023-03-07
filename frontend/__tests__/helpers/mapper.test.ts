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
  const name = 'foo\.bar';
  const field = unEscapeMapperName(name);
  expect(field).toEqual(result);
});