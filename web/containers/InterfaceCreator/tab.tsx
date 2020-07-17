import React, {
    useContext, useState
} from 'react';

import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';

import { Button, ButtonGroup } from '@blueprintjs/core';

import { TTranslator } from '../../App';
import Tutorial from '../../components/Tutorial';
import { TextContext } from '../../context/text';
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

const StyledHeader = styled.div`
    margin: 0 0 15px 0;
    padding: 0 0 10px 0;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h2 {
        margin: 0;
        padding: 0;
    }
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
    default: {
        elements: [
            {
                id: 'tutorial-controls',
                title: 'tutorial-controls',
                text: 'tutorial-controls-content',
                isDefault: true,
                elementData: {
                    left: window.innerWidth / 2 - 44,
                    top: 10,
                    height: 30,
                    width: 88,
                },
            },
        ],
    },
    fsm: {
        elements: [
            {
                id: 'interface-title',
                title: 'tutorial-fsm-title',
                text: 'tutorial-fsm-content',
            },
            {
                id: 'fsm-fields-wrapper',
                title: 'tutorial-fsm-fields-title',
                text: 'tutorial-fsm-fields-content',
            },
            { id: 'fsm-toolbar', title: 'tutorial-fsm-tools-title', text: 'tutorial-fsm-tools-content' },
            {
                id: 'fsm-diagram',
                title: 'tutorial-fsm-diagram-title',
                text: 'tutorial-fsm-diagram-content',
            },
            { id: 'pan-element-toolbar', title: 'tutorial-fsm-toolbar-title', text: 'tutorial-fsm-toolbar-content' },
        ],
    },
};

const TutorialButton = ({ type, onClick }) => {
    const [isReady, setIsReady] = useState<boolean>(false);
    const t = useContext(TextContext);

    useMount(() => {
        let remainingElements = tutorials[type].elements;
        let interval = setInterval(() => {
            remainingElements = remainingElements.reduce((newElements, element) => {
                const el = document.querySelector(`#${element.id}`);
                // Check if this element is loaded
                if (el) {
                    return [...newElements];
                }
                return [
                    ...newElements,
                    {
                        ...element,
                    },
                ];
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
    });

    return isReady ? (
        <Button
            icon="help"
            text="Tutorial"
            onClick={() => {
                tutorials[type].elements = tutorials[type].elements.map((element) => {
                    const el = document.querySelector(`#${element.id}`);

                    if (!el) {
                        return undefined;
                    }

                    return {
                        ...element,
                        elementData: el.getBoundingClientRect(),
                    };
                });

                onClick([...tutorials.default.elements, ...tutorials[type].elements]);
            }}
        />
    ) : (
        <Button loading text={t('WaitingForElements')} />
    );
};

const Tab: React.FC<ITabProps> = ({ t, initialData, type, children, resetAllInterfaceData }) => {
    const isEditing: () => boolean = () => !!initialData[type]?.name;
    const getName: () => string = () => initialData?.[type]?.name || initialData?.[type]?.path;
    const [tutorialData, setTutorialData] = useState<any>({ isOpen: false });

    return (
        <StyledTab>
            {tutorialData.isOpen && (
                <Tutorial data={tutorialData.elements} onClose={() => setTutorialData({ isOpen: false })} />
            )}
            <StyledHeader>
                <h2 id="interface-title">
                    {isEditing() ? `Edit ${getTypeName(type, t)} "${getName()}"` : `New ${getTypeName(type, t)}`}
                </h2>
                <ButtonGroup>
                    <TutorialButton
                        type={type}
                        onClick={(elements) =>
                            setTutorialData({
                                isOpen: true,
                                elements,
                            })
                        }
                    />

                    {isEditing() && (
                        <>
                            <Button
                                icon="add"
                                text="Create new"
                                intent="success"
                                onClick={() => {
                                    resetAllInterfaceData(type);
                                }}
                            />
                            <Button icon="document-share" text="View File" />
                            <Button icon="trash" text="Delete" intent="danger" />
                        </>
                    )}
                </ButtonGroup>
            </StyledHeader>
            <StyledContent>{children}</StyledContent>
        </StyledTab>
    );
};

export default compose(withInitialDataConsumer(), withTextContext(), withGlobalOptionsConsumer())(Tab);
