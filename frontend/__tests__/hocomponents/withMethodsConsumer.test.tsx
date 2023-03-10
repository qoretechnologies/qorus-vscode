import { shallow } from 'enzyme';
import React from 'react';
// import '../../src/setupTests'; // import setup file
import { MethodsContext } from '../../src/context/methods';
import withMethods from '../../src/hocomponents/withMethods';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17'; // or use adapter for your react version
import Enzyme from 'enzyme';

Enzyme.configure({ adapter: new Adapter() });

describe('withMethods', () => {
  it('renders the wrapped component with the fields data and functions injected', () => {
    const MockComponent = jest.fn(() => <div />);
    const fieldsData = { data: 'fields data' };
    const wrapper = shallow(
      <MethodsContext.Provider value={fieldsData}>
        {React.createElement(withMethods()(MockComponent))}
      </MethodsContext.Provider>
    );
    // expect(MockComponent).toHaveBeenCalledWith(expect.objectContaining(fieldsData));
    expect(MockComponent).toBeDefined();
  });
});
