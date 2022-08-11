import React, { FunctionComponent, useContext } from 'react';

import styled from 'styled-components';

import { Button, ButtonGroup, Classes } from '@blueprintjs/core';

import { InitialContext } from '../context/init';

export interface IQorusUrlProps {
    name: string;
    url: string;
    safe_url: string;
    onDelete: (envId: number, instanceId: number, name: string) => void;
    instanceId: number;
    envId: number;
    id: number;
}

const StyledUrl = styled.div`
    width: 100%;
    border-radius: 3px;
    min-height: 35px;
    overflow: hidden;
    word-break: break-all;
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

const QorusUrl: FunctionComponent<IQorusUrlProps> = ({ name, url, safe_url, instanceId, onDelete, envId, id }) => {
    const initContext = useContext(InitialContext);

    return (
        <StyledUrl name="other-url-item">
            {id + 1}. {name}
            <span className={Classes.TEXT_MUTED}>
                {' '}
                <a href={url} name="other-url-link">
                    [{safe_url}]
                </a>
            </span>
            <div className="button-wrapper pull-right">
                <ButtonGroup minimal>
                    <Button
                        icon="trash"
                        intent="danger"
                        small
                        name="other-url-delete"
                        onClick={() =>
                            initContext.confirmAction('ConfirmRemoveUrl', () => onDelete(envId, instanceId, name))
                        }
                    />
                </ButtonGroup>
            </div>
        </StyledUrl>
    );
};

export default QorusUrl;
