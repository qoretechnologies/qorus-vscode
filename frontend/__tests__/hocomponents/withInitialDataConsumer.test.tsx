import { configure, shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { InitialContext } from '../../src/context/init';
import withInitialData from '../../src/hocomponents/withInitialData';

configure({ adapter: new Adapter() });

describe('withInitialData', () => {
  it('renders the wrapped component with the initialData prop injected', () => {
    const MockComponent = jest.fn(() => <div />);
    const initialData = { foo: 'bar' };
    const wrapper = shallow(
      <InitialContext.Provider value={initialData}>
        <>{withInitialData()(MockComponent)}</>
      </InitialContext.Provider>
    );
    expect(MockComponent).toBeDefined();
  });
});
