import withInitialData from '../../src/hocomponents/withInitialData';

// A mock component to test withInitialData HoC
describe('withInitialData', () => {
  it('should return a function that returns a React component', () => {
    const hocFunction = withInitialData();
    const EnhancedComponent = hocFunction(() => null);
    expect(typeof hocFunction).toBe('function');
    expect(typeof EnhancedComponent).toBe('function');
  });
});
