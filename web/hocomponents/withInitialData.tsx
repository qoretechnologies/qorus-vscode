import React, { FunctionComponent, useState } from 'react';
import { InitialContext } from '../context/init';
import useMount from 'react-use/lib/useMount';
import { Messages } from '../constants/messages';
import omit from 'lodash/omit';

// A HoC helper that holds all the initial data
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [initialData, setInitialData] = useState<any>({
            tab: 'ProjectConfig',
        });

        useMount(() => {
            props.addMessageListener(Messages.RETURN_INITIAL_DATA, ({ data }) => {
                setInitialData(null);

                if (!data.tab) {
                    data.tab = 'ProjectConfig';
                }

                /*data.tab = 'CreateInterface';
                data.subtab = 'workflow';
                data.workflow = {
                    steps: ['test-step:1.0', ['test-step2:1.0', 'test-step3:1.0']],
                    stepsInfo: {
                        'test-step:1.0': {
                            name: 'test-step:1.0',
                            type: 'normal-step',
                        },
                        'test-step2:1.0': {
                            name: 'test-step2:1.0',
                            type: 'normal-step',
                        },
                        'test-step3:1.0': {
                            name: 'test-step3:1.0',
                            type: 'normal-step',
                        },
                    },
                };*/

                setInitialData(data);
            });

            props.addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
                // Only set initial data if we are
                // switching tabs
                if (data.tab) {
                    setInitialData(current => ({
                        ...current,
                        ...data,
                    }));
                }
            });

            props.postMessage(Messages.GET_INITIAL_DATA);
        });

        const changeTab: (tab: string, subtab?: string) => void = (tab, subtab) => {
            setInitialData(current => ({
                tab,
                subtab: subtab || current.subtab,
            }));
        };

        const setStepSubmitCallback: (callback: () => any) => void = (callback): void => {
            setInitialData(current => ({
                ...current,
                stepCallback: callback,
            }));
        };

        const resetInterfaceData: (iface: string) => void = iface => {
            setInitialData(current => ({
                ...current,
                [iface]: null,
            }));
        };

        if (!initialData) {
            return null;
        }

        return (
            <InitialContext.Provider
                value={{
                    ...initialData,
                    changeTab,
                    setStepSubmitCallback,
                    resetInterfaceData,
                }}
            >
                <InitialContext.Consumer>
                    {initialProps => <Component {...initialProps} {...props} />}
                </InitialContext.Consumer>
            </InitialContext.Provider>
        );
    };

    return EnhancedComponent;
};
