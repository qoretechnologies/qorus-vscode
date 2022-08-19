import React, { FunctionComponent } from 'react';
import { MethodsContext } from '../context/methods';

// A HoC helper that injects the fields data and functions
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <MethodsContext.Consumer>{fieldsData => <Component {...props} {...fieldsData} />}</MethodsContext.Consumer>
    );

    return EnhancedComponent;
};
