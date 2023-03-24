import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MapperView from '../../../src/containers/InterfaceCreator/mapperView';

describe('MapperView', () => {
  const mockProps = {
    t: jest.fn(),
    isFormValid: jest.fn(),
    selectedFields: {},
    mapper: {},
    initialData: {},
    fields: {},
    showMapperConnections: false,
    setShowMapperConnections: jest.fn(),
    inputsError: null,
    outputsError: null,
    wrongKeysCount: 0,
    qorus_instance: 'test',
    changeInitialData: jest.fn(),
    inConnections: false,
    isEditing: false,
    ifaceType: '',
    interfaceContext: '',
    onSubmitSuccess: jest.fn(),
    interfaceId: { mapper: [] },
    mapperData: {},
    inputsLoading: false,
    outputsLoading: false,
    initialMapperDraftData: {},
  };

  it('should render correctly', () => {
    render(
      <ReqoreUIProvider>
        <MapperView {...mockProps} />
      </ReqoreUIProvider>
    );
  });

  it('LoadingFields should be defined on render', () => {
    render(
      <ReqoreUIProvider>
        <MapperView {...mockProps} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText(/LoadingFields/i)).toBeDefined();
  });

  it('should show warning messages when inputs or outputs are invalid', () => {
    const props = {
      ...mockProps,
      inputsError: 'Invalid inputs',
      outputsError: 'Invalid outputs',
    };
    render(
      <ReqoreUIProvider>
        <MapperView {...props} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText('Invalid inputs')).toBeDefined();
    expect(screen.getByText('Invalid outputs')).toBeDefined();
  });
});
