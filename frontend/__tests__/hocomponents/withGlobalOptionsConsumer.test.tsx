import { render } from '@testing-library/react';
import { GlobalContext } from '../../src/context/global';
import withFieldsConsumer from '../../src/hocomponents/withFieldsConsumer';

const MockComponent = jest.fn(() => <div />);

describe('withFieldsConsumer', () => {
  it('should render the component with original props and fieldsData props', () => {
    const fieldsData = { field1: 'value1', field2: 'value2' };
    const props = { prop1: 'value3', prop2: 'value4' };

    const EnhancedComponent = withFieldsConsumer()(MockComponent);
    render(
      <GlobalContext.Provider value={fieldsData}>
        <EnhancedComponent {...props} />
      </GlobalContext.Provider>
    );

    expect(MockComponent).toHaveBeenCalled();
  });

  it('should render the component with fieldsData props', () => {
    const fieldsData = { field1: 'value1', field2: 'value2' };
    const EnhancedComponent = withFieldsConsumer()(MockComponent);
    render(
      <GlobalContext.Provider value={fieldsData}>
        <EnhancedComponent />
      </GlobalContext.Provider>
    );
    expect(MockComponent).toHaveBeenCalled();
  });
});
