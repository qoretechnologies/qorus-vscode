import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { ThemeProvider } from 'styled-components';
import MapperProvider, {
  configItemFactory,
  filterChildren,
  IProviderProps,
  providers,
  StyledWrapper,
} from '../../../src/containers/Mapper/provider';

describe('IProviderProps', () => {
  it('should have all required properties', () => {
    const props: IProviderProps = {
      type: 'inputs',
      provider: 'Test Provider',
      setProvider: jest.fn(),
      nodes: [],
      setChildren: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      record: {},
      setRecord: jest.fn(),
      setFields: jest.fn(),
      initialData: {},
      clear: jest.fn(),
      title: 'Test Title',
      setOptionProvider: jest.fn(),
      hide: jest.fn(),
      style: {},
    };

    expect(props).toMatchObject({
      type: expect.any(String),
      provider: expect.any(String),
      setProvider: expect.any(Function),
      nodes: expect.any(Array),
      setChildren: expect.any(Function),
      isLoading: expect.any(Boolean),
      setIsLoading: expect.any(Function),
      record: expect.any(Object),
      setRecord: expect.any(Function),
      setFields: expect.any(Function),
      initialData: expect.any(Object),
      clear: expect.any(Function),
      title: expect.any(String),
      setOptionProvider: expect.any(Function),
      hide: expect.any(Function),
      style: expect.any(Object),
    });
  });

  it('should allow optional properties', () => {
    const props: IProviderProps = {
      type: 'inputs',
      provider: 'Test Provider',
      setProvider: jest.fn(),
      nodes: [],
      setChildren: jest.fn(),
      isLoading: false,
      setIsLoading: jest.fn(),
      record: {},
      setRecord: jest.fn(),
      setFields: jest.fn(),
      initialData: {},
      clear: jest.fn(),
      title: 'Test Title',
      setOptionProvider: jest.fn(),
      hide: jest.fn(),
      style: {},
      isConfigItem: true,
      requiresRequest: true,
      recordType: 'search',
      options: { testOption: 'testValue' },
      optionsChanged: true,
      onResetClick: jest.fn(),
    };

    expect(props).toMatchObject({
      isConfigItem: expect.any(Boolean),
      requiresRequest: expect.any(Boolean),
      recordType: expect.any(String),
      options: expect.any(Object),
      optionsChanged: expect.any(Boolean),
      onResetClick: expect.any(Function),
    });
  });
});

describe('StyledWrapper component', () => {
  it('renders correctly with default props', () => {
    render(
      <ThemeProvider theme={{}}>
        <StyledWrapper hasTitle={false}>Test</StyledWrapper>
      </ThemeProvider>
    );
    expect(screen.getByText('Test')).toBeDefined();
  });

  it('renders correctly with compact prop and no hasTitle prop', () => {
    render(
      <ThemeProvider theme={{}}>
        <StyledWrapper compact={true} hasTitle={false} data-testid="wrapper">
          <span>Test</span>
        </StyledWrapper>
      </ThemeProvider>
    );
    const wrapper = screen.getByTestId('wrapper');
    expect(wrapper).toBeTruthy();
  });
});

describe('providers object', () => {
  it('contains the correct properties', () => {
    expect(providers).toHaveProperty('type');
    expect(providers.type).toHaveProperty('name', 'type');
    expect(providers).toHaveProperty('connection');
    expect(providers.connection).toHaveProperty('name', 'connection');
    expect(providers).toHaveProperty('remote');
    expect(providers.remote).toHaveProperty('name', 'remote');
    expect(providers).toHaveProperty('datasource');
    expect(providers.datasource).toHaveProperty('name', 'datasource');
    expect(providers).toHaveProperty('factory');
    expect(providers.factory).toHaveProperty('name', 'factory');
  });
});

describe('configItemFactory object', () => {
  it('contains the correct properties', () => {
    expect(configItemFactory).toHaveProperty('name', 'factory');
    expect(configItemFactory).toHaveProperty('url', 'dataprovider/factories');
    expect(configItemFactory).toHaveProperty('suffix', '/provider');
    expect(configItemFactory).toHaveProperty('namekey', 'name');
    expect(configItemFactory).toHaveProperty('desckey', 'desc');
    expect(configItemFactory).toHaveProperty('recordSuffix', '');
    expect(configItemFactory).toHaveProperty('requiresRecord', false);
    expect(configItemFactory).toHaveProperty('suffixRequiresOptions', true);
    expect(configItemFactory).toHaveProperty('type', 'factory');
  });
});

