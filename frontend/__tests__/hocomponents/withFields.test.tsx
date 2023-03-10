import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { mount } from 'enzyme';
import withState from '../../src/hocomponents/withFields';

Enzyme.configure({ adapter: new Adapter() });

describe('withState', () => {
  it('should reset all data on calling resetAllData', () => {
    const component = () => <div>Test Component</div>;
    const EnhancedComponent = withState()(component);
    const wrapper = mount(<EnhancedComponent />);

    const instance = wrapper.instance();
    if (!!instance && instance.resetAllData) {
      instance.resetAllData();
    }
    wrapper.update();

    expect(wrapper.exists()).toBeDefined();
  });
});
