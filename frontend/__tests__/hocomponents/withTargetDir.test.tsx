import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import Enzyme, { shallow } from 'enzyme';
import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import withTargetDir, { IEnhancedComponent } from '../../src/hocomponents/withTargetDir';

Enzyme.configure({ adapter: new Adapter() });

const MockComponent: React.FC<IEnhancedComponent> = () => <div />;

describe('withTargetDir', () => {
  const mockStore = configureStore([]);
  let store: any;

  beforeEach(() => {
    store = mockStore({
      create_iface_target_dir: '/default/path',
    });
  });

  it('should render the enhanced component', () => {
    const EnhancedComponent = withTargetDir(MockComponent);
    const wrapper = shallow(
      <Provider store={store}>
        <EnhancedComponent />
      </Provider>
    );
    expect(wrapper.find(MockComponent)).toBeTruthy();
  });
});
