import React, { FunctionComponent } from 'react';
import { FieldContext } from '../context/fields';

// A HoC helper that injects the fields data and functions
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <FieldContext.Consumer>{fieldsData => <Component {...props} {...fieldsData} />}</FieldContext.Consumer>
    );

    return EnhancedComponent;
};
