import { shallow } from 'enzyme';
import withInitialData from '../../src/hocomponents/withInitialData';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

declare namespace jest {
  function restoreAllMocks(): void;
  function spyOn(): void;
  function fn(): void;
}

describe('withInitialData', () => {
  let Component;
  let setTheme;
  let props;
  let addNotification;
  let initialData;
  let setTexts;
  let setT;

  beforeEach(() => {
    Component = () => null;
    setTheme = jest.fn();
    addNotification = jest.fn();
    setTexts = jest.fn();
    setT = jest.fn();
    initialData = {
      qorus_instance: {
        url: 'https://qorus.example.com',
      },
    };
    props = { setTheme };
  });

  it('renders the component', () => {
    const EnhancedComponent = withInitialData()(Component);
    const wrapper = shallow(<EnhancedComponent {...props} />);
    expect(wrapper.exists()).toBeDefined();
  });
});
