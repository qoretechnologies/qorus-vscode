import React from 'react';
import withStepsConsumer from '../../src/hocomponents/withStepsConsumer';

import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new Adapter() });

describe('withStepsConsumer', () => {
  let Component: React.FC<any>;
  let fieldsData: any;

  beforeEach(() => {
    Component = (props: any) => (
      <div>
        <span>Component</span>
        <span>{props.field1}</span>
        <span>{props.field2}</span>
      </div>
    );

    fieldsData = {
      field1: 'field1 value',
      field2: 'field2 value',
    };
  });

  it('should render the wrapped component with fields data', () => {
    const WrappedComponent = withStepsConsumer()(Component);

    const wrapper = shallow(<WrappedComponent />);

    expect(wrapper.find(Component)).toBeDefined();
  });

  it('should pass additional props to the wrapped component', () => {
    const WrappedComponent = withStepsConsumer()(Component);

    const wrapper = shallow(<WrappedComponent additionalProp="additional prop value" />);

    expect(wrapper.find(Component)).toHaveLength(0);
  });
});
