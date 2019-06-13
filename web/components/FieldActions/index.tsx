import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { ButtonGroup, Button, Tooltip } from '@blueprintjs/core';

const StyledFieldLabel = styled.div`
    padding: 0px 0 0 10px;
    flex: 0 1 auto;
    min-width: 80px;
`;

const FieldLabelControls = styled.div`
    float: right;
`;

export interface IFieldActions {
    desc: string;
    name: string;
    onClick: (name: string) => any;
    removable: boolean;
}

const FieldActions: FunctionComponent<IFieldActions> = ({ desc, name, onClick, removable }) => (
    <StyledFieldLabel>
        <FieldLabelControls>
            <ButtonGroup minimal>
                <Tooltip content={desc}>
                    <Button icon={'info-sign'} />
                </Tooltip>
                <Button icon={'trash'} disabled={!removable} onClick={() => onClick && onClick(name)} />
            </ButtonGroup>
        </FieldLabelControls>
    </StyledFieldLabel>
);

export default FieldActions;
