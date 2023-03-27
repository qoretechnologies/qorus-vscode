import { render, screen } from '@testing-library/react';
import { createContext } from 'react';
import withInterfaceCreation from '../../src/hocomponents/withFunctions';

describe('withInterfaceCreation', () => {
  let Component;
  let props;
  let contextValues;
  const FunctionsContext = createContext({});
  const MockComponent = () => <div data-testid="mock-component" />;
  const EnhancedMockComponent = withInterfaceCreation()(MockComponent);

  beforeEach(() => {
    contextValues = {
      showFunctions: false,
      setShowFunctions: jest.fn(),
      functions: [{ id: 1, name: 'function1' }],
      handleAddFunctionClick: jest.fn(),
      functionsCount: 1,
      activeFunction: 1,
      setActiveFunction: jest.fn(),
      setFunctions: jest.fn(),
      setFunctionsCount: jest.fn(),
      functionsData: [{ id: 1, name: 'function1' }],
      resetMapperMethods: jest.fn(),
      setFunctionsFromDraft: jest.fn(),
      initialActiveFunction: 1,
      initialShowFunctions: false,
      lastFunctionId: 1,
      'data-testid': 'test',
    };

    props = {
      'mapper-code': {
        'mapper-methods': [{ name: 'function1' }],
        active_method: 1,
      },
    };

    Component = () => <div>Component</div>;
  });

  it('renders the component', () => {
    const EnhancedComponent = withInterfaceCreation()(Component);

    render(<EnhancedComponent data-testid="test" />);
    expect(screen.getByText('Component')).toBeDefined();
  });

  it('should render the wrapped component', () => {
    render(<EnhancedMockComponent />);
    expect(screen.getByTestId('mock-component')).toBeDefined();
  });
});
