import React, { useState } from 'react';

import compose from 'recompose/compose';
import styled from 'styled-components';

import { Button, ButtonGroup } from '@blueprintjs/core';

import { TTranslator } from '../../App';
import Tutorial from '../../components/Tutorial';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';

export interface ITabProps {
    initialData: any;
    t: TTranslator;
    children: any;
    type: string;
    isEditing: boolean;
    name: string;
    resetAllInterfaceData: (type: string) => any;
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

const getTypeName = (type: string, t): string => {
    switch (type) {
        case 'fsm':
            return t('FiniteStateMachine');
        default:
            return type;
    }
};

const tutorials = {
    fsm: {
        elements: [
            { id: 'fsm-fields-wrapper', text: 'The fields you have to fill' },
            { id: 'fsm-toolbar', text: 'The toolbar you drag from' },
            { id: 'fsm-diagram', text: 'The diagram where your FSM will be displayed' },
        ],
    },
};

const TutorialButton = ({ type, onClick }) => {
    const [isReady, setIsReady] = useState<boolean>(false);

    /*useMount(() => {
        let remainingElements = tutorials[type].elements;
        let interval = setInterval(() => {
            remainingElements = remainingElements.reduce((newElements, element) => {
                // Check if this element is loaded
                if (document.querySelector(`#${element.id}`)) {
                    return [...newElements];
                }
                return [...newElements, element];
            }, []);

            if (remainingElements.length === 0) {
                clearInterval(interval);
                interval = null;
                setIsReady(true);
            }
        }, 500);

        return () => {
            clearInterval(interval);
        };
    });*/

    return isReady ? (
        <Button icon="help" text="Tutorial" onClick={onClick} />
    ) : (
        <Button loading text="Waiting for elements" />
    );
};

const Tab: React.FC<ITabProps> = ({ t, initialData, type, children, resetAllInterfaceData }) => {
    const isEditing: () => boolean = () => !!initialData[type]?.name;
    const getName: () => string = () => initialData?.[type]?.name || initialData?.[type]?.path;
    const [isTutorialOpen, setIsTutorialOpen] = useState<boolean>(false);

    return (
        <StyledTab>
            {isTutorialOpen && <Tutorial data={tutorials[type]} />}
            <StyledHeader>
                {isEditing() ? `Edit ${type} "${getName()}"` : `New ${type}`}
                <Button minimal icon="help" />
                <div style={{ float: 'right' }}>
                    <TutorialButton type={type} onClick={() => setIsTutorialOpen(true)} />
                </div>
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
                        {/*<StyledSeparator />
                        <ButtonGroup>
                            <Button icon="document-share" text="View File" />
                            <Button icon="trash" text="Delete" intent="danger" />
                        </ButtonGroup>*/}
                    </div>
                )}
            </StyledHeader>
            <StyledContent>{children}</StyledContent>
        </StyledTab>
    );
};

export default compose(withInitialDataConsumer(), withTextContext(), withGlobalOptionsConsumer())(Tab);
