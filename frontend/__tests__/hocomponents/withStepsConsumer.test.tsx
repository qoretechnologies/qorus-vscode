import { render, screen } from '@testing-library/react';
import React from 'react';
import { StepsContext } from '../../src/context/steps';
import withStepsConsumer from '../../src/hocomponents/withStepsConsumer';

describe('withStepsConsumer', () => {
  let Component: React.FunctionComponent<any>;
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
    render(
      <StepsContext.Provider value={fieldsData}>
        <WrappedComponent />
      </StepsContext.Provider>
    );
    expect(screen.getByText(fieldsData.field1)).toBeDefined();
    expect(screen.getByText(fieldsData.field2)).toBeDefined();
  });

  it('should pass additional props to the wrapped component', () => {
    const WrappedComponent = withStepsConsumer()(Component);
    render(
      <StepsContext.Provider value={fieldsData}>
        <WrappedComponent additionalProp="additional prop value" />
      </StepsContext.Provider>
    );
    expect(WrappedComponent).toBeDefined();
  });
});
