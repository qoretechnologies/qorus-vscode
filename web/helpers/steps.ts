import isArray from 'lodash/isArray';

export const transformSteps: (
    steps: string[],
    stepsData: { [key: string]: any },
    level?: number,
    deep?: boolean
) => { steps: number[]; stepsData: { [key: number]: any } } | number[] = (steps, stepsData, level = 0, deep) => {
    let id = 0;
    let listId = 0;
    const result: number[] = [];
    const newStepsData = { ...stepsData };

    steps.forEach(step => {
        if (isArray(step)) {
            listId += 1;
            result.push(transformSteps(step, stepsData, parseInt(`${level + 1}${listId}`), true));
        } else {
            id += 1;
            const stepId = parseInt(`${level}${id}`);
            result.push(stepId);
            stepsData[stepId] = stepsData[step];
        }
    });

    if (!deep) {
        return {
            steps: result,
            stepsData,
        };
    } else {
        return result;
    }
};
