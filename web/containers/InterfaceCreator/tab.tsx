import React from 'react';

import compose from 'recompose/compose';
import styled from 'styled-components';

import { Button, ButtonGroup } from '@blueprintjs/core';

import { TTranslator } from '../../App';
import { Messages } from '../../constants/messages';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMessageHandler, { TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface ITabProps {
    initialData: any;
    t: TTranslator;
    children: any;
    type: string;
    isEditing: boolean;
    name: string;
    resetAllInterfaceData: (type: string) => any;
    postMessage: TPostMessage;
}

const StyledTab = styled.div`
    display: flex;
    flex: 1;
    flex-flow: column;
    overflow: hidden;
`;

const StyledHeader = styled.h2`
    margin: 0 0 15px 0;
    padding: 0 0 10px 0;
    border-bottom: 1px solid #eee;
`;

const StyledContent = styled.div`
    display: flex;
    flex: 1;
    overflow: hidden;
    flex-flow: column;
`;

const StyledSeparator = styled.div`
    width: 10px;
    height: 30px;
    margin-left: 10px;
    border-left: 1px solid #eee;
    display: inline-block;
    vertical-align: bottom;
`;

const Tab: React.FC<ITabProps> = ({ t, initialData, type, children, resetAllInterfaceData, postMessage }) => {
    const isEditing: () => boolean = () => !!initialData[type]?.name;
    const getName: () => string = () => initialData?.[type]?.name || initialData?.[type]?.path;
    const hasCodeFile = () =>
        isEditing() &&
        !!initialData[type].target_dir &&
        !!initialData[type].target_file &&
        !initialData[type].target_file.endsWith('.yaml');

    return (
        <StyledTab>
            <StyledHeader>
                {isEditing() ? `Edit ${type} "${getName()}"` : `New ${type}`}
                <Button minimal icon="help" />
                {isEditing() && (
                    <div style={{ float: 'right' }}>
                        <ButtonGroup>
                            <Button
                                icon="add"
                                text="Create new"
                                intent="success"
                                onClick={() => {
                                    resetAllInterfaceData(type);
                                }}
                            />
                        </ButtonGroup>
                        <StyledSeparator />

                        <ButtonGroup>
                            {hasCodeFile() && (
                                <Button
                                    icon="document-share"
                                    text="View File"
                                    onClick={() => {
                                        postMessage(Messages.VIEW_FILE, {
                                            file_path: `${initialData[type].target_dir}/${initialData[type].target_file}`,
                                        });
                                    }}
                                />
                            )}
                            <Button icon="trash" text="Delete" intent="danger" />
                        </ButtonGroup>
                    </div>
                )}
            </StyledHeader>
            <StyledContent>{children}</StyledContent>
        </StyledTab>
    );
};

export default compose(
    withInitialDataConsumer(),
    withTextContext(),
    withGlobalOptionsConsumer(),
    withMessageHandler()
)(Tab);
