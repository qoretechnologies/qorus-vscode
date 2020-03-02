import React, { FunctionComponent, useState } from 'react';
import { ControlGroup, InputGroup, Button, ButtonGroup } from '@blueprintjs/core';
import withTextContext from '../hocomponents/withTextContext';
import styled from 'styled-components';
import { TTranslator } from '../App';

export interface IAddProjectData {
    withUrl?: boolean;
    t?: TTranslator;
    onSubmit: (name: string, url?: string) => void;
    fill?: boolean;
    text?: string;
    defaultAdding?: boolean;
    name?: string;
    url?: string;
    onCancel?: () => void;
    minimal?: boolean;
    big?: boolean;
    id?: string;
}

const StyledAddWrapper = styled.div`
    flex: 0;

    .bp3-icon {
        opacity: 0.7;
    }
`;

export default withTextContext()(
    ({ withUrl, big, t, onCancel, name, url, onSubmit, fill, text, defaultAdding = false, minimal = true, id }) => {
        const [isAdding, setIsAdding] = useState<boolean>(defaultAdding);
        const [newName, setName] = useState<string>(name);
        const [newUrl, setUrl] = useState<string>(url);

        const handleAddClick = () => {
            setIsAdding(true);
            // Set the name to blank
            setName(name);
            // Set the url to blank
            setUrl(url);
        };

        const handleCancelClick = () => {
            // If custom on cancel function exists
            if (onCancel) {
                onCancel();
            } else {
                // Turn adding off
                setIsAdding(false);
            }
        };

        const handleNameChange: (event: React.FormEvent<HTMLElement>) => void = event => {
            setName(event.target.value);
        };

        const handleUrlChange: (event: React.FormEvent<HTMLElement>) => void = event => {
            setUrl(event.target.value);
        };

        const handleCreateClick = () => {
            let submit = true;
            // Should we submit url as well
            if (withUrl) {
                // Check if url is not empty
                if (!newUrl || newUrl === '') {
                    // Do not submit
                    submit = false;
                }
            }
            // Check if the name is not empty
            if (!newName || newName === '') {
                // Do not submit
                submit = false;
            }
            // Submit the new data if all conditions
            // are met
            if (submit) {
                // Pass the data
                onSubmit(newName, newUrl);
                // Remove editing
                setIsAdding(false);
            }
        };

        const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
            if (event.key === 'Enter') {
                handleCreateClick();
            }
        };

        return (
            <StyledAddWrapper>
                {isAdding ? (
                    <ButtonGroup fill={fill}>
                        <InputGroup
                            value={newName}
                            placeholder={t('Name')}
                            onChange={handleNameChange}
                            onKeyUp={handleEnterPress}
                            small={!big}
                            id={id}
                            style={{
                                width: !minimal ? '250px' : 'auto',
                            }}
                        />
                        {withUrl && (
                            <InputGroup
                                value={newUrl}
                                placeholder={t('Url')}
                                onChange={handleUrlChange}
                                onKeyUp={handleEnterPress}
                                small={!big}
                            />
                        )}

                        <Button icon="cross" onClick={handleCancelClick} small={!big} />
                        <Button
                            icon="small-tick"
                            intent="success"
                            onClick={handleCreateClick}
                            small={!big}
                            id={`${id}-submit`}
                        />
                    </ButtonGroup>
                ) : (
                    <ButtonGroup fill={fill} minimal={minimal}>
                        <Button
                            icon="plus"
                            text={text}
                            onClick={handleAddClick}
                            small={!big}
                            intent="success"
                            id={`${id}-add`}
                        />
                    </ButtonGroup>
                )}
            </StyledAddWrapper>
        );
    }
) as FunctionComponent<IAddProjectData>;
