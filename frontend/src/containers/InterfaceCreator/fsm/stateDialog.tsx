import { map } from 'lodash';
import find from 'lodash/find';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import shortid from 'shortid';
import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import BooleanField from '../../../components/Field/boolean';
import Connectors from '../../../components/Field/connectors';
import LongStringField from '../../../components/Field/longString';
import {
  PositiveColorEffect,
  SaveColorEffect,
  WarningColorEffect,
} from '../../../components/Field/multiPair';
import RadioField from '../../../components/Field/radioField';
import SelectField from '../../../components/Field/select';
import String from '../../../components/Field/string';
import Options from '../../../components/Field/systemOptions';
import FieldGroup from '../../../components/FieldGroup';
import { ContentWrapper, FieldWrapper } from '../../../components/FieldWrapper';
import { Messages } from '../../../constants/messages';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { getMaxExecutionOrderFromStates } from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withMessageHandler, { TPostMessage } from '../../../hocomponents/withMessageHandler';
import ConfigItemManager from '../../ConfigItemManager';
import ManageConfigItemsButton from '../../ConfigItemManager/manageButton';
import FSMView, { IFSMState, IFSMStates } from './';
import ConnectorSelector from './connectorSelector';
import { ConditionField, isConditionValid } from './transitionDialog';

export interface IFSMStateDialogProps {
  onClose: () => any;
  data: IFSMState;
  id: string;
  onSubmit: (id: string, newData: IFSMState) => void;
  otherStates: IFSMStates;
  deleteState?: (id: string, unfilled?: boolean) => any;
  fsmName?: string;
  interfaceId: string;
  postMessage: TPostMessage;
  disableInitial?: boolean;
}

export enum StateTypes {
  connector = 'connector',
  mapper = 'mapper',
  pipeline = 'pipeline',
  none = 'none',
  apicall = 'apicall',
  'search-single' = 'search-single',
  search = 'search',
  create = 'create',
  update = 'update',
  delete = 'delete',
  'send-message' = 'send-message',
}

export type TAction = keyof typeof StateTypes;

