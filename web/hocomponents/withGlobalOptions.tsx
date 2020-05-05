import React, { useState } from 'react';
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
        const [typeReset, setTypeReset] = useState(null);

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
                    if (!soft) {
                        // Reset fields
                        props.resetFields('service-methods');
                        // Reset methods
                        props.resetMethods();
                    }
                    break;
                case 'service-methods':
                    // Reset everything if not soft reset
                    if (!soft) {
                        props.resetInterfaceData('service');
                        props.resetFields('service');
                    }
                    // Reset methods
                    props.resetMethods();
                    break;
                case 'mapper-methods':
                    // Reset everything if not soft reset
                    if (!soft) {
                        props.resetInterfaceData('mapper-code');
                        props.resetFields('mapper-code');
                    }
                    // Reset methods
                    props.resetMapperMethods();
                    break;
                case 'mapper':
                    // Reset mapper
                    props.resetMapper();
                    break;
                case 'type':
                    // Reset type
                    typeReset && typeReset();
                    break;
                default:
                    break;
            }
        };

        return (
            <GlobalContext.Provider
                value={{
                    resetAllInterfaceData: handleInterfaceReset,
                    setTypeReset,
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
