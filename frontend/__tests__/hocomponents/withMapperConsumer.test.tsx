import { mount } from 'enzyme';
import { MapperContext } from '../../src/context/mapper';
import withFieldsData from '../../src/hocomponents/withMapperConsumer';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';

configure({ adapter: new Adapter() });

describe('withFieldsData', () => {
  it('should render the component with fields data', () => {
    const fieldsData = {
      inputs: [{ name: 'input1', value: 'value1' }],
      contextInputs: [],
      outputs: [],
      inputProvider: jest.fn(),
      outputProvider: jest.fn(),
      relations: [],
      inputChildren: [],
      outputChildren: [],
      inputRecord: null,
      outputRecord: null,
      inputOptionProvider: jest.fn(),
      outputOptionProvider: jest.fn(),
      mapperKeys: [],
      hideInputSelector: false,
      hideOutputSelector: false,
      error: '',
      isContextLoaded: true,
    };
    const TestComponent = () => <div />;
    const EnhancedComponent = withFieldsData()(TestComponent);
    const wrapper = mount(
      <MapperContext.Provider value={fieldsData}>
        <EnhancedComponent />
      </MapperContext.Provider>
    );
    expect(wrapper.find(TestComponent).props().mapperData).toEqual(fieldsData);
  });
});
