import React, { FunctionComponent } from 'react';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import StepDiagram from '../../components/Diagram';

export interface IStepsCreator {
    targetDir: string;
    t: TTranslator;
    initialData: any;
}

const StepsCreator: FunctionComponent<IStepsCreator> = ({ t, initialData, highlightedGroupSteps, steps }) => {
    console.log(steps);
    return (
        <div style={{ width: '100%', display: 'flex', flex: '1 1 auto' }}>
            <StepDiagram highlightedGroupSteps={highlightedGroupSteps} steps={steps} />
        </div>
    );
};

export default compose(
    withTextContext(),
    withInitialDataConsumer()
)(StepsCreator);
