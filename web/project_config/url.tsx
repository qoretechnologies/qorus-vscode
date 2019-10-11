import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import { Icon, Button, ButtonGroup, Classes } from '@blueprintjs/core';
import withTextContext from '../hocomponents/withTextContext';

export interface IQorusUrlProps {
    name: string;
    url: string;
    onDelete: (envId: number, instanceId: number, name: string) => void;
    instanceId: number;
    envId: number;
    id: number;
}

const StyledUrl = styled.div`
    width: 100%;
    border-radius: 3px;
    height: 35px;
    line-height: 35px;
    margin-bottom: 5px;
    transition: all 0.2s linear;

    .bp3-icon {
        opacity: 0.7;
    }

    .button-wrapper {
        margin-top: 3px;
    }
`;

const QorusUrl: FunctionComponent<IQorusUrlProps> = ({ name, url, instanceId, onDelete, envId, id }) => (
    <StyledUrl>
        {id + 1}. {name}
        <span className={Classes.TEXT_MUTED}>
            {' '}
            <a href={url}>[{url}]</a>
        </span>
        <div className="button-wrapper pull-right">
            <ButtonGroup minimal>
                <Button icon="trash" small onClick={() => onDelete(envId, instanceId, name)} />
            </ButtonGroup>
        </div>
    </StyledUrl>
);

export default QorusUrl;
