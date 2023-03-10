import { map, size } from 'lodash';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import mapProps from 'recompose/mapProps';
import { FunctionsContext } from '../context/functions';
import { getNameFromFields } from './withMethods';

// A HoC helper that holds all the state for interface creations
export default () =>
  (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
      const isInitialMount = useRef(true);
      const [showFunctions, setShowFunctions] = useState<boolean>(false);
      const [functions, setFunctions] = useState<any[]>(props.initialFunctions);
      const [functionsCount, setFunctionsCount] = useState<number>(props.initialFunctionsCount);
      const [lastFunctionId, setLastFunctionId] = useState<number>(props.initialFunctionId);
      const [activeFunction, setActiveFunction] = useState<any>(1);
      const [functionsData, setFunctionsData] = useState(props.functionsData);

      /*
      "Reset the mapper methods."
      */
      const resetMapperMethods = () => {
        setShowFunctions(false);
        setFunctions([{ id: 1 }]);
        setFunctionsCount(1);
        setLastFunctionId(1);
        setActiveFunction(null);
      };

      /*
      "Set the functions from the draft."
      */
      const setFunctionsFromDraft = (funcs) => {
        const funcsList = map(funcs, (methodFields, methodId) => ({
          name: getNameFromFields(methodFields, methodId),
          id: methodId,
        }));
        setShowFunctions(false);
        setFunctions(funcsList);
        setFunctionsData(funcsList);
        setFunctionsCount(size(funcs));
        setActiveFunction(funcsList[0]?.id || 1);
      };

      useEffect(() => {
        // Some kind of hack to force this function
        // to work like componentDidUpdate instead
        if (isInitialMount.current) {
          isInitialMount.current = false;
        } else {
          // When function count changes
          // switch to the newest function
          setActiveFunction(functions[functions.length - 1]?.id || 0);
        }
      }, [functionsCount]);

      /*
      The `handleAddFunctionClick` function is called when the user clicks the
      `Add Function` button. It adds a new function to the `functions` array and
      increments the `functionsCount` variable.
      */
      const handleAddFunctionClick: () => void = () => {
        setLastFunctionId((current) => current + 1);
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
            functionsData,
            resetMapperMethods,
            setFunctionsFromDraft,
            initialActiveFunction: props.initialFunctionId,
            initialShowFunctions: props.initialShowFunctions,
            lastFunctionId,
          }}
        >
          <Component {...props} />
        </FunctionsContext.Provider>
      );
    };

    return mapProps(({ 'mapper-code': mapperCode, ...rest }) => ({
      initialFunctions:
        mapperCode && mapperCode['mapper-methods']
          ? mapperCode['mapper-methods'].map((fun, i) => ({ name: fun.name, id: i + 1 }))
          : [{ id: 1 }],
      initialFunctionsCount:
        mapperCode && mapperCode['mapper-methods'] ? size(mapperCode['mapper-methods']) : 1,
      // Set the last function ID to the functions
      // count + 1 if functions exist
      initialFunctionId:
        mapperCode && mapperCode['mapper-methods'] ? size(mapperCode['mapper-methods']) : 1,
      // If function is being edited, switch to it
      initialActiveFunctionId: (mapperCode && mapperCode.active_method) || 1,
      // Set to show functions if active function
      // is being edited
      initialShowFunctions: !!(mapperCode && mapperCode.active_method),
      // Map the ids to the current function data
      // to know which function belongs to which id
      // in the function selector
      functionsData:
        mapperCode &&
        mapperCode['mapper-methods'] &&
        mapperCode['mapper-methods'].map((fun, i) => ({ ...fun, id: i + 1 })),
      mapperCode,
      ...rest,
    }))(EnhancedComponent);
  };
