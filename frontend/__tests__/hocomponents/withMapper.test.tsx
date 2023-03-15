import withInitialData from '../../src/hocomponents/withInitialData';

// A mock component to test withInitialData HoC
const TestComponent = ({ initialData }) => (
  <div>
    <span>{initialData}</span>
  </div>
);

describe('withInitialData', () => {
  it('should return a function that returns a React component', () => {
    const hocFunction = withInitialData();
    const EnhancedComponent = hocFunction(() => null);
    expect(typeof hocFunction).toBe('function');
    expect(typeof EnhancedComponent).toBe('function');
  });

  // TODO. Write complex unit test for this function

  /*it('should pass an initialData prop to the wrapped component', () => {
    const initialData = { foo: 'bar' };
    const MockComponent = jest.fn(() => null);
    const EnhancedComponent = withInitialData()(MockComponent);
    const Wrapper = ({ children }) => (
      <InitialContext.Provider value={initialData}>
        {children}
      </InitialContext.Provider>
    );
    render(<EnhancedComponent />, { wrapper: Wrapper });
    expect(MockComponent).toHaveBeenCalledWith({
      initialData
    }, {});
  });*/
});
