import { transformSteps } from '../../src/helpers/steps';

test('transformSteps should transform the given steps', () => {
  const transformed = transformSteps(
    ['1', '2', '3'],
    {
      '1': { data: 'temp' },
      '2': { data: 'temp2' },
      '3': { data: 'temp3' },
    },
    1,
    false
  );
  const result = {
    steps: [11, 12, 13],
    stepsData: {
      '1': { data: 'temp' },
      '2': { data: 'temp2' },
      '3': { data: 'temp3' },
      '11': { data: 'temp' },
      '12': { data: 'temp2' },
      '13': { data: 'temp3' },
    },
  };
  expect(transformed).toEqual(result);

  const transformedDeep = transformSteps(
    ['1', '2', '3'],
    {
      '1': { data: 'temp' },
      '2': { data: 'temp2' },
      '3': { data: 'temp3' },
    },
    1,
    true
  );
  expect(transformedDeep).toEqual([11, 12, 13]);
});
