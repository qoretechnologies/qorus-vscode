import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { IServicesView, ServicesView } from '../../../src/containers/InterfaceCreator/errorsView';

// Mocking the necessary context for testing
jest.mock('../../../src/context/drafts', () => ({
  DraftsContext: {
    maybeApplyDraft: jest.fn(),
    draft: null,
  },
}));

jest.mock('../../../src/context/errors', () => ({
  ErrorsContext: {
    showErrors: false,
    setShowErrors: jest.fn(),
    subErrors: [],
    handleAddErrorClick: jest.fn(),
    errorsCount: 0,
    activeError: null,
    setActiveError: jest.fn(),
    setSubErrors: jest.fn(),
    setErrorsCount: jest.fn(),
    errorsData: null,
    resetErrors: jest.fn(),
    lastErrorId: 0,
    initialActiveError: null,
  },
}));

// TODO Test app

describe('ServicesView', () => {
  const defaultProps: IServicesView = {
    t: () => '',
    isSubItemValid: () => true,
    removeSubItemFromFields: () => {},
    service: {},
    targetDir: '',
    interfaceId: {},
  };

  test('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <ServicesView {...defaultProps} />
      </ReqoreUIProvider>
    );
  });
  /*
  test('displays the error interface when Next button is clicked', () => {
    const props = { ...defaultProps, interfaceId: { errors: [1] } };
    render(
      <ReqoreUIProvider>
        <ServicesView {...props} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getByText('Next'));
    expect(screen.getByText('Add Errors')).toBeInTheDocument();
  });

  test('calls setActiveError and setShowErrors when Next button is clicked', () => {
    const props = { ...defaultProps, interfaceId: { errors: [1] } };
    const setActiveError = jest.fn();
    const setShowErrors = jest.fn();
    render(
      <ReqoreUIProvider>
        <ServicesView {...props} setActiveError={setActiveError} setShowErrors={setShowErrors} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getByText('Next'));
    expect(setActiveError).toHaveBeenCalledWith(1);
    expect(setShowErrors).toHaveBeenCalledWith(true);
  });

  test('calls setActiveError and setShowErrors when onBackClick is called', () => {
    const props = { ...defaultProps, interfaceId: { errors: [1] } };
    const setActiveError = jest.fn();
    const setShowErrors = jest.fn();
    render(
      <ReqoreUIProvider>
        <ServicesView {...props} setActiveError={setActiveError} setShowErrors={setShowErrors} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getByText('Next'));
    fireEvent.click(screen.getByText('Back'));
    expect(setActiveError).toHaveBeenCalledWith(null);
    expect(setShowErrors).toHaveBeenCalledWith(false);
  });

  test('displays the add error button when showErrors is true', () => {
    const { getByText } = render(
      <ReqoreUIProvider>
        <ServicesView {...defaultProps} />
      </ReqoreUIProvider>
    );
    fireEvent.click(getByText('Next'));
    expect(getByText('Add Error')).toBeInTheDocument();
  });*/
});
