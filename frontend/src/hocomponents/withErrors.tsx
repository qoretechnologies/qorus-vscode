import { map, size } from 'lodash';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import mapProps from 'recompose/mapProps';
import { ErrorsContext } from '../context/errors';
import { getNameFromFields } from './withMethods';

// A HoC helper that holds all the state for interface creations
export default () =>
  (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
      const isInitialMount = useRef(true);
      const [showErrors, setShowErrors] = useState<boolean>(false);
      const [subErrors, setSubErrors] = useState<any[]>(props.initialErrors);
      const [errorsCount, setErrorsCount] = useState<number>(props.initialErrorsCount);
      const [lastErrorId, setLastErrorId] = useState<number>(props.initialErrorsId);
      const [activeError, setActiveError] = useState<any>(1);
      const [errorsData, setErrorsData] = useState(props.errorsData);

      const resetErrors = () => {
        setShowErrors(false);
        setSubErrors(props.initialErrors);
        setErrorsCount(props.initialErrorsCount);
        setLastErrorId(props.initialErrorsId);
        setActiveError(1);
      };

      const setErrorsFromDraft = (errors) => {
        const errorsList = map(errors, (methodFields, methodId) => ({
          name: getNameFromFields(methodFields, methodId),
          id: methodId,
        }));
        setShowErrors(false);
        setSubErrors(errorsList);
        setErrorsData(errorsList);
        setErrorsCount(size(errors));
        setActiveError(errorsList[0]?.id || 1);
      };

      useEffect(() => {
        // Some kind of hack to force this function
        // to work like componentDidUpdate instead
        if (isInitialMount.current) {
          isInitialMount.current = false;
        } else {
          // When methods count changes
          // switch to the newest method
          setActiveError(subErrors[subErrors.length - 1]?.id || 1);
        }
      }, [errorsCount]);

      const handleAddErrorClick: () => void = () => {
        // Add new method id
        setLastErrorId((current) => current + 1);
        setSubErrors((current: any[]) => [...current, { id: lastErrorId + 1 }]);
        setErrorsCount((current: number) => current + 1);
      };

      return (
        <ErrorsContext.Provider
          value={{
            showErrors,
            setShowErrors,
            subErrors,
            handleAddErrorClick,
            errorsCount,
            activeError,
            setActiveError,
            setSubErrors,
            setErrorsCount,
            errorsData,
            resetErrors,
            lastErrorId,
            initialActiveError: 1,
            setErrorsFromDraft,
          }}
        >
          <Component {...props} />
        </ErrorsContext.Provider>
      );
    };

    return mapProps(({ errors, ...rest }) => ({
      initialErrors:
        errors && errors.errors_errors
          ? errors.errors_errors.map((method, i) => ({ name: method.name, id: i + 1 }))
          : [{ id: 1, name: '' }],
      initialErrorsCount: errors && errors.errors_errors ? size(errors.errors_errors) : 1,
      // Set the last method ID to the methods
      // count + 1 if methods exist
      initialErrorsId: errors && errors.errors_errors ? size(errors.errors_errors) : 1,
      // Map the ids to the current method data
      // to know which method belongs to which id
      // in the method selector
      errorsData:
        errors && errors.errors_errors
          ? errors.errors_errors.map((method, i) => ({ ...method, id: i + 1 }))
          : [{ id: 1, name: '' }],
      errors,
      ...rest,
    }))(EnhancedComponent);
  };