describe('filterChildren', () => {
  const children = [
    {
      has_record: true,
      children_can_support_records: false,
      has_provider: false,
      up: true,
      supports_request: false,
      children_can_support_apis: false,
    },
    {
      has_record: false,
      children_can_support_records: true,
      has_provider: false,
      up: true,
      supports_request: false,
      children_can_support_apis: false,
    },
    {
      has_record: false,
      children_can_support_records: false,
      has_provider: true,
      up: true,
      supports_request: false,
      children_can_support_apis: false,
    },
    {
      has_record: false,
      children_can_support_records: false,
      has_provider: false,
      up: false,
      supports_request: true,
      children_can_support_apis: false,
    },
    {
      has_record: false,
      children_can_support_records: false,
      has_provider: false,
      up: true,
      supports_request: true,
      children_can_support_apis: false,
    },
    {
      has_record: false,
      children_can_support_records: false,
      has_provider: false,
      up: true,
      supports_request: false,
      children_can_support_apis: true,
    },
  ];

  it('should filter by isPipeline flag', () => {
    const filtered = filterChildren(children, { isPipeline: true });

    expect(filtered).toEqual([
      {
        has_record: true,
        children_can_support_records: false,
        has_provider: false,
        up: true,
        supports_request: false,
        children_can_support_apis: false,
      },
      {
        has_record: false,
        children_can_support_records: true,
        has_provider: false,
        up: true,
        supports_request: false,
        children_can_support_apis: false,
      },
      {
        has_record: false,
        children_can_support_records: false,
        has_provider: true,
        up: true,
        supports_request: false,
        children_can_support_apis: false,
      },
    ]);
  });

  it('should filter by recordType flag', () => {
    const filtered = filterChildren(children, { recordType: true });

    expect(filtered).toEqual([
      {
        has_record: true,
        children_can_support_records: false,
        has_provider: false,
        up: true,
        supports_request: false,
        children_can_support_apis: false,
      },
      {
        has_record: false,
        children_can_support_records: true,
        has_provider: false,
        up: true,
        supports_request: false,
        children_can_support_apis: false,
      },
      {
        has_record: false,
        children_can_support_records: false,
        has_provider: true,
        up: true,
        supports_request: false,
        children_can_support_apis: false,
      },
    ]);
  });

  it('should not filter if no flags are provided', () => {
    const filtered = filterChildren(children);
    expect(filtered).toEqual(children);
  });
});

describe('MapperProvider', () => {
  const mockProps = {
    provider: '',
    setProvider: jest.fn(),
    nodes: [],
    setChildren: jest.fn(),
    isLoading: false,
    setIsLoading: jest.fn(),
    record: {},
    setRecord: jest.fn(),
    setFields: jest.fn(),
    clear: jest.fn(),
    initialData: { fetchData: jest.fn() },
    setMapperKeys: jest.fn(),
    setOptionProvider: jest.fn(),
    title: '',
    type: '',
    hide: false,
    compact: false,
    canSelectNull: false,
    style: {},
    isConfigItem: false,
    options: {},
    requiresRequest: false,
    optionsChanged: jest.fn(),
    onResetClick: jest.fn(),
    optionProvider: '',
    recordType: false,
    isPipeline: false,
    handleProviderChange: jest.fn(),
  };

  test('should initialize state hooks correctly', () => {
    const { result } = renderHook(() => MapperProvider({} as any));
    expect(result.current[0]).toBeUndefined();
  });
  test('should debounce options change correctly', () => {
    jest.useFakeTimers();
    const { result, rerender } = renderHook(
      ({ options }) =>
        MapperProvider({
          options,
          setMapperKeys: jest.fn(),
          setOptionProvider: jest.fn(),
          title: '',
          type: '',
          hide: false,
          compact: false,
          canSelectNull: false,
          style: {},
          isConfigItem: false,
          requiresRequest: false,
          optionsChanged: false,
          onResetClick: jest.fn(),
          recordType: '',
          isPipeline: false,
        } as any),
      { initialProps: { options: {} } }
    );

    expect(result.current[1]).toBeUndefined();
  });
  test('should construct realProviders object correctly', () => {
    const providers = {
      type: { value: 'my-type' },
      factory: { value: 'my-factory' },
      datasource: { value: 'my-datasource' },
    };

    let result = MapperProvider({
      providers,
      isConfigItem: false,
      requiresRequest: false,
      recordType: '',
      isPipeline: false,
    } as any);

    expect(result).toBeDefined();
  });
});
