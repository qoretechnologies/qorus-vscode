import React from 'react';
import { create } from 'react-test-renderer';
import { MethodsContext } from '../../src/context/methods';
import withMethods from '../../src/hocomponents/withMethods';

describe('withMethods', () => {
  it('renders the wrapped component with the fields data and functions injected', () => {
    const MockComponent = jest.fn(() => <div />);
    const fieldsData = { data: 'fields data' };

    const tree = create(
      <MethodsContext.Provider value={fieldsData}>
        {React.createElement(withMethods()(MockComponent))}
      </MethodsContext.Provider>
    ).toJSON();

    expect(MockComponent).toHaveBeenCalled();
    expect(tree).toMatchSnapshot();
  });
});
