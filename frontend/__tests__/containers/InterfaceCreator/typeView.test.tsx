import '@testing-library/jest-dom';
import { formatFields } from '../../../src/containers/InterfaceCreator/typeView';

describe('TypeView', () => {
  describe('formatFields', () => {
    test('should return an empty object when given an empty object', () => {
      const result = formatFields({});
      expect(result).toEqual({});
    });
    test('should format nested fields with dots in their names', () => {
      const input = {
        user: {
          firstName: { type: 'string' },
          'address.street': { type: 'string' },
        },
      };
      const expectedOutput = {
        user: {
          firstName: { type: 'string' },
          'address.street': { type: 'string' },
          name: 'user',
          type: { fields: {} },
        },
      };
      const result = formatFields(input);
      expect(result).toEqual(expectedOutput);
    });

    test('should format nested fields with no "type" property', () => {
      const input = {
        user: {
          firstName: {},
          address: {
            street: {},
          },
        },
      };
      const expectedOutput = {
        user: {
          firstName: {},
          address: { street: {} },
          name: 'user',
          type: { fields: {} },
        },
      };
      const result = formatFields(input);
      expect(result).toEqual(expectedOutput);
    });
  });
});
