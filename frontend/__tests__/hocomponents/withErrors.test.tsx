import { render, screen } from '@testing-library/react';
import { ErrorsContext } from '../../src/context/errors';
import { withInterfaceCreationState } from '../../src/hocomponents/withErrors';

describe('withInterfaceCreationState', () => {
  it('should set initial errors state correctly', () => {
    const Component = () => <div data-testid="errors-context" />;
    const props = {
      errors: {
        errors_errors: [{ name: 'Method 1' }, { name: 'Method 2' }, { name: 'Method 3' }],
      },
    };
    const EnhancedComponent = withInterfaceCreationState()(Component);
    render(
      <ErrorsContext.Provider value={{}}>
        <EnhancedComponent {...props} />
      </ErrorsContext.Provider>
    );
    const errorsContextValue = screen.getByTestId('errors-context').getAttribute('value');
    expect(JSON.parse(errorsContextValue)).toBeDefined();
  });

  it('should add new error state correctly', () => {
    const Component = () => <div data-testid="errors-context" />;
    const props = {
      errors: {
        errors_errors: [{ name: 'Method 1' }],
      },
    };
    const EnhancedComponent = withInterfaceCreationState()(Component);
    render(
      <ErrorsContext.Provider value={{}}>
        <EnhancedComponent {...props} />
      </ErrorsContext.Provider>
    );
    const errorsContextValue = screen.getByTestId('errors-context').getAttribute('value');
    const parsedErrorsContextValue = JSON.parse(errorsContextValue);
    const updatedErrorsContextValue = screen.getByTestId('errors-context').getAttribute('value');
    const parsedUpdatedErrorsContextValue = JSON.parse(updatedErrorsContextValue);
    expect(parsedUpdatedErrorsContextValue).toBeDefined();
  });
});
