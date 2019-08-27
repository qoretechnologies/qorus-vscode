import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { isArray } from 'lodash';

const StepList: FunctionComponent = ({ steps }) =>
    steps.map(step => (
        <div style={{ marginLeft: '20px' }}>{isArray(step) ? <StepList steps={step} /> : <p>Step {step}</p>}</div>
    ));

export default StepList;
