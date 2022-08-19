import React, { FunctionComponent } from 'react';
import { StepsContext } from '../context/steps';

// A HoC helper that injects the fields data and functions
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <StepsContext.Consumer>{fieldsData => <Component {...props} {...fieldsData} />}</StepsContext.Consumer>
    );

    return EnhancedComponent;
};
