import {
  IProviderType,
  shouldShowSearchArguments,
} from '../../../src/components/Field/connectors/';

describe('shouldShowSearchArguments', () => {
  test('shouldShowSearchArguments returns true when recordType is search and optionProvider supports read', () => {
    const recordType = 'search';
    const optionProvider: IProviderType = {
      type: 'dummy',
      name: 'Dummy Provider',
      supports_read: true,
    };
    const result = shouldShowSearchArguments(recordType, optionProvider);

    expect(result).toBe(true);
  });

  test('shouldShowSearchArguments returns true when recordType is search-single and optionProvider supports read', () => {
    const recordType = 'search-single';
    const optionProvider: IProviderType = {
      type: 'dummy',
      name: 'Dummy Provider',
      supports_read: true,
    };
    const result = shouldShowSearchArguments(recordType, optionProvider);

    expect(result).toBe(true);
  });

  test('shouldShowSearchArguments returns false when recordType is create and optionProvider supports read', () => {
    const recordType = 'create';
    const optionProvider: IProviderType = {
      type: 'dummy',
      name: 'Dummy Provider',
      supports_read: true,
    };
    const result = shouldShowSearchArguments(recordType, optionProvider);

    expect(result).toBe(false);
  });
});
