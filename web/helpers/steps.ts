import isArray from 'lodash/isArray';

export const transformSteps: (
    steps: string[],
    stepsData: { [key: string]: any },
    id?: number,
    deep?: boolean
) => { steps: number[]; stepsData: { [key: number]: any } } | number[] = (steps, stepsData, id = 0, deep) => {
    const result: number[] = [];

    steps.forEach(step => {
        if (isArray(step)) {
            result.push(transformSteps(step, stepsData, id + 1000, true));
            id += 1000;
        } else {
            id += deep ? 1 : 1000;
            result.push(id);
            stepsData[id] = stepsData[step];
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
