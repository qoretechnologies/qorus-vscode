import React, { FunctionComponent, useState } from 'react';
import { InitialContext } from '../context/init';
import useMount from 'react-use/lib/useMount';
import { Messages } from '../constants/messages';

// A HoC helper that holds all the initial data
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [initialData, setInitialData] = useState<any>({
            tab: 'CreateInterface',
            active_method: 2,
            service: {
                name: 'test',
                target_dir: 'test',
                version: '1.0',
                desc: 'test',
                lang: 'java',
                class_name: 'Test',
                base_class_name: 'muhaha',
                target_file: 'this_file_lol',
                author: [{ name: 'filip' }, { name: 'filipek' }],
                autostart: true,
                methods: [
                    {
                        name: 'test method',
                        desc: 'lol',
                    },
                    {
                        name: 'test method 2',
                        desc: 'lol',
                    },
                ],
            },
        });

        useMount(() => {
            props.addMessageListener(Messages.RETURN_INITIAL_DATA, data => {
                setInitialData(data);
            });

            props.postMessage(Messages.GET_INITIAL_DATA);
        });

        const changeTab: (tab: string, subtab?: string) => void = (tab, subtab) => {
            setInitialData(current => ({
                ...current,
                tab,
                subtab: subtab || current.subtab,
            }));
        };

        return (
            <InitialContext.Provider
                value={{
                    ...initialData,
                    changeTab,
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
