import React, { FunctionComponent, useState } from 'react';
import styled from 'styled-components';
import { ButtonGroup, Button, InputGroup, ControlGroup, Classes, Icon } from '@blueprintjs/core';
import { IQorusInstance } from './ProjectConfig';
import QorusInstance from './instance';
import withTextContext from '../hocomponents/withTextContext';
import { TTranslator } from '../App';
import size from 'lodash/size';
import Add from './add';

export interface IEnvironmentPanel {
    id: number;
    name: string;
    qoruses: IQorusInstance[];
    path: string;
    active: boolean;
    onEnvironmentNameChange: (id: number, newName: string) => void;
    onEnvironmentDeleteClick: (id: number) => void;
    t: TTranslator;
}

const StyledEnvWrapper = styled.div`
    background-color: #fff;
    border-radius: 5px;
    break-inside: avoid;
    margin-bottom: 10px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
`;

const StyledEnvHeader = styled.div`
    height: 70px;
    display: flex;
    flex-flow: row wrap;
    padding: 10px;
    border-bottom: 1px solid #eee;
`;

const StyledQorusLogo = styled.div`
    width: 50px;
    height: 50px;
    border-radius: 99px;
    background-color: #eee;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid;
    border-color: ${({ active }) => (active ? '#7fba27' : '#ddd')};
`;

const StyledNameWrapper = styled.div`
    display: inline-flex;
    line-height: 50px;
    padding: 0 20px;
    flex: 1;
    justify-content: space-between;
`;

const StyledName = styled.h3`
    margin: 0;
    padding: 0;
`;

const StyledInstanceList = styled.div`
    padding: 10px;
    width: 100%;
    border-radius: 3px;
`;

const EnvironmentPanel: FunctionComponent<IEnvironmentPanel> = ({
    id,
    name,
    qoruses,
    path,
    active,
    onEnvironmentNameChange,
    onEnvironmentDeleteClick,
    t,
}) => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const [envName, setEnvName] = useState<string>(name);

    const handleNameChange: (event: React.FormEvent<HTMLElement>) => void = event => {
        setEnvName(event.target.value);
    };

    const handleNameSubmit: () => void = () => {
        // Check if the name is not empty
        if (envName !== '') {
            // Save the new name and set editing to false
            onEnvironmentNameChange(id, envName);
            setIsEditing(false);
        }
    };

    const handleEditingCancel: () => void = () => {
        // Cancel the editing and set the original
        // name back
        setEnvName(name);
        setIsEditing(false);
    };

    return (
        <StyledEnvWrapper>
            <StyledEnvHeader>
                <StyledQorusLogo active={active}>
                    <img
                        style={{ maxWidth: 30, maxHeight: 30 }}
                        src={`vscode-resource:${path}/images/qorus_logo_256_bw.png`}
                    />
                </StyledQorusLogo>
                <StyledNameWrapper>
                    {isEditing ? (
                        <InputGroup
                            fill
                            value={envName}
                            onChange={handleNameChange}
                            onKeyUp={(event: React.KeyboardEvent) => {
                                if (event.key === 'Enter') {
                                    handleNameSubmit();
                                }
                            }}
                        />
                    ) : (
                        <StyledName>{envName}</StyledName>
                    )}

                    <ButtonGroup minimal>
                        {isEditing && <Button icon={'cross'} onClick={handleEditingCancel} />}
                        <Button
                            icon={isEditing ? 'small-tick' : 'edit'}
                            intent={isEditing ? 'success' : 'none'}
                            onClick={() => {
                                if (isEditing) {
                                    handleNameSubmit();
                                } else {
                                    setIsEditing(true);
                                }
                            }}
                        />
                        <Button icon="trash" onClick={() => onEnvironmentDeleteClick(id)} />
                    </ButtonGroup>
                </StyledNameWrapper>
            </StyledEnvHeader>
            <StyledInstanceList>
                {size(qoruses) ? (
                    qoruses.map((qorusInstance: IQorusInstance) => <QorusInstance {...qorusInstance} />)
                ) : (
                    <p className={Classes.TEXT_MUTED}>
                        <Icon icon="disable" /> No instances
                    </p>
                )}
                <Add fill withUrl text={t('AddNewInstance')} />
            </StyledInstanceList>
        </StyledEnvWrapper>
    );
};

export default withTextContext()(EnvironmentPanel);
