import React from 'react';
import styled from 'styled-components';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import compose from 'recompose/compose';
import { ButtonGroup, Button } from '@blueprintjs/core';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';

export interface ITabProps {
    initialData: any;
    t: TTranslator;
    children: any;
    type: string;
    isEditing: boolean;
    name: string;
    resetFields: (type: string) => any;
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

const Tab: React.FC<ITabProps> = ({ t, initialData, type, children, resetFields }) => {
    const isEditing: () => boolean = () => !!initialData[type];
    const getName: () => string = () => initialData?.[type]?.name;

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
                                    initialData.resetInterfaceData(type);
                                    resetFields(type);
                                }}
                            />
                        </ButtonGroup>
                        <StyledSeparator />
                        <ButtonGroup>
                            <Button icon="document-share" text="View File" />
                            <Button icon="trash" text="Delete" intent="danger" />
                        </ButtonGroup>
                    </div>
                )}
            </StyledHeader>
            <StyledContent>{children}</StyledContent>
        </StyledTab>
    );
};

export default compose(withInitialDataConsumer(), withFieldsConsumer(), withTextContext())(Tab);
