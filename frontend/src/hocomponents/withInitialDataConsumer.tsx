import React, { FunctionComponent } from 'react';
import { InitialContext } from '../context/init';

// A HoC helper that injects the initialData
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <InitialContext.Consumer>
            {initialData => <Component initialData={initialData} {...props} />}
        </InitialContext.Consumer>
    );

    return EnhancedComponent;
};
