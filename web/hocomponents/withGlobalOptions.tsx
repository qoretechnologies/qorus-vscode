import React from 'react';
import { GlobalContext } from '../context/global';
import compose from 'recompose/compose';
import withStepsConsumer from './withStepsConsumer';
import withFieldsConsumer from './withFieldsConsumer';
import withMethodsConsumer from './withMethodsConsumer';
import withFunctionsConsumer from './withFunctionsConsumer';
import withMapperConsumer from './withMapperConsumer';

// A HoC helper that holds all the state for interface creations
export default () => (Component: any): any => {
    const EnhancedComponent = (props: any) => {
        const handleInterfaceReset: (type: string) => void = type => {
            // Reset the initial data
            props.resetInterfaceData(type);
            // Reset fields
            props.resetFields(type);
            // Switch based on the type of interface
            switch (type) {
                case 'workflow':
                    // Reset steps
                    props.resetSteps();
                    break;
                case 'service':
                    // Reset methods
                    props.resetMethods();
                    break;
                case 'mapper-code':
                    // Reset mapper methods
                    props.resetMapperMethods();
                    break;
                case 'mapper':
                    // Reset mapper
                    props.resetMapper();
                    break;
                default:
                    break;
            }
        };

        return (
            <GlobalContext.Provider
                value={{
                    resetAllInterfaceData: handleInterfaceReset,
                }}
            >
                <Component {...props} />
            </GlobalContext.Provider>
        );
    };

    return compose(
        withFieldsConsumer(),
        withStepsConsumer(),
        withMethodsConsumer(),
        withFunctionsConsumer(),
        withMapperConsumer()
    )(EnhancedComponent);
};
