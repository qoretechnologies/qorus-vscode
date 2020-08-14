import React, { FunctionComponent, useEffect, useRef, useState } from 'react';

import { size } from 'lodash';
import mapProps from 'recompose/mapProps';

import { MethodsContext } from '../context/methods';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const isInitialMount = useRef(true);
        const [showMethods, setShowMethods] = useState<boolean>(false);
        const [methods, setMethods] = useState<any[]>(props.initialMethods);
        const [methodsCount, setMethodsCount] = useState<number>(props.initialCount);
        const [lastMethodId, setLastMethodId] = useState<number>(props.initialId);
        const [activeMethod, setActiveMethod] = useState<any>(1);

        const resetMethods = () => {
            setShowMethods(false);
            setMethods(props.initialMethods);
            setMethodsCount(props.initialCount);
            setLastMethodId(props.initialId);
            setActiveMethod(1);
        };

        useEffect(() => {
            // Some kind of hack to force this function
            // to work like componentDidUpdate instead
            if (isInitialMount.current) {
                isInitialMount.current = false;
            } else {
                // When methods count changes
                // switch to the newest method
                setActiveMethod(methods[methods.length - 1].id);
            }
        }, [methodsCount]);

        const handleAddMethodClick: () => void = () => {
            // Add new method id
            setLastMethodId((current) => current + 1);
            setMethods((current: any[]) => [...current, { id: lastMethodId + 1 }]);
            setMethodsCount((current: number) => current + 1);
        };

        return (
            <MethodsContext.Provider
                value={{
                    showMethods,
                    setShowMethods,
                    methods,
                    handleAddMethodClick,
                    methodsCount,
                    activeMethod,
                    setActiveMethod,
                    setMethods,
                    setMethodsCount,
                    methodsData: props.methodsData,
                    resetMethods,
                    lastMethodId,
                    initialActiveMethod: props.initialActiveId,
                    initialShowMethods: props.initialShowMethods,
                }}
            >
                <Component {...props} />
            </MethodsContext.Provider>
        );
    };

    return mapProps(({ service, ...rest }) => ({
        initialMethods:
            service && service.methods
                ? service.methods.map((method, i) => ({ name: method.name, id: i + 1 }))
                : [{ id: 1, name: 'init' }],
        initialCount: service && service.methods ? size(service.methods) : 1,
        // Set the last method ID to the methods
        // count + 1 if methods exist
        initialId: service && service.methods ? size(service.methods) : 1,
        // If method is being edited, switch to it
        initialActiveId: (service && service.active_method) || 1,
        // Set to show methods if active method
        // is being edited
        initialShowMethods: !!(service && service.active_method),
        // Map the ids to the current method data
        // to know which method belongs to which id
        // in the method selector
        methodsData:
            service && service.methods
                ? service.methods.map((method, i) => ({ ...method, id: i + 1 }))
                : [{ id: 1, name: 'init' }],
        service,
        ...rest,
    }))(EnhancedComponent);
};
