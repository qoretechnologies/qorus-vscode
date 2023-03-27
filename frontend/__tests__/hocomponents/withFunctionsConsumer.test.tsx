import { render } from '@testing-library/react';
import { FunctionsContext } from '../../src/context/functions';
import withFunctionsConsumer from '../../src/hocomponents/withFunctionsConsumer';

describe('withFunctionsConsumer', () => {
  it('should render the wrapped component with functions data', () => {
    const mockComponent = jest.fn(() => <div>Mock Component</div>);
    const mockFunctionsData = {
      someFunction: jest.fn(),
      someOtherFunction: jest.fn(),
    };
    const WrappedComponent = withFunctionsConsumer()(mockComponent);

    const { container } = render(
      <FunctionsContext.Provider value={mockFunctionsData}>
        <WrappedComponent />
      </FunctionsContext.Provider>
    );

    expect(mockComponent).toHaveBeenCalled();
    expect(mockComponent.mock.calls[0][0].someFunction).toEqual(mockFunctionsData.someFunction);
    expect(mockComponent.mock.calls[0][0].someOtherFunction).toEqual(
      mockFunctionsData.someOtherFunction
    );
  });
});
