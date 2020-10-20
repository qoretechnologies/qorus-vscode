import { Button, ButtonGroup } from '@blueprintjs/core';
import React, { useContext, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import Tutorial from '../../components/Tutorial';
import { Messages } from '../../constants/messages';
import { TextContext } from '../../context/text';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';
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
    position: relative;
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
                id: 'fsm-interface-title',
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
    pipeline: {
        elements: [
            {
                id: 'pipeline-interface-title',
                title: 'tutorial-pipeline-title',
                text: 'tutorial-pipeline-content',
            },
            {
                id: 'pipeline-fields-wrapper',
                title: 'tutorial-pipeline-fields-title',
                text: 'tutorial-pipeline-fields-content',
            },
            {
                id: 'pipeline-diagram',
                title: 'tutorial-pipeline-diagram-title',
                text: 'tutorial-pipeline-diagram-content',
            },
            { id: 'pipeline-start', title: 'pipeline-start-title', text: 'pipeline-start-content' },
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

const Tab: React.FC<ITabProps> = ({
    t,
    initialData,
    type,
    children,
    resetAllInterfaceData,
    setInterfaceId,
    updateField,
}) => {
    const isEditing: () => boolean = () => !!initialData[type]?.name;
    const getName: () => string = () => initialData?.[type]?.name || initialData?.[type]?.path;
    const [tutorialData, setTutorialData] = useState<any>({ isOpen: false });
    const getFilePath = () => {
        if (isEditing()) {
            const ext = initialData[type].target_file.split('.').pop();

            if (ext === 'yaml') {
                return null;
            }

            return `${initialData[type].target_dir}/${initialData[type].target_file}`;
        }

        return null;
    };
    const [recreateDialog, setRecreateDialog] = useState<any>(null);

    useMount(() => {
        const recreateListener = addMessageListener(Messages.MAYBE_RECREATE_INTERFACE, (data) => {
            setRecreateDialog(() => data);
        });

        // Ask for recreation dialog
        postMessage('check-edit-data', {});

        return () => {
            recreateListener();
        };
    });

    useEffect(() => {
        if (recreateDialog) {
            const { message, iface_kind, orig_lang, iface_id } = recreateDialog;

            initialData.confirmAction(
                message,
                () => {
                    initialData.resetInterfaceData(iface_kind);
                    initialData.changeInitialData('isRecreate', orig_lang ? false : true);
                    setInterfaceId(iface_kind, shortid.generate());
                    setRecreateDialog(null);
                },
                'Recreate',
                undefined,
                () => {
                    if (orig_lang) {
                        updateField(iface_kind, 'lang', orig_lang, iface_id);
                    } else {
                        resetAllInterfaceData(iface_kind);
                    }
                    setRecreateDialog(null);
                }
            );
        }
    }, [recreateDialog]);

    return (
        <StyledTab>
            {tutorialData.isOpen && (
                <Tutorial data={tutorialData.elements} onClose={() => setTutorialData({ isOpen: false })} />
            )}
            <StyledHeader>
                <h2 id={`${type}-interface-title`}>
                    {isEditing() ? `Edit ${getTypeName(type, t)} "${getName()}"` : `New ${getTypeName(type, t)}`}
                </h2>
                <ButtonGroup>
                    {tutorials[type] && (
                        <TutorialButton
                            type={type}
                            onClick={(elements) =>
                                setTutorialData({
                                    isOpen: true,
                                    elements,
                                })
                            }
                        />
                    )}
                    {isEditing() && (
                        <>
                            <Button
                                id="button-create-new"
                                icon="add"
                                text="Create new"
                                intent="success"
                                onClick={() => {
                                    resetAllInterfaceData(type);
                                }}
                            />
                            {getFilePath() && (
                                <Button
                                    icon="document-share"
                                    text="View File"
                                    onClick={() => {
                                        postMessage('open-file', {
                                            file_path: getFilePath(),
                                        });
                                    }}
                                />
                            )}
                            <Button
                                icon="trash"
                                text="Delete"
                                intent="danger"
                                onClick={() => {
                                    initialData.confirmAction('ConfirmDeleteInterface', () => {
                                        postMessage('delete-interface', {
                                            iface_kind: type,
                                            name: getName(),
                                        });
                                        resetAllInterfaceData(type);
                                    });
                                }}
                            />
                        </>
                    )}
                </ButtonGroup>
            </StyledHeader>
            <StyledContent>{children}</StyledContent>
        </StyledTab>
    );
};

export default compose(
    withFieldsConsumer(),
    withInitialDataConsumer(),
    withTextContext(),
    withGlobalOptionsConsumer()
)(Tab);
