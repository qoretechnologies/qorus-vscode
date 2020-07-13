import React, { useState } from 'react';

import styled from 'styled-components';

import {
    Button,
    ButtonGroup
} from '@blueprintjs/core';

const StyledTutorialWrapper = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 9999;
`;

const getElementData = (id: string) => {
    return document.querySelector(`#${id}`).getBoundingClientRect();
};

const Tutorial = ({ data }) => {
    const [activeStep, setActiveStep] = useState<number>(0);

    const { top, left, width, height } = getElementData(data.elements[activeStep].id);

    return (
        <StyledTutorialWrapper>
            <ButtonGroup style={{ position: 'absolute', top: 50, left: '50%' }}>
                <Button icon="arrow-left" onClick={() => setActiveStep(activeStep - 1)} />
                <Button icon="arrow-right" onClick={() => setActiveStep(activeStep + 1)} />
            </ButtonGroup>
            <div
                style={{
                    position: 'absolute',
                    top: `${top + height / 2}px`,
                    left: `${left + width / 2}px`,
                    width: 200,
                    minHeight: 50,
                    border: '1px solid red',
                    backgroundColor: '#fefefe',
                    padding: '20px',
                }}
            >
                {data.elements[activeStep].text}
            </div>
        </StyledTutorialWrapper>
    );
};

export default Tutorial;
