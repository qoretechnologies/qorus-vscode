import omit from 'lodash/omit';
import { IPipelineElement } from '../containers/InterfaceCreator/pipeline';

export const transformPipelineData: (
    pipeline: IPipelineElement[],
    level?: number,
    deep?: boolean,
    elementsData?: { [key: string]: any }
) => { pipeline: number[]; elementsData: { [key: number]: any } } | number[] = (
    pipeline,
    level = 0,
    deep,
    elementsData = {}
) => {
    let id = 0;
    let listId = 0;
    const result: number[] = [];

    pipeline.forEach((pl) => {
        if (pl.elements) {
            listId += 1;
            id += 1;
            const tempId = parseInt(`${level}${id}`);
            const r = [];
            r.push(tempId);
            elementsData[tempId] = omit(pl, ['elements']);
            r.push(transformPipelineData(pl.elements, parseInt(`${level + 1}${listId}`), true, elementsData));
            result.push(r);
        } else {
            id += 1;
            const tempId = parseInt(`${level}${id}`);
            result.push(tempId);
            elementsData[tempId] = omit(pl, ['elements']);
        }
    });

    if (!deep) {
        return {
            pipeline: result,
            elementsData,
        };
    } else {
        return result;
    }
};
