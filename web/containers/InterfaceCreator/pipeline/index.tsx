import { Button, ButtonGroup, Callout, Classes, Colors, Intent, Tooltip } from '@blueprintjs/core';
import { cloneDeep } from 'lodash';
import get from 'lodash/get';
import omit from 'lodash/omit';
import set from 'lodash/set';
import size from 'lodash/size';
import React, { useContext, useEffect, useRef, useState } from 'react';
import Tree from 'react-d3-tree';
import { useDebounce, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled from 'styled-components';
import ConnectorField from '../../../components/Field/connectors';
import FileString from '../../../components/Field/fileString';
import MultiSelect from '../../../components/Field/multiSelect';
import String from '../../../components/Field/string';
import Options from '../../../components/Field/systemOptions';
import FieldLabel from '../../../components/FieldLabel';
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
import { StyledCompatibilityLoader, StyledToolbarWrapper } from '../fsm';
import { calculateFontSize } from '../fsm/state';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../panel';
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
  background: ${({ path }) => `url(${`${path}/images/tiny_grid.png`})`};
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

  return (
    <StyledNodeLabel
      name="pipeline-element"
      onClick={nodeData.type === 'start' ? undefined : () => onEditClick({ nodeData })}
      onContextMenu={(event) => {
        event.persist();
        event.preventDefault();

        let menu = { event, data: [] };

        if (nodeData.type !== 'start') {
          menu.data.unshift({
            item: t('Delete'),
            onClick: () => onDeleteClick({ nodeData }),
            icon: 'trash',
            intent: 'danger',
          });
          menu.data.unshift({
            item: t('Edit'),
            onClick: () => onEditClick({ nodeData }),
            icon: 'edit',
            intent: 'warning',
          });
        }

        const hasOnlyQueues = nodeData.children?.every((child) => child.type === 'queue');

        if (hasOnlyQueues) {
          menu.data.unshift({
            item: t('AddQueue'),
            onClick: () =>
              onAddQueueClick({
                parentPath: nodeData.path,
                name: null,
                children: [],
                _children: [],
                type: 'queue',
              }),
            icon: 'add',
            intent: 'none',
          });
        } else if (!size(nodeData.children)) {
          menu.data.unshift({
            item: t('AddElement'),
            onClick: () =>
              onAddClick({
                nodeData: { parentPath: nodeData.path },
                parentData: nodeData,
                onlyQueue: hasOnlyQueues,
              }),
            icon: 'add',
            intent: 'none',
          });
        }

        menu.data.unshift({
          title: nodeData.name || t('Start'),
        });

        addMenu(menu);
      }}
    >
      <span style={{ fontSize: calculateFontSize(nodeData.name) }}>{nodeData.name}</span>
      {nodeData.type !== 'start' && (
        <span
          style={{ fontSize: calculateFontSize(nodeData.name, true) }}
          className={Classes.TEXT_MUTED}
        >
          {nodeData.type}
        </span>
      )}
    </StyledNodeLabel>
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
          shapeProps: {
            width: '200px',
            height: '60px',
            x: -100,
            y: -30,
            fill: isCompatible === false ? '#fddcd4' : '#fff',
            stroke: isCompatible === false ? '#d13913' : '#a9a9a9',
          },
        };
      case 'queue':
        return {
          shape: 'ellipse',
          shapeProps: {
            rx: 100,
            ry: 30,
            fill: children?.length === 0 || isCompatible === false ? '#fddcd4' : '#fff',
            stroke: children?.length === 0 || isCompatible === false ? '#d13913' : '#a9a9a9',
          },
        };
      default:
        return {
          shape: 'circle',
          shapeProps: {
            r: 25,
            fill: '#d7d7d7',
            stroke: '#a9a9a9',
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

  useEffect(() => {
    (async () => {
      if (
        !metadata['input-provider'] ||
        validateField('type-selector', metadata['input-provider'])
      ) {
        setCompatibilityChecked(false);

        const newElements = await checkPipelineCompatibility(elements, metadata['input-provider']);

        setCompatibilityChecked(true);
        setElements(transformNodeData(newElements, ''));
      } else {
        Promise.resolve();
      }
    })();
  }, [metadata['input-provider']]);

  useDebounce(
    () => {
      const draftId = getDraftId(pipeline, interfaceId);

      if (
        draftId &&
        (hasValue(metadata.target_dir) ||
          hasValue(metadata.desc) ||
          hasValue(metadata.name) ||
          size(metadata.groups) ||
          size(metadata['input-provider']) ||
          size(metadata['input-provider-options']))
      ) {
        saveDraft(
          'pipeline',
          draftId,
          {
            pipelineData: {
              metadata,
              elements,
            },
            interfaceId,
            associatedInterface: pipeline?.yaml_file,
            isValid: isDataValid(elements, false),
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
      <Callout title={t('NoInstanceTitle')} icon="warning-sign" intent="warning">
        {t('NoInstance')}
      </Callout>
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
        <PipelineElementDialog
          data={selectedElement.nodeData}
          parentData={selectedElement.parentData}
          onlyQueue={selectedElement.onlyQueue}
          onClose={() => setSelectedElement(null)}
          onSubmit={handleDataSubmit}
          inputProvider={metadata['input-provider']}
          interfaceId={interfaceId}
        />
      )}
      <div
        id="pipeline-fields-wrapper"
        style={{
          display: isDiagramShown ? 'none' : 'initial',
          flex: 1,
          overflow: 'auto',
        }}
      >
        <>
          <FieldWrapper name="selected-field">
            <FieldLabel
              label={t('field-label-target_dir')}
              isValid={validateField('file-string', metadata.target_dir)}
            />
            <FieldInputWrapper>
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
            </FieldInputWrapper>
          </FieldWrapper>
          <FieldWrapper name="selected-field">
            <FieldLabel
              isValid={validateField('string', metadata.name)}
              label={t('field-label-name')}
            />
            <FieldInputWrapper>
              <String onChange={handleMetadataChange} value={metadata.name} name="name" />
            </FieldInputWrapper>
          </FieldWrapper>
          <FieldWrapper name="selected-field">
            <FieldLabel
              isValid={validateField('string', metadata.desc)}
              label={t('field-label-desc')}
            />
            <FieldInputWrapper>
              <String onChange={handleMetadataChange} value={metadata.desc} name="desc" />
            </FieldInputWrapper>
          </FieldWrapper>
          <FieldWrapper name="selected-field">
            <FieldLabel
              isValid={
                metadata.groups.length === 0 ? true : validateField('select-array', metadata.groups)
              }
              info={t('Optional')}
              label={t('field-label-groups')}
            />
            <FieldInputWrapper>
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
            </FieldInputWrapper>
          </FieldWrapper>
          <FieldWrapper name="selected-field">
            <FieldLabel
              info={t('Optional')}
              label={t('field-label-input-provider')}
              isValid={
                metadata['input-provider']
                  ? validateField('type-selector', metadata['input-provider'])
                  : true
              }
            />
            <FieldInputWrapper>
              <ConnectorField
                value={metadata['input-provider']}
                isInitialEditing={!!pipeline || isFromDraft}
                name="input-provider"
                onChange={handleMetadataChange}
                providerType="inputs"
              />
            </FieldInputWrapper>
          </FieldWrapper>
          {metadata['input-provider'] && (
            <FieldWrapper name="selected-field">
              <FieldLabel
                info={t('Optional')}
                label={t('field-label-input-provider-options')}
                isValid={validateField(
                  'pipeline-options',
                  metadata['input-provider-options'],
                  null,
                  true
                )}
              />
              <FieldInputWrapper>
                <Options
                  value={metadata?.['input-provider-options']}
                  onChange={handleMetadataChange}
                  name="input-provider-options"
                  url="/pipeline"
                />
              </FieldInputWrapper>
            </FieldWrapper>
          )}
        </>
      </div>
      <div
        style={{
          display: isDiagramShown ? 'flex' : 'none',
          flex: 1,
          overflow: 'hidden',
          flexFlow: 'column',
        }}
        ref={wrapperRef}
      >
        <StyledToolbarWrapper id="pipeline-toolbar">
          <ButtonGroup style={{ float: 'right' }}>
            <Button
              onClick={() => {
                currentHistoryPosition.current -= 1;
                setElements(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
              }}
              disabled={currentHistoryPosition.current <= 0}
              text={`(${currentHistoryPosition.current})`}
              icon="undo"
              name="pipeline-undo"
            />
            <Button
              onClick={() => {
                currentHistoryPosition.current += 1;
                setElements(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
              }}
              disabled={currentHistoryPosition.current === size(changeHistory.current) - 1}
              text={`(${size(changeHistory.current) - (currentHistoryPosition.current + 1)})`}
              icon="redo"
              name="pipeline-redo"
            />
          </ButtonGroup>
        </StyledToolbarWrapper>
        <StyledDiagramWrapper
          id="pipeline-diagram"
          path={image_path}
          style={{ border: !isDiagramValid(elements) ? `1px solid ${Colors.RED2}` : undefined }}
          onContextMenu={(e) => void e.preventDefault()}
        >
          {wrapperRef.current && (
            <Tree
              data={cloneDeep(elements)}
              orientation="vertical"
              pathFunc="straight"
              translate={{ x: window.innerWidth / 2 - 50, y: 100 }}
              nodeSize={{ x: 220, y: 110 }}
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
                  width: '200px',
                  height: '60px',
                  y: -30,
                  x: -100,
                },
              }}
              collapsible={false}
              styles={{
                links: {
                  stroke: '#a9a9a9',
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
          )}
        </StyledDiagramWrapper>
      </div>
      <ActionsWrapper>
        <div style={{ float: 'right', width: '100%' }}>
          <ButtonGroup fill>
            <Tooltip content={t('ResetTooltip')}>
              <Button
                text={t('Reset')}
                icon={'history'}
                onClick={() => {
                  confirmAction(
                    'ResetFieldsConfirm',
                    () => {
                      reset();
                    },
                    'Reset',
                    'warning'
                  );
                }}
              />
            </Tooltip>
            {isDiagramShown && (
              <Button
                text={t('Back')}
                onClick={handleBackClick}
                icon="chevron-left"
                name="pipeline-back"
              />
            )}
            <Button
              text={isDiagramShown ? t('Submit') : t('NextStep')}
              onClick={handleSubmitClick}
              disabled={!isDataValid(elements, !isDiagramShown)}
              icon={'tick'}
              name="interface-creator-submit-pipeline"
              intent={Intent.SUCCESS}
            />
          </ButtonGroup>
        </div>
      </ActionsWrapper>
    </>
  );
};

export default compose(withGlobalOptionsConsumer(), withMessageHandler())(PipelineView);
