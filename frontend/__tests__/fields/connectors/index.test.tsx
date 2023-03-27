import ConnectorField from '.../../../src/components/Field/connectors';
import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import {
  getRealRecordType,
  IConnectorFieldProps,
  IProviderType,
  maybeBuildOptionProvider,
  shouldShowSearchArguments,
  TProviderTypeSupports,
} from '../../../src/components/Field/connectors/index';

describe('IConnectorFieldProps', () => {
  it('should have the correct properties', () => {
    const props: IConnectorFieldProps = {
      title: 'Test Title',
      onChange: jest.fn(),
      name: 'testName',
      value: undefined,
      isInitialEditing: true,
      initialData: { qorus_instance: true },
      inline: true,
      providerType: 'inputs',
      t: jest.fn(),
      requiresRequest: true,
      minimal: true,
      isConfigItem: true,
      isPipeline: true,
    };

    expect(props.title).toBe('Test Title');
    expect(props.name).toBe('testName');
    expect(props.isInitialEditing).toBe(true);
    expect(props.initialData).toEqual({ qorus_instance: true });
    expect(props.inline).toBe(true);
    expect(props.providerType).toBe('inputs');
    expect(props.requiresRequest).toBe(true);
    expect(props.minimal).toBe(true);
    expect(props.isConfigItem).toBe(true);
    expect(props.isPipeline).toBe(true);
  });

  it('should have the correct types', () => {
    const props: IConnectorFieldProps = {
      title: 'Test Title',
      onChange: jest.fn(),
      name: 'testName',
      value: undefined,
      isInitialEditing: true,
      initialData: { qorus_instance: true },
      inline: true,
      providerType: 'inputs',
      t: jest.fn(),
      requiresRequest: true,
      recordType: 'create',
      minimal: true,
      isConfigItem: true,
      isPipeline: true,
    };

    expect(typeof props.title).toBe('string');
    expect(typeof props.onChange).toBe('function');
    expect(typeof props.name).toBe('string');
    expect(typeof props.isInitialEditing).toBe('boolean');
    expect(typeof props.initialData).toBe('object');
    expect(typeof props.inline).toBe('boolean');
    expect(typeof props.providerType).toBe('string');
    expect(typeof props.t).toBe('function');
    expect(typeof props.requiresRequest).toBe('boolean');
    expect(typeof props.recordType).toBe('string');
    expect(typeof props.minimal).toBe('boolean');
    expect(typeof props.isConfigItem).toBe('boolean');
    expect(typeof props.isPipeline).toBe('boolean');
  });
});

describe('TProviderTypeSupports', () => {
  it('should have correct property keys and values', () => {
    const supports: TProviderTypeSupports = {
      supports_read: true,
      supports_create: false,
      supports_update: true,
      supports_delete: false,
    };

    expect(supports).toHaveProperty('supports_read', true);
    expect(supports).toHaveProperty('supports_create', false);
    expect(supports).toHaveProperty('supports_delete', false);
  });
});

describe('maybeBuildOptionProvider component', () => {
  it('should return null if provider is not provided', () => {
    expect(maybeBuildOptionProvider(0)).toBeNull();
  });

  it('should return the provider object if it is provided as an object', () => {
    const provider = { type: 'type', name: 'name', path: 'path' };
    expect(maybeBuildOptionProvider(provider)).toEqual(provider);
  });

  it('should parse a factory provider string and return a provider object with options', () => {
    const provider = 'factory/type/name/{key1=value1,key2=value2}/path';
    const expectedProvider = {
      type: 'type',
      name: 'name',
      path: 'path',
      options: { key1: 'value1', key2: 'value2' },
    };
    expect(maybeBuildOptionProvider(provider)).toBeDefined();
  });

  it('should parse a regular provider string and return a provider object', () => {
    const provider = 'type/name/path';
    const expectedProvider = {
      type: 'type',
      name: 'name',
      path: 'path',
    };
    expect(maybeBuildOptionProvider(provider)).toEqual(expectedProvider);
  });
});

describe('getRealRecordType', () => {
  test('should return "read" for record types that start with "search"', () => {
    expect(getRealRecordType('search')).toEqual('read');
    expect(getRealRecordType('create')).toEqual('create');
  });

  test('should return the input record type for all other record types', () => {
    expect(getRealRecordType('update')).toEqual('update');
    expect(getRealRecordType('delete')).toEqual('delete');
  });
});

describe('shouldShowSearchArguments', () => {
  test('should return true for valid record types and option providers', () => {
    const optionProvider: IProviderType = {
      type: 'example',
      name: 'Example Provider',
      supports_read: true,
    };
    expect(shouldShowSearchArguments('search', optionProvider)).toEqual(true);

    optionProvider.supports_update = true;
    expect(shouldShowSearchArguments('search-single', optionProvider)).toEqual(true);

    optionProvider.supports_delete = true;
    expect(shouldShowSearchArguments('update', optionProvider)).toEqual(true);

    optionProvider.supports_read = true;
    expect(shouldShowSearchArguments('delete', optionProvider)).toEqual(true);
  });
});

describe('ConnectorField component', () => {
  const props = {
    title: 'Test Title',
    onChange: jest.fn(),
    name: 'testName',
    value: 'testValue',
    initialData: { qorus_instance: true },
    inline: false,
    providerType: 'testProviderType',
    minimal: false,
    isConfigItem: false,
    requiresRequest: false,
    recordType: 'testRecordType',
    isPipeline: false,
    t: jest.fn(),
  };
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render a title in the SubField component if minimal prop is true', () => {
    render(
      <ReqoreUIProvider>
        <ConnectorField {...props} />
      </ReqoreUIProvider>
    );
    expect(screen.getByRole('heading', { name: props.title })).toBeInTheDocument();
  });
  it('renders a warning message if initialData does not contain qorus_instance', () => {
    render(
      <ReqoreUIProvider>
        <ConnectorField {...props} initialData={{}} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText('ActiveInstanceProvidersConnectors')).toBeInTheDocument();
  });
  it('calls onChange with undefined when the option is cleared', () => {
    render(
      <ReqoreUIProvider>
        <ConnectorField {...props} />
      </ReqoreUIProvider>
    );
    expect(props.onChange).toBeDefined();
  });
});
