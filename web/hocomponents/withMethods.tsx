import React, { FunctionComponent, useState, useEffect } from 'react';
import { MethodsContext } from '../context/methods';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [showMethods, setShowMethods] = useState<boolean>(false);
        const [methods, setMethods] = useState<any[]>([{ id: 1 }]);
        const [methodsCount, setMethodsCount] = useState<number>(1);
        const [lastMethodId, setLastMethodId] = useState<number>(1);
        const [activeMethod, setActiveMethod] = useState<any>(1);

        useEffect(() => {
            // When methods count changes
            // switch to the newest method
            setActiveMethod(methods[methods.length - 1].id);
        }, [methodsCount]);

        const handleAddMethodClick: () => void = () => {
            // Add new method id
            setLastMethodId(current => current + 1);
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
                }}
            >
                <Component {...props} />
            </MethodsContext.Provider>
        );
    };

    return EnhancedComponent;
};
