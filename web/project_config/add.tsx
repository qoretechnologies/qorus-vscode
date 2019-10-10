import React, { FunctionComponent, useState } from 'react';
import { ControlGroup, InputGroup, Button } from '@blueprintjs/core';
import withTextContext from '../hocomponents/withTextContext';
import styled from 'styled-components';
import { TTranslator } from '../App';

export interface IAddProjectData {
    withUrl?: boolean;
    t: TTranslator;
    onSubmit: (name: string, url?: string) => void;
    fill?: boolean;
    text?: string;
}

const StyledAddWrapper = styled.div`
    margin-bottom: 10px;
    flex: 0;
`;

export default withTextContext()(({ withUrl, t, onSubmit, fill, text }) => {
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [name, setName] = useState<string>(null);
    const [url, setUrl] = useState<string>(null);

    const handleAddClick = () => {
        setIsAdding(true);
        // Set the name to blank
        setName('');
        // Set the url to blank
        setUrl('');
    };

    const handleCancelClick = () => {
        setIsAdding(false);
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
            if (url === '') {
                // Do not submit
                submit = false;
            }
        }
        // Check if the name is not empty
        if (name === '') {
            // Do not submit
            submit = false;
        }
        // Submit the new data if all conditions
        // are met
        if (submit) {
            // Pass the data
            onSubmit(name, url);
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
            <ControlGroup fill={fill}>
                {isAdding && (
                    <>
                        <InputGroup
                            value={name}
                            placeholder={t('Name')}
                            onChange={handleNameChange}
                            onKeyUp={handleEnterPress}
                        />
                        {withUrl && (
                            <InputGroup
                                value={url}
                                placeholder={t('Url')}
                                onChange={handleUrlChange}
                                onKeyUp={handleEnterPress}
                            />
                        )}
                    </>
                )}
                {!isAdding ? (
                    <Button icon="add" text={t(text || 'AddNewEnvironment')} onClick={handleAddClick} />
                ) : (
                    <>
                        <Button icon="cross" onClick={handleCancelClick} />
                        <Button icon="small-tick" intent="success" onClick={handleCreateClick} />
                    </>
                )}
            </ControlGroup>
        </StyledAddWrapper>
    );
}) as FunctionComponent<IAddProjectData>;
