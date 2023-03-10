import { render, screen } from '@testing-library/react';
import { createContext } from 'react';
import withInterfaceCreation from '../../src/hocomponents/withFunctions';

describe('withInterfaceCreation', () => {
  let Component;
  let props;
  let contextValues;
  const FunctionsContext = createContext({});

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

  it.only('renders the component', () => {
    const EnhancedComponent = withInterfaceCreation()(Component);

    render(<EnhancedComponent data-testid="test" />);
    expect(screen.getByText('Component')).toBeDefined();
  });

  it('sets active function when functions count changes', () => {
    const EnhancedComponent = withInterfaceCreation()(Component);
    const { rerender } = render(<EnhancedComponent {...props} />);
    expect(contextValues.setActiveFunction).not.toHaveBeenCalled();
    contextValues.functionsCount = 2;
    rerender(<EnhancedComponent {...props} />);
    expect(contextValues.setActiveFunction).toHaveBeenCalled();
  });
});
