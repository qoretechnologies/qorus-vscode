import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreDrawer,
  ReqoreMessage,
  ReqoreTabs,
  ReqoreTabsContent,
  useReqoreTheme,
} from '@qoretechnologies/reqore';
import { cloneDeep, isEqual, some } from 'lodash';
import get from 'lodash/get';
import omit from 'lodash/omit';
import set from 'lodash/set';
import size from 'lodash/size';
import React, { useContext, useRef, useState } from 'react';
import Tree from 'react-d3-tree';
import { useDebounce, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled from 'styled-components';
import Content from '../../../components/Content';
import Field from '../../../components/Field';
import ConnectorField from '../../../components/Field/connectors';
import FileString from '../../../components/Field/fileString';
import { NegativeColorEffect } from '../../../components/Field/multiPair';
import MultiSelect from '../../../components/Field/multiSelect';
import String from '../../../components/Field/string';
import Options from '../../../components/Field/systemOptions';
import { ContentWrapper, FieldWrapper } from '../../../components/FieldWrapper';
import { InputOutputType } from '../../../components/InputOutputType';
import Loader from '../../../components/Loader';
import { Messages } from '../../../constants/messages';
import { ContextMenuContext } from '../../../context/contextMenu';
import { DraftsContext, IDraftData } from '../../../context/drafts';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import {
  checkPipelineCompatibility,
  deleteDraft,
  getDraftId,
  hasValue,
} from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import withMessageHandler, { TPostMessage } from '../../../hocomponents/withMessageHandler';
import TinyGrid from '../../../images/graphy-dark.png';
import { backControl, nextControl, resetControl, submitControl } from '../controls';
import { StyledCompatibilityLoader } from '../fsm';
import PipelineElementDialog from './elementDialog';

export interface IPipelineViewProps {
  onSubmitSuccess: (data: any) => any;
  setPipelineReset: (func: any) => void;
  postMessage: TPostMessage;
}

export interface IPipelineProcessor {
  type: string;
  name: string;
  args?: { [key: string]: any };
}

export interface IPipelineMapper {
  type: string;
  name: string;
}

export interface IPipelineQueue {
  type: string;
  name: string;
  elements: IPipelineElement[];
}

export type IPipelineElement = IPipelineQueue | IPipelineProcessor | IPipelineMapper;

export interface IPipelineMetadata {
  target_dir: string;
  name: string;
  desc: string;
  options?: { [key: string]: any };
  groups?: any;
  'input-provider': any;
  'input-provider-options': any;
}

const StyledDiagramWrapper = styled.div<{ path: string }>`
  width: 100%;
  flex: 1;
  position: relative;
  background: ${({ theme }) => `${theme.main} url(${TinyGrid})`};
  overflow: hidden;
  border-radius: 7px;
`;

const StyledNodeLabel = styled.div<{ isValid?: boolean }>`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-flow: column;

  background-color: ${({ isValid }) => (isValid === false ? '#d13913' : 'transparent')};

  span {
    text-align: center;
  }
`;

const NodeLabel = ({ nodeData, onEditClick, onDeleteClick, onAddClick, onAddQueueClick }) => {
  const { addMenu } = useContext(ContextMenuContext);
  const t = useContext(TextContext);

  const hasOnlyQueues = nodeData.children?.every((child) => child.type === 'queue');

  return (
    <ReqoreControlGroup vertical stack style={{ margin: 'auto', width: '300px' }} fluid>
      <ReqoreButton
        wrap
        intent={
          nodeData.type === 'start' ? 'success' : nodeData.type === 'queue' ? 'info' : undefined
        }
        icon={
          nodeData.type === 'start'
            ? 'PlayLine'
            : nodeData.type === 'queue'
            ? 'ListCheck'
            : undefined
        }
        rightIcon={
          nodeData.type === 'start'
            ? 'PlayLine'
            : nodeData.type === 'queue'
            ? 'ListCheck'
            : undefined
        }
        description={
          nodeData.type === 'start'
            ? 'Beginning of the pipeline'
            : nodeData.type === 'queue'
            ? 'Queue of elements'
            : undefined
        }
        labelEffect={
          nodeData.type === 'start' || nodeData.type === 'queue'
            ? {
                uppercase: true,
                spaced: 1,
                textSize: 'normal',
                textAlign: 'center',
              }
            : undefined
        }
        // tooltip={
        //   nodeData.type !== 'start' && nodeData.type !== 'queue'
        //     ? {
        //         useTargetWidth: true,
        //         content: (
        //           <InputOutputType
        //             inputProvider={{ interfaceName: nodeData.name, interfaceKind: nodeData.type }}
        //             outputProvider={{ interfaceName: nodeData.name, interfaceKind: nodeData.type }}
        //             compact
        //           />
        //         ),
        //       }
        //     : undefined
        // }
        maxWidth="350px"
        onClick={nodeData.type === 'start' ? undefined : () => onEditClick({ nodeData })}
        badge={nodeData.type !== 'start' && nodeData.type !== 'queue' ? nodeData.type : undefined}
        textAlign="center"
      >
        {nodeData.name || nodeData.type}
      </ReqoreButton>
      {hasOnlyQueues || !size(nodeData.children) ? (
        <ReqoreButton
          icon="AddLine"
          textAlign="center"
          rightIcon="AddLine"
          onClick={() => {
            if (hasOnlyQueues) {
              onAddQueueClick({
                parentPath: nodeData.path,
                name: null,
                children: [],
                _children: [],
                type: 'queue',
              });
            } else if (!size(nodeData.children)) {
              onAddClick({
                nodeData: { parentPath: nodeData.path },
                parentData: nodeData,
                onlyQueue: hasOnlyQueues,
              });
            }
          }}
          customTheme={{
            main: `${
              nodeData.type === 'start' ? 'success' : nodeData.type === 'queue' ? 'info' : 'main'
            }:lighten`,
          }}
        >
          {hasOnlyQueues ? t('AddQueue') : t('AddElement')}
        </ReqoreButton>
      ) : null}
    </ReqoreControlGroup>
  );
};

const PipelineView: React.FC<IPipelineViewProps> = ({
  postMessage,
  setPipelineReset,
  onSubmitSuccess,
  interfaceContext,
  ...rest
}) => {
  const getNodeShapeData = ({ type, children, isCompatible }) => {
    switch (type) {
      case 'mapper':
      case 'processor':
        return {
          shape: 'rect',
        };
      case 'queue':
        return {
          shape: 'rect',
        };
      default:
        return {
          shape: 'rect',
          shapeProps: {
            id: 'pipeline-start',
          },
        };
    }
  };
  const transformNodeData = (data, path) => {
    return data.reduce((newData, item, index) => {
      let newItem = cloneDeep(item);
      newItem = omit(newItem, ['parent', '_children']);

      newItem.nodeSvgShape = getNodeShapeData(item);
      newItem.path = `${path}[${index}]`;

      if (item.children) {
        newItem.children = transformNodeData(newItem.children, `${newItem.path}.children`);
      }

      return [...newData, newItem];
    }, []);
  };

  const wrapperRef = useRef(null);
  const t = useContext(TextContext);
  const theme = useReqoreTheme();
  const { image_path, confirmAction, callBackend, qorus_instance, saveDraft, ...init } =
    useContext(InitialContext);
  const { maybeApplyDraft, draft } = useContext(DraftsContext);
  const pipeline = rest?.pipeline || init?.pipeline;
  const { resetAllInterfaceData } = useContext(GlobalContext);
  const changeHistory = useRef<string[]>([]);
  const currentHistoryPosition = useRef<number>(-1);
  const [compatibilityChecked, setCompatibilityChecked] = useState<boolean>(false);
  const [selectedElement, setSelectedElement] = useState<IPipelineElement | null>(null);
  const [interfaceId, setInterfaceId] = useState(null);
  const [isDiagramShown, setIsDiagramShown] = useState(false);
  const [isFromDraft, setIsFromDraft] = useState(false);
  const [metadata, setMetadata] = useState<IPipelineMetadata>({
    target_dir: pipeline?.target_dir || interfaceContext?.target_dir || null,
    name: pipeline?.name || null,
    desc: pipeline?.desc || null,
    groups: pipeline?.groups || [],
    'input-provider': pipeline?.['input-provider'] || undefined,
    'input-provider-options': pipeline?.['input-provider-options'] || undefined,
  });
  const [elements, setElements] = useState<IPipelineElement[]>(
    transformNodeData(
      [
        {
          type: 'start',
          children: pipeline?.children || [],
        },
      ],
      ''
    )
  );

  const applyDraft = () => {
    maybeApplyDraft(
      'pipeline',
      undefined,
      pipeline,
      ({ pipelineData: { metadata, elements }, interfaceId }: IDraftData) => {
        // From draft
        setIsFromDraft(true);
        setInterfaceId(interfaceId);
        setMetadata(metadata);
        setElements(elements);
      }
    );
  };

  useUpdateEffect(() => {
    if (draft) {
      applyDraft();
    }
  }, [draft]);

  useMount(() => {
    setPipelineReset(() => reset);

    updateHistory(
      transformNodeData(
        [
          {
            type: 'start',
            children: pipeline?.children || [],
          },
        ],
        ''
      )
    );

    setInterfaceId(pipeline?.iface_id || shortid.generate());
    // Apply the draft with "type" as first parameter and a custom function
    applyDraft();

    return () => {
      setPipelineReset(null);
    };
  });

  useDebounce(
    () => {
      (async () => {
        if (
          !metadata['input-provider'] ||
          validateField('type-selector', metadata['input-provider'])
        ) {
          setCompatibilityChecked(false);

          const newElements = await checkPipelineCompatibility(
            elements,
            metadata['input-provider']
          );

          setCompatibilityChecked(true);
          setElements(transformNodeData(newElements, ''));
        } else {
          Promise.resolve();
        }
      })();
    },
    1000,
    [JSON.stringify(metadata['input-provider']), JSON.stringify(elements)]
  );

  useDebounce(
    () => {
      const draftId = getDraftId(pipeline, interfaceId);
      const hasChanged = pipeline
        ? some(metadata, (value, key) => {
            return !isEqual(value, pipeline[key]);
          }) ||
          !isEqual(
            elements,
            transformNodeData(
              [
                {
                  type: 'start',
                  children: pipeline?.children || [],
                },
              ],
              ''
            )
          )
        : true;
      if (
        draftId &&
        (hasValue(metadata.target_dir) ||
          hasValue(metadata.desc) ||
          hasValue(metadata.name) ||
          size(metadata.groups) ||
          size(metadata['input-provider']) ||
          size(metadata['input-provider-options'])) &&
        hasChanged
      ) {
        saveDraft(
          'pipeline',
          draftId,
          {
            pipelineData: {
              metadata,
              elements,
            },
          },
          metadata.name
        );
      }
    },
    1500,
    [metadata, elements]
  );

  const updateHistory = (data: IPipelineElement[]) => {
    if (currentHistoryPosition.current >= 0) {
      changeHistory.current.length = currentHistoryPosition.current + 1;
    }
    changeHistory.current.push(JSON.stringify(data));

    if (changeHistory.current.length > 10) {
      changeHistory.current.shift();
    } else {
      currentHistoryPosition.current += 1;
    }
  };

  const isDiagramValid = (data, isDefValid = true) => {
    return data.reduce((isValid, item) => {
      if ((item.type === 'queue' || item.type === 'start') && size(item.children) === 0) {
        isValid = false;
      }

      if (item.children && item.children.length > 0) {
        if (!isDiagramValid(item.children, isValid)) {
          isValid = false;
        }
      }

      if (item.isCompatible === false) {
        isValid = false;
      }

      return isValid;
    }, isDefValid);
  };

  const isDataValid = (data, fields: boolean) => {
    if (metadata['input-provider']) {
      if (!validateField('type-selector', metadata['input-provider'])) {
        return false;
      }

      if (size(metadata['input-provider-options'])) {
        if (!validateField('system-options', metadata['input-provider-options'])) {
          return false;
        }
      }
    }

    return (
      (fields ? true : isDiagramValid(data)) &&
      validateField('string', metadata.name) &&
      validateField('string', metadata.desc) &&
      validateField('string', metadata.target_dir)
    );
  };

  const handleMetadataChange: (name: string, value: any) => void = (name, value) => {
    setMetadata((cur) => ({
      ...cur,
      [name]: value,
    }));
  };

  const handleBackClick = async () => {
    setIsDiagramShown(false);
  };

  const handleSubmitClick = async () => {
    if (!isDiagramShown) {
      setIsDiagramShown(true);
      return;
    }

    let fixedMetadata = { ...metadata };

    if (size(metadata.groups) === 0) {
      delete fixedMetadata.groups;
    }

    const result = await callBackend(
      pipeline ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
      undefined,
      {
        iface_kind: 'pipeline',
        iface_id: interfaceId,
        orig_data: pipeline,
        no_data_return: !!onSubmitSuccess,
        data: {
          ...fixedMetadata,
          'input-provider-options': metadata['input-provider-options'],
          children: elements[0].children,
        },
      },
      t('Saving Pipeline...')
    );

    if (result.ok) {
      if (onSubmitSuccess) {
        onSubmitSuccess({
          ...metadata,
          'input-provider-options': metadata['input-provider-options'],
          children: elements[0].children,
        });
      }
      const fileName = getDraftId(pipeline, interfaceId);
      deleteDraft('pipeline', fileName, false);
      reset();
      resetAllInterfaceData('pipeline');
    }
  };

  const reset = (hard?: boolean) => {
    postMessage(Messages.RESET_CONFIG_ITEMS, {
      iface_id: interfaceId,
    });

    setElements(
      transformNodeData(
        [
          {
            type: 'start',
            children: hard ? [] : pipeline?.children || [],
          },
        ],
        ''
      )
    );

    if (hard) {
      setMetadata({
        name: null,
        desc: null,
        target_dir: null,
        groups: [],
        'input-provider': null,
        'input-provider-options': null,
      });
    } else {
      setMetadata({
        name: pipeline?.name,
        desc: pipeline?.desc,
        target_dir: pipeline?.target_dir,
        groups: pipeline?.groups || [],
        'input-provider': pipeline?.['input-provider'],
        'input-provider-options': pipeline?.['input-provider-options'],
      });
    }
  };

  const handleDataSubmit = (data) => {
    let dt = { ...data };
    dt = omit(dt, ['parent']);
    setElements((cur) => {
      let result = [...cur];
      // We are adding a child to a queue
      if (data.parentPath) {
        const children = get(result, `${data.parentPath}.children`);
        if (!children) {
          set(result, `${data.parentPath}.children`, [
            omit(data, ['parentPath', 'parent', 'isCompatible']),
          ]);
        } else {
          // Push the new item
          children.push(omit(data, ['parentPath', 'parent', 'isCompatible']));
        }
      } else {
        set(result, data.path, omit(data, ['parent', 'isCompatible']));
      }

      result = transformNodeData(result, '');

      return result;
    });
    setSelectedElement(null);
  };

  const filterRemovedElements = (data) =>
    data.reduce((newData, element) => {
      if (!element) {
        return newData;
      }
      if (element.children) {
        return [
          ...newData,
          {
            ...element,
            children: filterRemovedElements(element.children),
          },
        ];
      }

      return [...newData, element];
    }, []);

  const removeElement = (elementData: IPipelineElement) => {
    setElements((cur) => {
      let result = [...cur];

      set(result, elementData.nodeData.path, undefined);

      result = filterRemovedElements(result);
      result = transformNodeData(result, '');

      return result;
    });
  };

  if (!qorus_instance) {
    return (
      <ReqoreMessage title={t('NoInstanceTitle')} intent="warning">
        {t('NoInstance')}
      </ReqoreMessage>
    );
  }

  return (
    <>
      {!compatibilityChecked && (
        <StyledCompatibilityLoader>
          <Loader text={t('CheckingCompatibility')} />
        </StyledCompatibilityLoader>
      )}
      {selectedElement && (
        <ReqoreDrawer
          isOpen
          label={t('ManagePipeElement')}
          position="right"
          hidable
          flat={false}
          floating
          minSize="40vw"
          hasBackdrop={false}
          onClose={() => setSelectedElement(null)}
          contentStyle={{
            display: 'flex',
            flexFlow: 'column',
            overflow: 'hidden',
          }}
          size="50vw"
          actions={[
            {
              label: t('Delete element'),
              effect: NegativeColorEffect,
              responsive: false,
              icon: 'DeleteBinLine',
              onClick: () => {
                removeElement(selectedElement);
                setSelectedElement(null);
              },
            },
          ]}
        >
          <ReqoreTabs
            fill
            fillParent
            tabs={[
              { label: 'Configuration', id: 'configuration', icon: 'SettingsLine' },
              {
                label: 'Info',
                id: 'info',
                icon: 'InformationLine',
                disabled: !selectedElement.nodeData.name,
              },
            ]}
            activeTab={'configuration'}
            tabsPadding="vertical"
            padded={false}
            activeTabIntent="info"
            style={{ overflow: 'hidden' }}
          >
            <ReqoreTabsContent tabId="info">
              <InputOutputType
                inputProvider={{
                  interfaceName: selectedElement.nodeData.name,
                  interfaceKind: selectedElement.nodeData.type,
                }}
                outputProvider={{
                  interfaceName: selectedElement.nodeData.name,
                  interfaceKind: selectedElement.nodeData.type,
                }}
              />
            </ReqoreTabsContent>
            <ReqoreTabsContent tabId="configuration">
              <PipelineElementDialog
                key={selectedElement.nodeData.name}
                data={selectedElement.nodeData}
                parentData={selectedElement.parentData}
                onlyQueue={selectedElement.onlyQueue}
                onSubmit={handleDataSubmit}
                inputProvider={metadata['input-provider']}
                interfaceId={interfaceId}
              />
            </ReqoreTabsContent>
          </ReqoreTabs>
        </ReqoreDrawer>
      )}
      <Content
        bottomActions={[
          resetControl(() => {
            confirmAction(
              'ResetFieldsConfirm',
              () => {
                reset();
              },
              'Reset',
              'warning'
            );
          }),
          backControl(handleBackClick, { show: !!isDiagramShown }),
          nextControl(handleSubmitClick, {
            show: !isDiagramShown,
            disabled: !isDataValid(elements, !isDiagramShown),
          }),
          submitControl(handleSubmitClick, {
            show: isDiagramShown,
            disabled: !isDataValid(elements, !isDiagramShown),
          }),
        ]}
      >
        <ContentWrapper
          style={{
            display: isDiagramShown ? 'none' : 'flex',
          }}
        >
          <FieldWrapper
            name="selected-field"
            label={t('field-label-target_dir')}
            isValid={validateField('file-string', metadata.target_dir)}
          >
            <FileString
              onChange={handleMetadataChange}
              name="target_dir"
              value={metadata.target_dir}
              get_message={{
                action: 'creator-get-directories',
                object_type: 'target_dir',
              }}
              return_message={{
                action: 'creator-return-directories',
                object_type: 'target_dir',
                return_value: 'directories',
              }}
            />
          </FieldWrapper>
          <FieldWrapper
            name="selected-field"
            isValid={validateField('string', metadata.name)}
            label={t('field-label-name')}
            compact
          >
            <String onChange={handleMetadataChange} value={metadata.name} name="name" autoFocus />
          </FieldWrapper>
          <FieldWrapper
            name="selected-field"
            isValid={validateField('string', metadata.desc)}
            label={t('field-label-desc')}
            compact
          >
            <Field
              type="long-string"
              markdown
              onChange={handleMetadataChange}
              value={metadata.desc}
              name="desc"
            />
          </FieldWrapper>
          <FieldWrapper
            name="selected-field"
            isValid={
              metadata.groups.length === 0 ? true : validateField('select-array', metadata.groups)
            }
            info={t('Optional')}
            label={t('field-label-groups')}
            compact
          >
            <MultiSelect
              onChange={handleMetadataChange}
              get_message={{
                action: 'creator-get-objects',
                object_type: 'group',
              }}
              return_message={{
                action: 'creator-return-objects',
                object_type: 'group',
                return_value: 'objects',
              }}
              reference={{
                iface_kind: 'other',
                type: 'group',
              }}
              value={metadata.groups}
              name="groups"
            />
          </FieldWrapper>
          <FieldWrapper
            name="selected-field"
            type={t('Optional')}
            label={t('field-label-input-provider')}
            isValid={
              metadata['input-provider']
                ? validateField('type-selector', metadata['input-provider'])
                : true
            }
          >
            <ConnectorField
              value={metadata['input-provider']}
              isInitialEditing={!!pipeline || isFromDraft}
              name="input-provider"
              onChange={handleMetadataChange}
              providerType="inputs"
              isPipeline
            />
          </FieldWrapper>
          {metadata['input-provider'] && (
            <FieldWrapper
              name="selected-field"
              info={t('Optional')}
              label={t('field-label-input-provider-options')}
              isValid={validateField(
                'pipeline-options',
                metadata['input-provider-options'],
                null,
                true
              )}
            >
              <Options
                value={metadata?.['input-provider-options']}
                onChange={handleMetadataChange}
                name="input-provider-options"
                url="/pipeline"
              />
            </FieldWrapper>
          )}
        </ContentWrapper>
        <ContentWrapper
          style={{
            display: !isDiagramShown ? 'none' : 'flex',
          }}
        >
          <StyledDiagramWrapper
            id="pipeline-diagram"
            theme={theme}
            style={{
              border: !isDiagramValid(elements) ? `1px solid ${theme.intents.danger}` : undefined,
            }}
            onContextMenu={(e) => void e.preventDefault()}
          >
            <Tree
              data={cloneDeep(elements)}
              orientation="vertical"
              pathFunc="step"
              translate={{ x: window.innerWidth / 2 - 50, y: 100 }}
              nodeSize={{ x: 350, y: 120 }}
              transitionDuration={0}
              textLayout={{
                textAnchor: 'middle',
              }}
              separation={{
                siblings: 1,
                nonSiblings: 1,
              }}
              allowForeignObjects
              nodeLabelComponent={{
                render: (
                  <NodeLabel
                    onEditClick={setSelectedElement}
                    onAddClick={setSelectedElement}
                    onDeleteClick={(elementData) => removeElement(elementData)}
                    onAddQueueClick={handleDataSubmit}
                  />
                ),
                foreignObjectWrapper: {
                  width: '350px',
                  x: -(350 / 2),
                },
              }}
              collapsible={false}
              styles={{
                links: {
                  stroke: theme.intents.info,
                  strokeWidth: 2,
                },
                nodes: {
                  node: {
                    ellipse: {
                      stroke: '#a9a9a9',
                    },
                    rect: {
                      stroke: '#a9a9a9',
                      rx: 25,
                    },
                    name: {
                      stroke: '#333',
                      strokeWidth: 0.8,
                    },
                  },
                  leafNode: {
                    ellipse: {
                      stroke: '#a9a9a9',
                    },
                    rect: {
                      stroke: '#a9a9a9',
                      rx: 25,
                    },
                    name: {
                      stroke: '#333',
                      strokeWidth: 0.8,
                    },
                  },
                },
              }}
            />
          </StyledDiagramWrapper>
        </ContentWrapper>
      </Content>
    </>
  );
};

export default compose(withGlobalOptionsConsumer(), withMessageHandler())(PipelineView);
