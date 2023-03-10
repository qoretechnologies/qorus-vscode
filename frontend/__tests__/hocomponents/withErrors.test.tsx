import { mount, configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { ErrorsContext } from '../../src/context/errors';
import withErrorsData from '../../src/hocomponents/withErrors';

configure({ adapter: new Adapter() });

const MockComponent = () => <div>Mock Component</div>;

describe('withErrorsData', () => {
  it('should render the component with initial errors', () => {
    const errors = { errors_errors: [{ name: 'Error 1' }, { name: 'Error 2' }] };
    const EnhancedComponent = withErrorsData()(MockComponent);
    const wrapper = mount(
      <ErrorsContext.Provider value={{}}>
        <EnhancedComponent errors={errors} />
      </ErrorsContext.Provider>
    );
    expect(wrapper.find(MockComponent).length).toEqual(1);
    expect(wrapper.find(MockComponent).props().initialErrors).toEqual([
      { id: 1, name: 'Error 1' },
      { id: 2, name: 'Error 2' },
    ]);
  });
});
