import React, { FunctionComponent } from 'react';
import { IQorusInstance } from './ProjectConfig';
import styled from 'styled-components';
import { Icon, Button, ButtonGroup, Classes } from '@blueprintjs/core';

export interface IQorusInstanceProps extends IQorusInstance {
    onDataChange: (name: string, url?: string) => void;
}

const StyledInstanceWrapper = styled.div`
    width: 100%;
    background-color: #f1f1f1;
    padding: 0 10px;
    border-radius: 3px;
    cursor: pointer;
    height: 35px;
    line-height: 35px;
    margin-bottom: 10px;

    &:hover {
        background-color: #e7e7e7;

        .bp3-icon {
            opacity: 0.7;
        }
    }

    .bp3-icon {
        opacity: 0.4;
    }

    .button-wrapper {
        margin-top: 3px;
    }
`;

const QorusInstance: FunctionComponent<IQorusInstanceProps> = ({ name, url, id, urls }) => {
    return (
        <StyledInstanceWrapper>
            <Icon icon="dot" /> {name}
            <span className={Classes.TEXT_MUTED}> [{url}]</span>
            <div className="button-wrapper pull-right">
                <ButtonGroup minimal>
                    <Button icon="chevron-down" small />
                    <Button icon="edit" small />
                    <Button icon="trash" small />
                </ButtonGroup>
            </div>
        </StyledInstanceWrapper>
    );
};

export default QorusInstance;
