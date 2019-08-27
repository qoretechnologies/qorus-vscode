import React, { FunctionComponent, useState, useEffect, useRef } from 'react';
import { StepsContext } from '../context/steps';
import mapProps from 'recompose/mapProps';
import { size } from 'lodash';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [showSteps, setShowSteps] = useState<boolean>(true);
        const [steps, setSteps] = useState<any[]>(props.initialSteps);

        return (
            <StepsContext.Provider
                value={{
                    showSteps,
                    setShowSteps,
                    steps,
                    setSteps,
                }}
            >
                <Component {...props} />
            </StepsContext.Provider>
        );
    };

    return mapProps(({ workflow, ...rest }) => ({
        initialSteps: (workflow && workflow.steps) || [],
        workflow,
        ...rest,
    }))(EnhancedComponent);
};
