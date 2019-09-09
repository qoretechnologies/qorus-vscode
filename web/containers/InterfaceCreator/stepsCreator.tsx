import React, { FunctionComponent } from 'react';
import compose from 'recompose/compose';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import StepDiagram from '../../components/Diagram';
import { NonIdealState } from '@blueprintjs/core';
import { size } from 'lodash';

export interface IStepsCreator {
    targetDir: string;
    t: TTranslator;
    initialData: any;
}

const StepsCreator: FunctionComponent<IStepsCreator> = ({
    t,
    initialData,
    highlightedGroupSteps,
    steps,
    stepsData,
}) => {
    return size(steps) ? (
        <div style={{ width: '100%', display: 'flex', flex: '1 1 auto' }}>
            <StepDiagram highlightedGroupSteps={highlightedGroupSteps} steps={steps} stepsData={stepsData} />
        </div>
    ) : (
        <NonIdealState title={t('DiagramIsEmpty')} description={t('DiagramEmptyDescription')} icon="diagram-tree" />
    );
};

export default compose(
    withTextContext(),
    withInitialDataConsumer(),
    onlyUpdateForKeys(['steps', 'stepsData', 'highlightedGroupSteps', 't'])
)(StepsCreator);
