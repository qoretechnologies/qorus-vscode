import React, { useState, useContext } from 'react';
import { GlobalContext } from '../context/global';
import compose from 'recompose/compose';
import withStepsConsumer from './withStepsConsumer';
import withFieldsConsumer from './withFieldsConsumer';
import withMethodsConsumer from './withMethodsConsumer';
import withFunctionsConsumer from './withFunctionsConsumer';
import withMapperConsumer from './withMapperConsumer';
import useMount from 'react-use/lib/useMount';
import { Messages } from '../constants/messages';
import withMessageHandler from './withMessageHandler';
import { InitialContext } from '../context/init';

// A HoC helper that holds all the state for interface creations
export default () => (Component: any): any => {
    const EnhancedComponent = (props: any) => {
        const [typeReset, setTypeReset] = useState(null);
        const [fsmReset, setFsmReset] = useState(null);
        const [pipelineReset, setPipelineReset] = useState(null);
        const initialData = useContext(InitialContext);

        useMount(() => {
            const recreateListener = props.addMessageListener(Messages.MAYBE_RECREATE_INTERFACE, (dt) => {
                console.log(dt);
                initialData.confirmAction(
                    dt.message,
                    () => true,
                    'Recreate',
                    undefined,
                    () => {}
                );
            });

            return () => {
                recreateListener();
            };
        });

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
                    props.resetInterfaceData('type');
                    break;
                case 'fsm':
                    props.resetInterfaceData('fsm');
                    fsmReset && fsmReset();
                case 'pipeline':
                    props.resetInterfaceData('pipeline');
                    pipelineReset && pipelineReset(true);
                default:
                    break;
            }
        };

        return (
            <GlobalContext.Provider
                value={{
                    resetAllInterfaceData: handleInterfaceReset,
                    setTypeReset,
                    setFsmReset,
                    setPipelineReset,
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
        withMapperConsumer(),
        withMessageHandler()
    )(EnhancedComponent);
};
