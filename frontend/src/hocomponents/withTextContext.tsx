import React, { FunctionComponent } from 'react';
import { TextContext } from '../context/text';

// A HoC helper that injects the text function
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => (
        <TextContext.Consumer>{t => <Component {...props} t={t} />}</TextContext.Consumer>
    );

    return EnhancedComponent;
};
