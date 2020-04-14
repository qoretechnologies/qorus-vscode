import React, { FunctionComponent, useEffect, useState } from 'react';

import { isArray, reduce } from 'lodash';
import size from 'lodash/size';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';

import { Messages } from '../constants/messages';
import { processSteps } from '../containers/InterfaceCreator/workflowsView';
import { StepsContext } from '../context/steps';
import { transformSteps } from '../helpers/steps';
import WorkflowStepDependencyParser from '../helpers/StepDependencyParser';
import withFieldsConsumer from './withFieldsConsumer';
import withMessageHandler from './withMessageHandler';

const stepsParser = new WorkflowStepDependencyParser();

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = ({ initialSteps, ...props }: any) => {
        const [showSteps, setShowSteps] = useState<boolean>(false);
        const [steps, setSteps] = useState<any[]>(initialSteps);
        const [stepsData, setStepsData] = useState(props.initialStepsData);
        const [parsedSteps, setParsedSteps] = useState<any[]>(stepsParser.processSteps(props.initialSteps));
        const [highlightedSteps, setHighlightedSteps] = useState<{ level: number; groupId: string }>(null);
        const [highlightedStepGroupIds, setHighlightedStepGroupIds] = useState<number[]>(null);
        const [lastStepId, setLastStepId] = useState<number>(1);

        const resetSteps = () => {
            setShowSteps(false);
            setSteps([]);
            setStepsData([]);
            setParsedSteps([]);
            setHighlightedSteps(null);
            setHighlightedStepGroupIds(null);
            setLastStepId(1);
        };

        useMount(() => {
            if (initialSteps) {
                props.postMessage(Messages.GET_CONFIG_ITEMS, {
                    iface_kind: 'workflow',
                    iface_id: props.workflow?.iface_id || props.interfaceId.workflow,
                    steps: processSteps(initialSteps, props.initialStepsData),
                });
                setSteps(initialSteps);
                setStepsData(props.initialStepsData);
                setParsedSteps(stepsParser.processSteps(initialSteps));
            }
        });

        useEffect(() => {
            props.postMessage(Messages.GET_CONFIG_ITEMS, {
                iface_kind: 'workflow',
                iface_id: props.workflow?.iface_id || props.interfaceId.workflow,
                steps: processSteps(steps, stepsData),
            });
        }, [steps]);

        const insertNewStep: (
            stepId: number,
            targetStep: number,
            steps: (number | number[])[],
            before?: boolean,
            parallel?: boolean
        ) => any[] = (stepId, targetStep, steps, before, parallel) => {
            const newSteps: (number | number[])[] = [];
            // Build the new steps
            steps.forEach((step: number | number[]): void => {
                // Check if the step is the needed step
                if (step === targetStep) {
                    // Check if we should add this step before, or
                    // after the target step
                    if (before) {
                        // Check if this step is parallel
                        if (parallel) {
                            newSteps.push([stepId, step]);
                        } else {
                            newSteps.push(stepId);
                            newSteps.push(step);
                        }
                    } else {
                        // Check if this step is parallel
                        if (parallel) {
                            newSteps.push([step, stepId]);
                        } else {
                            newSteps.push(step);
                            newSteps.push(stepId);
                        }
                    }
                }
                // Check if this is a list of steps
                else if (isArray(step)) {
                    // Push the recurse
                    newSteps.push(insertNewStep(stepId, targetStep, step, before, parallel));
                }
                // Else push the step back
                else {
                    newSteps.push(step);
                }
            });
            // Save the steps
            return newSteps;
        };

        const removeStep: (stepId: number, steps: any[]) => any[] = (stepId, steps) => {
            const newSteps: (number | number[])[] = [];
            if (isArray(steps)) {
                // Build the new steps
                steps.forEach((step: number | number[]): void => {
                    if (isArray(step)) {
                        // Push the recurse
                        newSteps.push(removeStep(stepId, step));
                    }
                    // Else push the step back
                    else if (step !== stepId) {
                        newSteps.push(step);
                    }
                });
            } else {
                return filterEmptySteps(steps);
            }
            // Save the steps
            return filterEmptySteps(newSteps);
        };

        const filterEmptySteps = steps => {
            const newSteps = [];
            if (isArray(steps)) {
                steps.forEach(step => {
                    if (isArray(step)) {
                        if (size(step)) {
                            newSteps.push(filterEmptySteps(size(step) === 1 ? step[0] : step));
                        }
                    } else if (step) {
                        newSteps.push(step);
                    }
                });
            } else {
                return steps;
            }
            return newSteps;
        };

        const handleStepUpdate: (stepId: number, data: any) => void = (stepId, data) => {
            setStepsData(current => {
                current[stepId] = data;

                return current;
            });
        };

        const handleStepInsert = (data: any, targetStep: number, before?: boolean, parallel?: boolean) => {
            // Set new stepid
            setLastStepId((current: number) => {
                const stepId = current + 10;

                setSteps(current => {
                    let steps;
                    // If target step is not defined, simply
                    // push the step at the end of the list
                    if (!targetStep) {
                        if (before) {
                            steps = [stepId, ...current];
                        } else {
                            steps = [...current, stepId];
                        }
                    } else {
                        steps = insertNewStep(stepId, targetStep, current, before, parallel);
                    }
                    setParsedSteps(stepsParser.processSteps(steps));
                    return steps;
                });
                setStepsData(current => ({
                    ...current,
                    [stepId]: data,
                }));

                return stepId;
            });
        };

        const handleStepRemove = (stepId: number) => {
            setSteps(current => {
                const steps = removeStep(stepId, current);

                setParsedSteps(() => {
                    setStepsData(current => {
                        const stepsdata = reduce(
                            current,
                            (newStepsData, item, key) =>
                                parseInt(key, 10) === stepId
                                    ? newStepsData
                                    : {
                                          ...newStepsData,
                                          [key]: item,
                                      },
                            {}
                        );

                        return stepsdata;
                    });

                    return stepsParser.processSteps(steps);
                });

                return steps;
            });
        };

        return (
            <StepsContext.Provider
                value={{
                    showSteps,
                    setShowSteps,
                    steps,
                    setSteps,
                    setHighlightedSteps,
                    highlightedSteps,
                    highlightedStepGroupIds,
                    setHighlightedStepGroupIds,
                    handleStepInsert,
                    handleStepRemove,
                    handleStepUpdate,
                    parsedSteps,
                    stepsData,
                    resetSteps,
                }}
            >
                <Component {...props} />
            </StepsContext.Provider>
        );
    };

    return compose(
        mapProps(({ workflow, ...rest }) => ({
            initialSteps: (workflow && transformSteps(workflow.steps, workflow['steps-info']).steps) || [],
            initialStepsData: (workflow && transformSteps(workflow.steps, workflow['steps-info']).stepsData) || {},
            workflow,
            ...rest,
        })),
        withFieldsConsumer(),
        withMessageHandler()
    )(EnhancedComponent);
};
