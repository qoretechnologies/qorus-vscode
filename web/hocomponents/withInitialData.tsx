import React, { FunctionComponent, useState } from 'react';

import set from 'lodash/set';
import useMount from 'react-use/lib/useMount';
import shortid from 'shortid';

import { Messages } from '../constants/messages';
import { InitialContext } from '../context/init';

// A HoC helper that holds all the initial data
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [initialData, setInitialData] = useState<any>({
            tab: 'ProjectConfig',
        });
        const [confirmDialog, setConfirmDialog] = useState<{ isOpen: boolean; onSubmit: () => any; text: string }>({});

        useMount(() => {
            props.addMessageListener(Messages.RETURN_INITIAL_DATA, ({ data }) => {
                setInitialData(null);

                if (!data.tab) {
                    data.tab = 'ProjectConfig';
                }

                setInitialData(current => ({
                    ...current,
                    ...data,
                }));
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

        const confirmAction: (text: string, action: () => any) => void = (text, action) => {
            setConfirmDialog({
                isOpen: true,
                text,
                onSubmit: action,
            });
        };

        const changeTab: (tab: string, subtab?: string) => void = (tab, subtab) => {
            setInitialData(current => ({
                ...current,
                tab,
                subtab: subtab || null,
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

        const setActiveInstance: (inst: any) => void = inst => {
            setInitialData(current => ({
                ...current,
                qorus_instance: inst,
            }));
        };

        const changeInitialData: (path: string, value: any) => any = (path, value) => {
            setInitialData(current => {
                const result = { ...current };
                set(result, path, value);
                return result;
            });
        };

        const fetchData: (url: string, method: string) => Promise<any> = async (url, method = 'GET') => {
            // Create the unique ID for this request
            const uniqueId: string = shortid.generate();

            return new Promise((resolve, reject) => {
                // Create a timeout that will reject the request
                // after 2 minutes
                let timeout: NodeJS.Timer | null = setTimeout(() => {
                    reject({
                        error: true,
                        msg: 'Request timed out',
                    });
                }, 120000);
                // Watch for the request to complete
                // if the ID matches then resolve
                const listener = props.addMessageListener('fetch-data-complete', data => {
                    if (data.id === uniqueId) {
                        clearTimeout(timeout);
                        timeout = null;
                        resolve(data);
                        //* Remove the listener after the call is done
                        listener();
                    }
                });
                // Fetch the data
                props.postMessage('fetch-data', {
                    id: uniqueId,
                    url,
                    method,
                });
            });
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
                    setActiveInstance,
                    fetchData,
                    changeInitialData,
                    confirmDialog,
                    setConfirmDialog,
                    confirmAction,
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
