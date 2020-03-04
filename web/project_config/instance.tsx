import React, { FunctionComponent, useState } from 'react';
import { IQorusInstance } from './ProjectConfig';
import styled from 'styled-components';
import { Icon, Button, ButtonGroup, Classes } from '@blueprintjs/core';
import Add from './add';
import withTextContext from '../hocomponents/withTextContext';
import QorusUrl from './url';
import { TTranslator } from '../App';
import { StyledSubHeader, StyledNoData } from './environment';

export interface IQorusInstanceProps extends IQorusInstance {
    onDataChange: (instanceId: number, name: string, url?: string) => void;
    onDelete: (id: number) => void;
    onUrlSubmit: (envId: number, instanceId: number, name: string, url: string, isOtherUrl: boolean) => void;
    onUrlDelete: (envId: number, instanceId: number, name: string) => void;
    onSetActive: (url: string, set: boolean) => void;
    envId: number;
    isActive: boolean;
    t: TTranslator;
}

const StyledInstanceWrapper = styled.div`
    width: 100%;
    background-color: #f1f1f1;
    padding: 0 10px;
    border-radius: 3px;
    cursor: pointer;
    min-height: 35px;
    overflow: hidden;
    line-height: 35px;
    margin-bottom: 10px;
    transition: all 0.2s linear;

    &:hover {
        background-color: #e7e7e7;

        .bp3-icon {
            opacity: 0.7;
        }
    }

    &.expanded {
        background-color: #add8e6ad;

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

const StyledUrlWrapper = styled.div`
    border: 1px solid #eee;
    border-radius: 3px;
    padding: 10px;
    margin-bottom: 10px;
    overflow: hidden;
`;

const QorusInstance: FunctionComponent<IQorusInstanceProps> = ({
    name,
    url,
    id,
    urls,
    onDelete,
    onDataChange,
    isActive,
    onUrlSubmit,
    onUrlDelete,
    envId,
    safe_url,
    onSetActive,
    t,
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [isExpanded, setExpanded] = useState<boolean>(false);

    const handleDataChange: (newName: string, url: string) => void = (newName, url) => {
        // Change the data of this instance
        onDataChange(id, newName, url);
        // Turn off editing
        setIsEditing(false);
    };

    const handleAddCancel: () => void = () => {
        // Turn off editing
        setIsEditing(false);
    };

    const handleUrlSubmit: (newName: string, url: string) => void = (newName, url) => {
        // Submit the url
        onUrlSubmit(envId, id, newName, url, true);
    };

    return (
        <>
            {isEditing ? (
                <Add
                    name={name}
                    url={url}
                    withUrl
                    defaultAdding
                    fill
                    id="instance"
                    onCancel={handleAddCancel}
                    onSubmit={handleDataChange}
                />
            ) : (
                <StyledInstanceWrapper className={isExpanded && 'expanded'} name="instance-item">
                    <div className="pull-left" style={{ width: '68%', wordBreak: 'break-word' }}>
                        <Icon icon="dot" intent={isActive ? 'success' : 'none'} />
                        <span className={Classes.TEXT_MUTED}>
                            {' '}
                            <a href={url} name="instance-link">
                                {name}
                            </a>
                        </span>
                    </div>
                    <div className="button-wrapper pull-right">
                        <ButtonGroup minimal>
                            <Button
                                icon="chevron-down"
                                small
                                onClick={() => setExpanded(!isExpanded)}
                                name="instance-expand"
                            />
                            <Button
                                icon="power"
                                intent={isActive ? 'success' : 'none'}
                                small
                                onClick={() => onSetActive(url, !isActive)}
                            />
                            <Button icon="edit" small onClick={() => setIsEditing(true)} />
                            <Button icon="trash" small onClick={() => onDelete(id)} />
                        </ButtonGroup>
                    </div>
                </StyledInstanceWrapper>
            )}
            {isExpanded && (
                <>
                    <StyledUrlWrapper name="instance-url">
                        <span>
                            {t('MainUrl')} - <a href={url}>{safe_url}</a>
                        </span>
                    </StyledUrlWrapper>
                    <StyledUrlWrapper name="instance-other-urls">
                        <StyledSubHeader>
                            <span>{t('OtherUrls')}</span>
                            <div className="pull-right">
                                <Add withUrl fill text={t('AddNewUrl')} onSubmit={handleUrlSubmit} id="other-url" />
                            </div>
                        </StyledSubHeader>
                        {urls.length === 0 && (
                            <StyledNoData>
                                <Icon icon="disable" iconSize={16} /> {t('NoUrls')}
                            </StyledNoData>
                        )}
                        {urls.map((url, index: number) => (
                            <QorusUrl id={index} {...url} onDelete={onUrlDelete} envId={envId} instanceId={id} />
                        ))}
                    </StyledUrlWrapper>
                </>
            )}
        </>
    );
};

export default withTextContext()(QorusInstance);
