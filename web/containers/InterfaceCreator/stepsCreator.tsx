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

const StepsCreator: FunctionComponent<IStepsCreator> = ({ t, initialData }) => (
    <div style={{ width: '100%', display: 'flex', flex: '1 1 auto' }}>
        <StepDiagram
            steps={{
                10: [],
                20: [10],
                30: [20],
                40: [30],
                50: [40],
                60: [40],
                110: [30],
            }}
        />
    </div>
);

export default compose(
    withTextContext(),
    withInitialDataConsumer()
)(StepsCreator);
