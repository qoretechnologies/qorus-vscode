import React, { FunctionComponent } from 'react';
import { GlobalContext } from '../context/global';

// A HoC helper that injects the fields data and functions
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <GlobalContext.Consumer>{fieldsData => <Component {...props} {...fieldsData} />}</GlobalContext.Consumer>
    );

    return EnhancedComponent;
};
