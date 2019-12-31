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
        const handleInterfaceReset: (type: string, soft?: boolean) => void = (type, soft) => {
            // Reset the initial data
            if (!soft) {
                props.resetInterfaceData(type);
            }
            // Reset fields
            props.resetFields(type);
            // Switch based on the type of interface
            switch (type) {
                case 'workflow':
                case 'steps':
                    // Reset steps
                    props.resetSteps();
                    break;
                case 'service':
                    // Reset the initial data
                    if (!soft) {
                        props.resetInterfaceData('service-methods');
                    }
                    // Reset fields
                    props.resetFields('service-methods');
                    // Reset methods
                    props.resetMethods();
                    break;
                case 'service-methods':
                    // Reset the initial data
                    if (!soft) {
                        props.resetInterfaceData('service');
                    }
                    // Reset fields
                    props.resetFields('service');
                    // Reset methods
                    props.resetMethods();
                    break;
                case 'mapper-methods':
                    // Reset the initial data
                    if (!soft) {
                        props.resetInterfaceData('mapper-code');
                    }
                    // Reset fields
                    props.resetFields('mapper-code');
                    // Reset methods
                    props.resetMapperMethods();
                    break;
                case 'mapper-code':
                    // Reset the initial data
                    if (!soft) {
                        props.resetInterfaceData('mapper-methods');
                    }
                    // Reset fields
                    props.resetFields('mapper-methods');
                    // Reset methods
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
