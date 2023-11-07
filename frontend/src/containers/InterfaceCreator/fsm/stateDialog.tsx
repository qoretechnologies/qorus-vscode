import { ReqoreMessage, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { forEach, omit, reduce } from 'lodash';
import size from 'lodash/size';
import React, { useCallback, useContext, useMemo, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import Connectors, { IProviderType } from '../../../components/Field/connectors';
import RadioField from '../../../components/Field/radioField';
import { default as Select, default as SelectField } from '../../../components/Field/select';
import Options from '../../../components/Field/systemOptions';
import FieldGroup from '../../../components/FieldGroup';
import { ContentWrapper, FieldWrapper } from '../../../components/FieldWrapper';
import { Messages } from '../../../constants/messages';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { getStatesForTemplates, getVariable, removeFSMState } from '../../../helpers/fsm';
import { getMaxExecutionOrderFromStates } from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withMessageHandler, { TPostMessage } from '../../../hocomponents/withMessageHandler';
import { useFetchAutoVarContext } from '../../../hooks/useFetchAutoVarContext';
import ConfigItemManager from '../../ConfigItemManager';
import ManageConfigButton from '../../ConfigItemManager/manageButton';
import FSMView, {
  IFSMMetadata,
  IFSMState,
  IFSMStates,
  TAppAndAction,
  TFSMVariables,
  TVariableActionValue,
} from './';
import { QodexActionExec } from './ActionExec';
import { QodexAppActionOptions } from './AppActionOptions';
import ConnectorSelector from './connectorSelector';
import { ConditionField } from './transitionDialog';

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
  metadata?: IFSMMetadata;
  blockLogicType?: 'fsm' | 'custom';
  setBlockLogicType?: (type: 'fsm' | 'custom') => void;
  isMetadatHidden?: boolean;
  setIsMetadataHidden?: (value: boolean) => void;
  isLoading?: boolean;
  actionType?: TAction;
  setActionType?: (type: TAction) => void;
  isCustomBlockSecondPage: boolean;
  isNameValid: boolean;
  isActionValid: boolean;
}

export enum StateTypes {
  if = 'if',
  fsm = 'fsm',
  while = 'while',
  for = 'for',
  transaction = 'transaction',
  foreach = 'foreach',
  action = 'action',
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
  'var-action' = 'var-action',
}

export type TAction = keyof typeof StateTypes;

const FSMStateDialog: React.FC<IFSMStateDialogProps> = ({
  data,
  id,
  onSubmit,
  otherStates,
  fsmName,
  target_dir,
  interfaceId,
  postMessage,
  disableInitial,
  metadata,
  blockLogicType,
  setBlockLogicType,
  actionType,
  setActionType,
  isNameValid,
  isCustomBlockSecondPage,
  isActionValid,
  isMetadatHidden,
  setIsMetadataHidden,
}) => {
  const [newData, setNewData] = useState<IFSMState>(data);
  const t = useContext(TextContext);
  const { qorus_instance } = useContext(InitialContext);
  const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);

  useUpdateEffect(() => {
    onSubmit(id, omit(newData, ['transitions']));
  }, [newData]);

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

  const autoVars = useFetchAutoVarContext(
    newData['block-config']?.['data-provider']?.value,
    'transaction-block'
  );

  const handleDataUpdate = (name: string, value: any) => {
    if (typeof value === 'undefined') {
      setNewData((cur) => omit(cur, [name]));
      return;
    }

    if (name === 'metadata') {
      // Remove the readonly global variables
      const globalvar = reduce<TFSMVariables, TFSMVariables>(
        value.globalvar,
        (newGlobal, val, key): TFSMVariables => {
          if (!val.readOnly) {
            return {
              ...newGlobal,
              [key]: val,
            };
          }

          return newGlobal;
        },
        {}
      );

      setNewData((cur) => ({
        ...cur,
        globalvar,
        localvar: value?.localvar,
      }));

      return;
    }

    setNewData((cur) => ({
      ...cur,
      [name]: value === 'none' ? undefined : value,
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

  const handleAppActionFieldChange = useCallback(
    (name, value) => {
      const actionValue = newData.action?.value as TAppAndAction;

      handleDataUpdate('action', {
        type: 'action',
        value: {
          ...actionValue,
          [name]: value,
        },
      });
    },
    [newData.action?.value]
  );

  const statesForTemplates = useMemo(() => {
    return getStatesForTemplates(newData.keyId, otherStates);
  }, [newData.keyId, JSON.stringify(otherStates)]);

  const renderActionField = () => {
    switch (actionType) {
      case 'var-action': {
        const currentValue = newData?.action?.value as TVariableActionValue;
        const actionValueType = currentValue?.action_type;
        // We need to get the value from the variable
        const variableData: { value: IProviderType } = getVariable(
          currentValue?.var_name,
          currentValue?.var_type,
          metadata
        );
        // We need to combine the variable value & the action value
        const value = {
          ...variableData.value,
          ...currentValue,
        };

        const getActionValueTypeItems = () => {
          const items = [];

          if (value.supports_read) {
            items.push({ name: 'search' });
            items.push({ name: 'search-single' });
          }

          if (value.supports_create) {
            items.push({ name: 'create' });
          }

          if (value.supports_update) {
            items.push({ name: 'update' });
          }

          if (value.supports_delete) {
            items.push({ name: 'delete' });
          }

          if (value.supports_messages) {
            items.push({ name: 'send-message' });
          }

          if (value.supports_request) {
            items.push({ name: 'apicall' });
          }

          if (value.transaction_management) {
            items.push({ name: 'transaction' });
          }

          return items;
        };

        return (
          <>
            <Select
              value={actionValueType}
              fluid
              description="The action to perform on the variable"
              defaultItems={getActionValueTypeItems()}
              className="fsm-action-type-selector"
              onChange={(_name, value) =>
                handleDataUpdate('action', {
                  type: actionType,
                  value: { ...currentValue, action_type: value },
                })
              }
            />
            <ReqoreVerticalSpacer height={10} />

            {actionValueType ? (
              <Connectors
                name={actionValueType}
                // If the VARIABLE itself has search options, we need to disable the search options
                // so the user can't change them
                disableSearchOptions={!!variableData.value.search_options}
                inline
                minimal
                isMessage={actionValueType === 'send-message'}
                requiresRequest={actionValueType === 'apicall'}
                key={actionValueType}
                recordType={actionValueType}
                isInitialEditing={!!data?.action?.value}
                readOnly
                info={
                  <>
                    <ReqoreMessage intent="info">
                      This provider is read only because it is defined in a variable. You can edit
                      the variable to change the provider configuration.
                    </ReqoreMessage>
                    <ReqoreVerticalSpacer height={10} />
                  </>
                }
                onChange={(_name, providerValue: IProviderType) => {
                  // We need to remove the duplicate data from the providerValue
                  const {
                    'search-single_args': searchSingleArgs,
                    args,
                    create_args,
                    create_args_freeform,
                    is_api_call,
                    message,
                    search_args,
                    search_options,
                    update_args,
                    delete_args,
                    use_args,
                    message_id,
                    options,
                  } = providerValue;

                  handleDataUpdate('action', {
                    type: actionType,
                    value: {
                      ...currentValue,
                      ...{
                        'search-single_args': searchSingleArgs,
                        args,
                        create_args,
                        is_api_call,
                        message,
                        search_args,
                        search_options,
                        create_args_freeform,
                        update_args,
                        delete_args,
                        use_args,
                        message_id,
                        options,
                      },
                    },
                  });
                }}
                value={value}
              />
            ) : null}
            {actionValueType && actionValueType === 'transaction' ? (
              <>
                <ReqoreMessage intent="info">
                  Please select the transaction action you want to perform
                </ReqoreMessage>
                <ReqoreVerticalSpacer height={10} />
                <Select
                  value={value?.transaction_action}
                  defaultItems={[
                    { name: 'begin-transaction', desc: 'Begin a transaction' },
                    { name: 'commit', desc: 'Commit a transaction' },
                    { name: 'rollback', desc: 'Rollback a transaction' },
                  ]}
                  onChange={(_name, value) =>
                    handleDataUpdate('action', {
                      type: actionType,
                      value: { ...currentValue, transaction_action: value },
                    })
                  }
                />
              </>
            ) : null}
          </>
        );
      }
      case 'action': {
        const actionValue = newData.action?.value as TAppAndAction;

        return (
          <>
            <QodexAppActionOptions
              appName={actionValue?.app}
              actionName={actionValue?.action}
              connectedStates={statesForTemplates}
              value={actionValue?.options}
              onChange={handleAppActionFieldChange}
            />
            <ReqoreVerticalSpacer height={10} />
            <QodexActionExec
              appName={actionValue?.app}
              actionName={actionValue?.action}
              options={actionValue?.options}
            />
          </>
        );
      }
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
            placeholder="Select or create a Mapper"
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

  const buildVariables = useCallback(() => {
    // We need to combine the variables from the metadata with the current
    // variables, but the variables from metadata need to be readonly

    const variables: {
      globalvar?: TFSMVariables;
      localvar?: TFSMVariables;
      autovar?: TFSMVariables;
    } = {};

    if (metadata?.globalvar) {
      variables.globalvar = reduce<TFSMVariables, TFSMVariables>(
        metadata?.globalvar,
        (newGlobal, item, variableName): TFSMVariables => ({
          ...newGlobal,
          [variableName]: {
            ...item,
            readOnly: true,
          },
        }),
        {}
      );
    }

    if (newData?.globalvar) {
      variables.globalvar = {
        ...variables.globalvar,
        ...newData.globalvar,
      };
    }

    if (newData?.localvar) {
      variables.localvar = newData.localvar;
    }

    variables.autovar = autoVars.value;

    // Check that for every state created from an autovar,
    // if the autovar is still present
    if (size(newData.states) && autoVars.loading === false) {
      const statesToRemove = [];

      forEach(newData.states, (state: IFSMState, id: string) => {
        if (
          state.action?.type === 'var-action' &&
          (state.action?.value as TVariableActionValue)?.var_type === 'autovar' &&
          !variables?.autovar?.[(state.action?.value as TVariableActionValue).var_name]
        ) {
          statesToRemove.push(id);
        }
      });

      if (size(statesToRemove)) {
        let newStates = newData.states;

        statesToRemove.forEach((stateId) => {
          newStates = removeFSMState(newStates, stateId, interfaceId);
        });

        setNewData({
          ...newData,
          states: newStates,
        });
      }
    }

    return variables;
  }, [metadata.globalvar, newData.globalvar, newData.localvar, autoVars.value, newData.states]);

  return (
    <>
      <Content fill padded={false} flat transparent minimal={false}>
        <ContentWrapper
          style={{
            display: isCustomBlockSecondPage ? 'none' : undefined,
          }}
        >
          {newData.type === 'fsm' && (
            <FieldWrapper label={t('Name')} isValid={isNameValid} compact>
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
            </FieldWrapper>
          )}

          {newData.type === 'block' && (
            <>
              <FieldGroup label="Block configuration">
                <FieldWrapper label={t('field-label-block-logic')} isValid compact>
                  <RadioField
                    name="block-logic"
                    onChange={(_name, value) => {
                      setBlockLogicType(value);
                    }}
                    value={blockLogicType}
                    items={[
                      { value: 'custom', title: 'Inline Implementation' },
                      { value: 'fsm', title: 'Use Existing FSM' },
                    ]}
                  />
                </FieldWrapper>
                <FieldWrapper label={t('field-label-block-type')} isValid compact>
                  <RadioField
                    name="block-type"
                    onChange={handleDataUpdate}
                    value={newData?.['block-type'] || 'for'}
                    items={[
                      { value: 'for' },
                      { value: 'foreach' },
                      { value: 'while' },
                      { value: 'transaction' },
                    ]}
                  />
                </FieldWrapper>
              </FieldGroup>
              <FieldWrapper label={t('field-label-block-config')} isValid compact>
                <Options
                  name="block-config"
                  onChange={handleDataUpdate}
                  value={newData?.['block-config']}
                  url={`/block/${newData?.['block-type'] || 'for'}`}
                />
              </FieldWrapper>
            </>
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
          {newData.type === 'state' ? (
            <>
              {actionType && actionType !== 'none' ? (
                <FieldWrapper collapsible={false} compact>
                  {renderActionField()}
                  {newData.action?.value?.class && isActionValid ? (
                    <>
                      <ReqoreVerticalSpacer height={10} />
                      <ManageConfigButton
                        fluid
                        {...{
                          type: 'fsm',
                          onClick: () => setShowConfigItemsManager(true),
                          state_data: {
                            id: newData.id,
                            class_name: newData.action?.value?.['class'],
                          },
                          iface_id: interfaceId,
                        }}
                      />
                    </>
                  ) : null}
                </FieldWrapper>
              ) : null}
            </>
          ) : null}
          {newData.type === 'block' && newData['block-type'] !== 'transaction' ? (
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
        {isCustomBlockSecondPage ? (
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
            onHideMetadataClick={setIsMetadataHidden}
            metadata={buildVariables()}
            setMetadata={(data) => {
              if (typeof data === 'function') {
                handleDataUpdate('metadata', data(newData));
              } else {
                handleDataUpdate('metadata', data);
              }
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

export default withMessageHandler()(FSMStateDialog) as React.FC<IFSMStateDialogProps>;
