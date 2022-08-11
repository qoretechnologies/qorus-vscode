import React, { FunctionComponent } from 'react';
import { FunctionsContext } from '../context/functions';

// A HoC helper that injects the fields data and functions
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <FunctionsContext.Consumer>{fieldsData => <Component {...props} {...fieldsData} />}</FunctionsContext.Consumer>
    );

    return EnhancedComponent;
};
