import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import mapProps from 'recompose/mapProps';
import { size } from 'lodash';
import { FunctionsContext } from '../context/functions';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const isInitialMount = useRef(true);
        const [showFunctions, setShowFunctions] = useState<boolean>(props.initialShowFunctions);
        const [functions, setFunctions] = useState<any[]>(props.initialFunctions);
        const [functionsCount, setFunctionsCount] = useState<number>(props.initialFunctionsCount);
        const [lastFunctionId, setLastFunctionId] = useState<number>(props.initialFunctionId);
        const [activeFunction, setActiveFunction] = useState<any>(props.initialActiveFunctionId || null);

        useEffect(() => {
            // Some kind of hack to force this function
            // to work like componentDidUpdate instead
            if (isInitialMount.current) {
                isInitialMount.current = false;
            } else {
                // When function count changes
                // switch to the newest function
                setActiveFunction(functions[functions.length - 1].id);
            }
        }, [functionsCount]);

        const handleAddFunctionClick: () => void = () => {
            // Add new function id
            setLastFunctionId(current => current + 1);
            setFunctions((current: any[]) => [...current, { id: lastFunctionId + 1 }]);
            setFunctionsCount((current: number) => current + 1);
        };

        return (
            <FunctionsContext.Provider
                value={{
                    showFunctions,
                    setShowFunctions,
                    functions,
                    handleAddFunctionClick,
                    functionsCount,
                    activeFunction,
                    setActiveFunction,
                    setFunctions,
                    setFunctionsCount,
                    functionsData: props.functionsData,
                }}
            >
                <Component {...props} />
            </FunctionsContext.Provider>
        );
    };

    return mapProps(({ library, ...rest }) => ({
        initialFunctions:
            library && library.function
                ? library.functions.map((fun, i) => ({ name: fun.name, id: i + 1 }))
                : [{ id: 1 }],
        initialFunctionsCount: library && library.functions ? size(library.functions) : 1,
        // Set the last function ID to the functions
        // count + 1 if functions exist
        initialFunctionId: library && library.functions ? size(library.functions) : 1,
        // If function is being edited, switch to it
        initialActiveFunctionId: (library && library.active_function) || null,
        // Set to show functions if active function
        // is being edited
        initialShowFunctions: !!(library && library.active_function),
        // Map the ids to the current function data
        // to know which function belongs to which id
        // in the function selector
        functionsData: library && library.functions && library.functions.map((fun, i) => ({ ...fun, id: i + 1 })),
        library,
        ...rest,
    }))(EnhancedComponent);
};
