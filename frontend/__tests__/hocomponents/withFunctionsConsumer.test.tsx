import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount } from 'enzyme';
import { FunctionsContext } from '../../src/context/functions';
import withFunctionsConsumer from '../../src/hocomponents/withFunctionsConsumer';

configure({ adapter: new Adapter() });

describe('withFunctionsConsumer', () => {
  it('should render the wrapped component with functions data', () => {
    const mockComponent = () => <div>Mock Component</div>;
    const mockFunctionsData = {
      someFunction: () => {},
      someOtherFunction: () => {},
    };
    const WrappedComponent = withFunctionsConsumer()(mockComponent);

    const wrapper = mount(
      <FunctionsContext.Provider value={mockFunctionsData}>
        <WrappedComponent />
      </FunctionsContext.Provider>
    );

    expect(wrapper.find(mockComponent).props().someFunction).toEqual(
      mockFunctionsData.someFunction
    );
    expect(wrapper.find(mockComponent).props().someOtherFunction).toEqual(
      mockFunctionsData.someOtherFunction
    );
  });
});