const FSMStateDialog: React.FC<IFSMStateDialogProps> = ({
  onClose,
  data,
  id,
  onSubmit,
  otherStates,
  deleteState,
  fsmName,
  target_dir,
  interfaceId,
  postMessage,
  disableInitial,
}) => {
  const [newData, setNewData] = useState<IFSMState>(data);
  const [actionType, setActionType] = useState<TAction>(data?.action?.type || 'none');
  const [blockLogicType, setBlockLogicType] = useState<'fsm' | 'custom'>('custom');
  const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);
  const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const t = useContext(TextContext);
  const { confirmAction, qorus_instance } = useContext(InitialContext);

  useUpdateEffect(() => {
    if (newData.action?.value?.['class']) {
      postMessage(Messages.GET_CONFIG_ITEMS, {
        iface_kind: 'fsm',
        iface_id: interfaceId,
        state_data: {
          id: newData.id,
          class_name: newData.action.value['class'],
        },
      });
    } else {
      postMessage(Messages.REMOVE_CONFIG_ITEMS, {
        iface_kind: 'fsm',
        iface_id: interfaceId,
        state_data: {
          id: newData.id,
        },
      });
    }
  }, [newData.action?.value?.['class']]);

  useUnmount(() => {
    if (data.isNew) {
      // If the name is empty and the original name was empty
      // delete this state
      if (!isDataValid()) {
        deleteState(id, true);
      }
      // If the user closed an existing state with invalid data
      // set the data to original data
    } else if (!isDataValid) {
      onSubmit(id, data);
    }
  });

  const handleDataUpdate = (name: string, value: any) => {
    setNewData((cur) => ({
      ...cur,
      [name]: value === 'none' ? null : value,
    }));

    if (name === 'initial') {
      if (value) {
        handleDataUpdate(
          'execution_order',
          data?.execution_order || getMaxExecutionOrderFromStates(otherStates) + 1
        );
      } else {
        handleDataUpdate('execution_order', null);
      }
    }

    if (name === 'type') {
      handleDataUpdate('name', null);
      handleDataUpdate('action', 'none');
      handleDataUpdate('input-type', null);
      handleDataUpdate('output-type', null);
      handleDataUpdate('id', undefined);
      handleDataUpdate('initial', false);
      setActionType('none');
    }
  };

  const isNameValid: (name: string) => boolean = (name) =>
    validateField('string', name) &&
    !find(otherStates, (state: IFSMState): boolean => state.name === name);

  const isDataValid: () => boolean = () => {
    if (newData.type === 'block') {
      return (
        isNameValid(newData.name) &&
        (blockLogicType === 'custom' ? size(newData.states) : validateField('string', newData.fsm))
      );
    }

    if (newData.type === 'if') {
      return (
        isNameValid(newData.name) &&
        isConditionValid(newData) &&
        (!newData['input-output-type'] ||
          validateField('type-selector', newData['input-output-type']))
      );
    }

    return (
      isNameValid(newData.name) &&
      isActionValid() &&
      (!newData['input-type'] || validateField('type-selector', newData['input-type'])) &&
      (!newData['output-type'] || validateField('type-selector', newData['output-type']))
    );
  };

  const isActionValid: () => boolean = () => {
    switch (actionType) {
      case 'mapper': {
        return !!newData?.action?.value;
      }
      case 'pipeline': {
        return !!newData?.action?.value;
      }
      case 'connector': {
        return !!newData?.action?.value?.['class'] && !!newData?.action?.value?.connector;
      }
      case 'apicall': {
        return validateField('api-call', newData?.action?.value);
      }
      case 'send-message': {
        return validateField('send-message', newData?.action?.value);
      }
      case 'search':
      case 'delete':
      case 'update':
      case 'create':
      case 'search-single': {
        return validateField(actionType, newData?.action?.value);
      }
      default: {
        return true;
      }
    }
  };

  const renderActionField = () => {
    switch (actionType) {
      case 'mapper': {
        return (
          <SelectField
            get_message={{
              action: 'creator-get-objects',
              object_type: 'mapper',
            }}
            return_message={{
              action: 'creator-return-objects',
              object_type: 'mapper',
              return_value: 'objects',
            }}
            onChange={(_name, value) => handleDataUpdate('action', { type: 'mapper', value })}
            value={newData?.action?.value}
            target_dir={target_dir}
            name="action"
            context={{
              default_values: newData?.injectedData
                ? {
                    name: `${newData.injectedData?.name ? `${newData.injectedData?.name}-` : ''}${
                      newData.injectedData?.from
                    }-${newData.injectedData?.to}`,
                    desc: `mapper to bridge ${newData.injectedData?.from} to ${
                      newData.injectedData?.to
                    }${newData.injectedData?.name ? ` in flow ${newData.injectedData?.name}` : ''}`,
                    version: '1.0',
                  }
                : {
                    version: '1.0',
                  },
            }}
            reference={{
              iface_kind: 'mapper',
            }}
          />
        );
      }
      case 'pipeline': {
        return (
          <SelectField
            get_message={{
              action: 'creator-get-objects',
              object_type: 'pipeline',
            }}
            return_message={{
              action: 'creator-return-objects',
              object_type: 'pipeline',
              return_value: 'objects',
            }}
            target_dir={target_dir}
            onChange={(_name, value) => handleDataUpdate('action', { type: 'pipeline', value })}
            value={newData?.action?.value}
            name="action"
            reference={{
              iface_kind: 'pipeline',
            }}
          />
        );
      }
      case 'connector': {
        return (
          <ConnectorSelector
            value={newData?.action?.value}
            target_dir={target_dir}
            onChange={(value) => handleDataUpdate('action', { type: 'connector', value })}
            types={['input', 'input-output', 'output']}
          />
        );
      }
      case 'apicall': {
        return (
          <Connectors
            name="apicall"
            inline
            minimal
            requiresRequest
            isInitialEditing={!!data?.action?.value}
            onChange={(_name, value) => handleDataUpdate('action', { type: 'apicall', value })}
            value={newData?.action?.value}
          />
        );
      }
      case 'send-message': {
        return (
          <Connectors
            name="send-message"
            inline
            minimal
            isMessage
            isInitialEditing={!!data?.action?.value}
            onChange={(_name, value) => handleDataUpdate('action', { type: 'send-message', value })}
            value={newData?.action?.value}
          />
        );
      }
      case 'search-single':
      case 'update':
      case 'delete':
      case 'create':
      case 'search': {
        return (
          <Connectors
            name={actionType}
            inline
            minimal
            key={actionType}
            recordType={actionType}
            isInitialEditing={!!data?.action?.value}
            onChange={(_name, value) => handleDataUpdate('action', { type: actionType, value })}
            value={newData?.action?.value}
          />
        );
      }
      default:
        return null;
    }
  };

  const isCustomBlockFirstPage = () => {
    return !isMetadataHidden && newData.type === 'block' && blockLogicType === 'custom';
  };

  const isCustomBlockSecondPage = () => {
    return isMetadataHidden && newData.type === 'block' && blockLogicType === 'custom';
  };

  return (
    <>
      <Content
        fill
        padded={false}
        minimal
        transparent
        bottomActions={[
          {
            label: t('Cancel'),
            icon: 'CloseLine',
            onClick: () => {
              onClose();
              deleteState(id, true);
            },
            show: !isMetadataHidden,
            responsive: false,
          },
          {
            label: t('Back'),
            onClick: () => {
              setIsMetadataHidden(false);
            },
            icon: 'ArrowLeftLine',
            show: isMetadataHidden,
          },
          {
            label: t('Reset'),
            icon: 'HistoryLine',
            onClick: () => {
              confirmAction(
                'ResetFieldsConfirm',
                () => {
                  postMessage(Messages.RESET_CONFIG_ITEMS, {
                    iface_id: interfaceId,
                    state_id: newData.id,
                  });
                  setActionType(data?.action?.type);
                  setNewData(data);
                },
                'Reset',
                'warning'
              );
            },
          },
          {
            as: ManageConfigItemsButton,
            props: {
              type: 'fsm',
              onClick: () => setShowConfigItemsManager(true),
            },
            show: !!newData.action?.value?.['class'],
          },
          {
            label: isCustomBlockFirstPage() ? t('Next') : t('Submit'),
            disabled: isCustomBlockFirstPage() ? false : !isDataValid() || isLoading,
            className: 'state-submit-button',
            icon: 'CheckLine',
            effect: isLoading
              ? WarningColorEffect
              : isCustomBlockFirstPage()
              ? PositiveColorEffect
              : SaveColorEffect,
            position: 'right',
            responsive: false,
            onClick: () => {
              if (!isCustomBlockFirstPage()) {
                setIsLoading(true);

                postMessage('submit-fsm-state', {
                  iface_id: interfaceId,
                  state_id: newData.id,
                });

                const modifiedData = { ...newData };

                if (blockLogicType === 'custom') {
                  modifiedData.fsm = undefined;
                } else {
                  modifiedData.states = undefined;
                }

                if (modifiedData.execution_order === null) {
                  delete modifiedData.execution_order;
                }

                if (modifiedData.type === 'block' && !modifiedData['block-type']) {
                  modifiedData['block-type'] = 'for';
                }

                if (modifiedData.type === 'if' && !modifiedData['input-output-type']) {
                  delete modifiedData['input-output-type'];
                }

                onSubmit(id, modifiedData);
              } else {
                setIsMetadataHidden(true);
              }
            },
          },
        ]}
      >
        <ContentWrapper
          style={{
            display: isCustomBlockSecondPage() ? 'none' : undefined,
          }}
        >
          <FieldGroup label={t('Info')} isValid={isNameValid(newData.name)}>
            <FieldWrapper label={t('Name')} isValid={isNameValid(newData.name)} compact>
              {newData.type === 'fsm' ? (
                <SelectField
                  get_message={{
                    action: 'creator-get-objects',
                    object_type: 'fsm',
                  }}
                  return_message={{
                    action: 'creator-return-objects',
                    object_type: 'fsm',
                    return_value: 'objects',
                  }}
                  reference={{ iface_kind: 'fsm' }}
                  predicate={(name) => fsmName !== name}
                  onChange={handleDataUpdate}
                  value={newData?.name}
                  name="name"
                />
              ) : (
                <String name="name" onChange={handleDataUpdate} value={newData.name} />
              )}
            </FieldWrapper>
            <FieldWrapper label={t('Description')} isValid compact>
              <LongStringField
                name="desc"
                onChange={handleDataUpdate}
                value={newData.desc}
                id="state-description-field"
              />
            </FieldWrapper>
            <FieldWrapper label={t('Type')} isValid compact>
              <SelectField
                defaultItems={
                  qorus_instance
                    ? [{ name: 'state' }, { name: 'fsm' }, { name: 'block' }]
                    : [{ name: 'state' }, { name: 'fsm' }]
                }
                disabled={newData.injected}
                onChange={handleDataUpdate}
                value={newData.type}
                name="type"
              />
            </FieldWrapper>
            <FieldWrapper label={t('Initial')} isValid compact>
              <BooleanField
                disabled={disableInitial}
                name="initial"
                onChange={handleDataUpdate}
                value={newData.initial}
              />
            </FieldWrapper>
          </FieldGroup>
          {newData.type === 'block' && (
            <FieldGroup label="Block configuration">
              <FieldWrapper label={t('field-label-block-logic')} isValid compact>
                <RadioField
                  name="block-logic"
                  onChange={(_name, value) => {
                    setBlockLogicType(value);
                  }}
                  value={blockLogicType}
                  items={[{ value: 'custom' }, { value: 'fsm' }]}
                />
              </FieldWrapper>
              <FieldWrapper label={t('field-label-block-type')} isValid compact>
                <RadioField
                  name="block-type"
                  onChange={handleDataUpdate}
                  value={newData?.['block-type'] || 'for'}
                  items={[{ value: 'for' }, { value: 'foreach' }, { value: 'while' }]}
                />
              </FieldWrapper>
              <FieldWrapper label={t('field-label-block-config')} isValid compact>
                <Options
                  name="block-config"
                  onChange={handleDataUpdate}
                  value={newData?.['block-config'] || {}}
                  url={`/block/${newData?.['block-type'] || 'for'}`}
                />
              </FieldWrapper>
            </FieldGroup>
          )}
          {newData.type === 'block' && blockLogicType === 'fsm' ? (
            <FieldWrapper label={t('FSM')} isValid={validateField('string', newData?.fsm)}>
              <SelectField
                get_message={{
                  action: 'creator-get-objects',
                  object_type: 'fsm',
                }}
                return_message={{
                  action: 'creator-return-objects',
                  object_type: 'fsm',
                  return_value: 'objects',
                }}
                reference={{
                  iface_kind: 'fsm',
                }}
                onChange={handleDataUpdate}
                value={newData?.fsm}
                name="fsm"
              />
            </FieldWrapper>
          ) : null}
          {newData.type === 'state' && (
            <>
              <FieldWrapper
                label={t('Action')}
                isValid={isActionValid()}
                type={t('Optional')}
                collapsible={false}
              >
                <SelectField
                  defaultItems={map(StateTypes, (stateType) =>
                    stateType !== 'none'
                      ? {
                          name: stateType,
                          desc: t(`field-desc-state-${stateType}`),
                        }
                      : null
                  ).filter((stateType) => stateType)}
                  fluid
                  onChange={(_name, value) => {
                    handleDataUpdate('action', value === data?.action?.type ? data?.action : null);
                    handleDataUpdate('id', data.id || shortid.generate());
                    setActionType(value);
                  }}
                  value={actionType}
                  placeholder={t('field-placeholder-action')}
                  disabled={newData.injected}
                  name="action"
                />
              </FieldWrapper>
              {actionType && actionType !== 'none' ? (
                <FieldWrapper
                  isValid={isActionValid()}
                  label={t('ActionValue')}
                  collapsible={false}
                >
                  {renderActionField()}
                </FieldWrapper>
              ) : null}
            </>
          )}
          {newData.type === 'block' ? (
            <FieldGroup label="Types">
              <FieldWrapper label={t('InputType')} isValid type={t('Optional')}>
                <Connectors
                  name="input-type"
                  isInitialEditing={data?.['input-type']}
                  onChange={handleDataUpdate}
                  value={newData?.['input-type']}
                />
              </FieldWrapper>
              <FieldWrapper label={t('OutputType')} isValid type={t('Optional')}>
                <Connectors
                  name="output-type"
                  isInitialEditing={data?.['output-type']}
                  onChange={handleDataUpdate}
                  value={newData?.['output-type']}
                />
              </FieldWrapper>
            </FieldGroup>
          ) : null}
          {newData.type === 'if' && (
            <FieldGroup label="Condition configuration">
              <ConditionField onChange={handleDataUpdate} data={newData} required />
              <FieldWrapper label={t('InputOutputType')} isValid type={t('Optional')}>
                <Connectors
                  name="input-output-type"
                  isInitialEditing={data['input-output-type']}
                  onChange={handleDataUpdate}
                  value={newData['input-output-type']}
                />
              </FieldWrapper>
            </FieldGroup>
          )}
        </ContentWrapper>
        {isCustomBlockSecondPage() ? (
          <FSMView
            embedded
            states={newData.states}
            setStates={(func) => {
              if (typeof func === 'function') {
                handleDataUpdate('states', func(newData.states));
              } else {
                handleDataUpdate('states', func);
              }
            }}
            parentStateName={newData.name}
            defaultInterfaceId={interfaceId}
            onStatesChange={(states) => {
              handleDataUpdate('states', states);
            }}
          />
        ) : null}
      </Content>
      {showConfigItemsManager && (
        <CustomDialog
          isOpen
          label={t('ConfigItemsManager')}
          onClose={() => setShowConfigItemsManager(false)}
        >
          <ConfigItemManager
            type="fsm"
            stateData={{
              id: newData.id,
              class_name: newData.action?.value?.['class'],
            }}
            interfaceId={interfaceId}
            disableAdding
          />
        </CustomDialog>
      )}
    </>
  );
};

export default withMessageHandler()(FSMStateDialog);
