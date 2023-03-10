import Enzyme, { mount } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import InterfaceCreator from '../../src/hocomponents/withMapper';

Enzyme.configure({ adapter: new Adapter() });

describe('InterfaceCreator', () => {
  const MockComponent = ({ mapper }) => (
    <div>
      <p>{mapper}</p>
    </div>
  );

  const props = {
    qorus_instance: 'http://localhost:8080',
    mapper: {},
  };

  it('should render without crashing', () => {
    const EnhancedComponent = InterfaceCreator()(MockComponent);
    const wrapper = {};
    expect(EnhancedComponent).toBeDefined();
  });
});
