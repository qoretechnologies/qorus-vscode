import React, { FunctionComponent } from 'react';
import { MapperContext } from '../context/mapper';

// A HoC helper that injects the fields data and functions
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <MapperContext.Consumer>{fieldsData => <Component {...props} {...fieldsData} />}</MapperContext.Consumer>
    );

    return EnhancedComponent;
};
