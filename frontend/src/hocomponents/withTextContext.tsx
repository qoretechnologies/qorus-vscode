import { FunctionComponent } from 'react';
import { TextContext } from '../context/text';

// A function that returns a new component with the text function injected
const withTextContext =
  () =>
  (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
      <TextContext.Consumer>{(t) => <Component {...props} t={t} />}</TextContext.Consumer>
    );

    return EnhancedComponent;
  };

export default withTextContext;
