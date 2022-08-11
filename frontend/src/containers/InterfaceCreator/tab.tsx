import { Button, ButtonGroup, Classes } from '@blueprintjs/core';
import { capitalize, forEach, size } from 'lodash';
import React, { useContext, useEffect, useState } from 'react';
import { useUnmount } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import CustomDialog from '../../components/CustomDialog';
import { DraftsTable } from '../../components/DraftsTable';
import HorizontalSpacer from '../../components/HorizontalSpacer';
import { TimeAgo } from '../../components/TimeAgo';
import Tutorial from '../../components/Tutorial';
import { interfaceKindTransform } from '../../constants/interfaces';
import { Messages } from '../../constants/messages';
import { DraftsContext, IDraftsContext } from '../../context/drafts';
import { InitialContext } from '../../context/init';
import { MethodsContext } from '../../context/methods';
import { TextContext } from '../../context/text';
import { callBackendBasic } from '../../helpers/functions';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
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

export const StyledHeader = styled.div`
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
      {
        id: 'fsm-toolbar',
        title: 'tutorial-fsm-tools-title',
        text: 'tutorial-fsm-tools-content',
      },
      {
        id: 'fsm-diagram',
        title: 'tutorial-fsm-diagram-title',
        text: 'tutorial-fsm-diagram-content',
      },
      {
        id: 'pan-element-toolbar',
        title: 'tutorial-fsm-toolbar-title',
        text: 'tutorial-fsm-toolbar-content',
      },
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
  const [isSuccessful, setIsSuccessful] = useState<boolean>(false);
  const t = useContext(TextContext);

  useEffect(() => {
    let remainingElements = tutorials[type].elements;
    let timeLeft = 2000;
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

      timeLeft -= 500;

      if (remainingElements.length === 0 || timeLeft === 0) {
        clearInterval(interval);
        interval = null;
        setIsReady(true);
        setIsSuccessful(timeLeft !== 0);
      }
    }, 200);

    return () => {
      clearInterval(interval);
    };
  });

  return isReady ? (
    <>
      {isSuccessful && (
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
      )}
    </>
  ) : (
    <Button loading text={t('WaitingForElements')} />
  );
};

const Tab: React.FC<ITabProps> = ({
  t,
  data,
  type,
  children,
  resetAllInterfaceData,
  updateField,
  removeSubItemFromFields,
  name,
}) => {
  const isEditing: () => boolean = () => !!name;
  const [tutorialData, setTutorialData] = useState<any>({ isOpen: false });
  const getFilePath = () => {
    if (isEditing()) {
      const ext = data[type].target_file.split('.').pop();

      if (ext === 'yaml') {
        return null;
      }

      return `${data[type].target_dir}/${data[type].target_file}`;
    }

    return null;
  };
  const [recreateDialog, setRecreateDialog] = useState<any>(null);
  const [draftsOpen, setDraftsOpen] = useState<boolean>(false);
  const { changeTab, isSavingDraft, lastDraft }: any = useContext(InitialContext);
  const { methods, setMethods, setMethodsCount }: any = useContext(MethodsContext);
  const { maybeApplyDraft, addDraft } = useContext<IDraftsContext>(DraftsContext);
  const [draftsCount, setDraftsCount] = useState<number>(0);
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);
  const [localLastDraft, setLastDraft] = useState<string>(null);

  useEffect(() => {
    if (lastDraft && lastDraft.interfaceKind === type) {
      setLastDraft(lastDraft.interfaceId);
    }
  }, [lastDraft]);

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

  useUnmount(() => {
    // Remove the associated type interface from initial data
    resetAllInterfaceData(type);
  });

  useEffect(() => {
    if (isSavingDraft) {
      setIsDraftSaved(true);
    } else if (isSavingDraft === false) {
      (async () => {
        const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
          iface_kind: interfaceKindTransform[type],
        });

        if (fetchedDrafts.ok) {
          setDraftsCount(size(fetchedDrafts.data.drafts));
        } else {
          setDraftsCount(0);
        }
      })();
    }
  }, [isSavingDraft]);

  // Fetch new drafts count when the type changes
  useEffect(() => {
    setIsDraftSaved(false);
    (async () => {
      const fetchedDrafts = await callBackendBasic(Messages.GET_DRAFTS, undefined, {
        iface_kind: interfaceKindTransform[type],
      });

      if (fetchedDrafts.ok) {
        setDraftsCount(size(fetchedDrafts.data.drafts));
      } else {
        setDraftsCount(0);
      }
    })();
  }, [type]);

  useEffect(() => {
    if (recreateDialog) {
      const { message, iface_kind, orig_lang, iface_id } = recreateDialog;

      const isMethodUsedInCC = (name, classConnections): boolean => {
        let isUsed = false;

        forEach(classConnections, (connectorList) => {
          forEach(connectorList, (connectorData) => {
            if (connectorData.trigger === name) {
              isUsed = true;
            }
          });
        });

        return isUsed;
      };

      data.confirmAction(
        message,
        () => {
          if (iface_kind === 'service') {
            // Get the removed methods, only remove methods that are not
            // used in class connections as triggers
            const { 'class-connections': classConnections } = data.service;
            const removedMethods: any[] = methods.filter((method) => {
              return method.name !== 'init' && !isMethodUsedInCC(method.name, classConnections);
            });
            // Set the methods to only leave the init method
            // only if no methods were left
            setMethods((cur) => {
              return size(removedMethods) !== size(methods)
                ? [...cur].filter(
                    (method) =>
                      method.name === 'init' || isMethodUsedInCC(method.name, classConnections)
                  )
                : [{ name: 'init', desc: '' }];
            });
            // Remove each of the removed methods from the fields
            removedMethods.forEach((method) => {
              removeSubItemFromFields(method.id, 'service-methods');
            });

            setMethodsCount((current: number) => current - size(removedMethods));
          }
          data.changeInitialData('isRecreate', true);
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
        <div>
          <h2 id={`${type}-interface-title`}>
            {isEditing() ? `Edit ${getTypeName(type, t)} "${name}"` : `New ${getTypeName(type, t)}`}
          </h2>
        </div>
        {isDraftSaved ? (
          <Button
            minimal
            loading={isSavingDraft}
            intent={isSavingDraft ? 'warning' : 'success'}
            icon="small-tick"
          >
            {isSavingDraft ? (
              t('SavingDraft')
            ) : (
              <>
                {t('DraftSaved')} <TimeAgo time={Date.now()} />
              </>
            )}
          </Button>
        ) : null}
        <div>
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
            <Button
              id="button-create-new"
              icon="add"
              text="Create new"
              intent="success"
              onClick={() => {
                setIsDraftSaved(false);
                resetAllInterfaceData(type);
              }}
            />
            {isEditing() && (
              <>
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
                    data.confirmAction('ConfirmDeleteInterface', () => {
                      postMessage('delete-interface', {
                        iface_kind: type,
                        name: name,
                      });
                      setIsDraftSaved(false);
                      resetAllInterfaceData(type);
                    });
                  }}
                />
              </>
            )}
          </ButtonGroup>
          <HorizontalSpacer size={10} />
          <ButtonGroup>
            {!isEditing() && (
              <Button
                id="button-show-drafts"
                icon="list"
                text={`Drafts (${draftsCount})`}
                disabled={!draftsCount}
                onClick={() => {
                  setDraftsOpen(true);
                }}
              />
            )}
          </ButtonGroup>
        </div>
      </StyledHeader>
      <StyledContent>{children}</StyledContent>
      {draftsOpen && (
        <CustomDialog
          isOpen
          onClose={() => setDraftsOpen(false)}
          noBottomPad
          title={`${t(capitalize(type))} ${t(`Drafts`)}`}
          style={{ width: '80vw' }}
        >
          <div className={Classes.DIALOG_BODY}>
            <DraftsTable
              interfaceKind={type}
              lastDraft={localLastDraft}
              onClick={(interfaceId, draftData) => {
                setLastDraft(interfaceId);
                setDraftsOpen(false);
                addDraft({
                  interfaceKind: type,
                  interfaceId,
                  ...draftData,
                });
              }}
            />
          </div>
        </CustomDialog>
      )}
    </StyledTab>
  );
};

export default compose(
  withFieldsConsumer(),
  withMethodsConsumer(),
  withTextContext(),
  withGlobalOptionsConsumer()
)(Tab);
