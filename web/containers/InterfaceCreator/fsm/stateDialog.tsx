import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import find from 'lodash/find';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import shortid from 'shortid';
import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import BooleanField from '../../../components/Field/boolean';
import Connectors from '../../../components/Field/connectors';
import RadioField from '../../../components/Field/radioField';
import SelectField from '../../../components/Field/select';
import String from '../../../components/Field/string';
import Options from '../../../components/Field/systemOptions';
import FieldGroup from '../../../components/FieldGroup';
import FieldLabel from '../../../components/FieldLabel';
import { Messages } from '../../../constants/messages';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { getMaxExecutionOrderFromStates } from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withMessageHandler, { TPostMessage } from '../../../hocomponents/withMessageHandler';
import ConfigItemManager from '../../ConfigItemManager';
import ManageConfigItemsButton from '../../ConfigItemManager/manageButton';
import { ActionsWrapper, ContentWrapper, FieldInputWrapper, FieldWrapper } from '../panel';
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

export type TAction =
  | 'connector'
  | 'mapper'
  | 'pipeline'
  | 'none'
  | 'apicall'
  | 'search-single'
  | 'search'
  | 'create'
  | 'update'
  | 'delete';

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

  useEffect(() => {
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
            isRecordSearch={actionType === 'search-single' || actionType === 'search'}
            isRecordUpdate={actionType === 'update'}
            isRecordDelete={actionType === 'delete'}
            isRecordCreate={actionType === 'create'}
            isMultiRecordSearch={actionType === 'search'}
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

  return (
    <>
      <CustomDialog
        onClose={() => {
          // If the name is empty and the original name was empty
          // delete this state
          if (
            (data.type === 'fsm' && !data.name) ||
            (data.type === 'state' && !data.action?.value) ||
            (data.type === 'block' && size(data.states) === 0)
          ) {
            deleteState(id, true);
          }
          onClose();
        }}
        transitionName={newData.type === 'block' ? 'noop' : undefined}
        transitionDuration={newData.type === 'block' ? 0 : undefined}
        isOpen
        title={`${t('Editing')} ${newData.type} "${newData.name}"`}
        style={{
          width: newData.type === 'block' ? '80vw' : '80vw',
          paddingBottom: 0,
          height: newData.type === 'block' ? '80vh' : undefined,
        }}
      >
        <Content style={{ padding: 10, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
          <ContentWrapper
            style={{ display: 'flex', flexFlow: 'column', paddingRight: 0, position: 'relative' }}
          >
            <div
              style={{
                display: isMetadataHidden ? 'none' : 'block',
                height: newData.type === 'block' && blockLogicType === 'custom' ? 300 : 'auto',
                overflow: 'auto',
              }}
            >
              <FieldWrapper padded>
                <FieldLabel label={t('Name')} isValid={isNameValid(newData.name)} />
                <FieldInputWrapper>
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
                </FieldInputWrapper>
              </FieldWrapper>
              <FieldGroup>
                <FieldWrapper padded>
                  <FieldLabel label={t('Type')} isValid />
                  <FieldInputWrapper>
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
                  </FieldInputWrapper>
                </FieldWrapper>
                <FieldWrapper padded>
                  <FieldLabel label={t('Initial')} isValid />
                  <FieldInputWrapper>
                    <BooleanField
                      disabled={disableInitial}
                      name="initial"
                      onChange={handleDataUpdate}
                      value={newData.initial}
                    />
                  </FieldInputWrapper>
                </FieldWrapper>
              </FieldGroup>
              {newData.type === 'block' && (
                <>
                  <FieldGroup>
                    <FieldWrapper padded>
                      <FieldLabel label={t('field-label-block-logic')} isValid />
                      <FieldInputWrapper>
                        <RadioField
                          name="block-logic"
                          onChange={(_name, value) => {
                            setBlockLogicType(value);
                          }}
                          value={blockLogicType}
                          items={[{ value: 'custom' }, { value: 'fsm' }]}
                        />
                      </FieldInputWrapper>
                    </FieldWrapper>
                    <FieldWrapper padded>
                      <FieldLabel label={t('field-label-block-type')} isValid />
                      <FieldInputWrapper>
                        <RadioField
                          name="block-type"
                          onChange={handleDataUpdate}
                          value={newData?.['block-type'] || 'for'}
                          items={[{ value: 'for' }, { value: 'foreach' }, { value: 'while' }]}
                        />
                      </FieldInputWrapper>
                    </FieldWrapper>
                  </FieldGroup>
                  <FieldWrapper padded>
                    <FieldLabel label={t('field-label-block-config')} isValid />
                    <FieldInputWrapper>
                      <Options
                        name="block-config"
                        onChange={handleDataUpdate}
                        value={newData?.['block-config'] || {}}
                        url={`/block/${newData?.['block-type'] || 'for'}`}
                      />
                    </FieldInputWrapper>
                  </FieldWrapper>
                </>
              )}
              {newData.type === 'block' && blockLogicType === 'fsm' ? (
                <FieldWrapper padded>
                  <FieldLabel label={t('FSM')} isValid={validateField('string', newData?.fsm)} />
                  <FieldInputWrapper>
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
                  </FieldInputWrapper>
                </FieldWrapper>
              ) : null}
              {newData.type === 'state' && (
                <>
                  <FieldWrapper padded>
                    <FieldLabel
                      label={t('Action')}
                      isValid={isActionValid()}
                      info={t('Optional')}
                    />
                    <FieldGroup transparent>
                      <FieldInputWrapper>
                        <RadioField
                          name="action"
                          onChange={(_name, value) => {
                            handleDataUpdate(
                              'action',
                              value === data?.action?.type ? data?.action : null
                            );
                            handleDataUpdate('id', data.id || shortid.generate());
                            setActionType(value);
                          }}
                          value={actionType}
                          disabled={newData.injected}
                          items={[
                            { isDivider: true, title: 'Data providers' },
                            { value: 'mapper' },
                            { value: 'pipeline' },
                            { value: 'connector' },
                            { value: 'apicall' },
                          ]}
                        />
                      </FieldInputWrapper>
                      <FieldInputWrapper>
                        <RadioField
                          name="action"
                          onChange={(_name, value) => {
                            handleDataUpdate(
                              'action',
                              value === data?.action?.type ? data?.action : null
                            );
                            handleDataUpdate('id', data.id || shortid.generate());
                            setActionType(value);
                          }}
                          value={actionType}
                          disabled={newData.injected}
                          items={[
                            { isDivider: true, title: 'Record management' },
                            { value: 'search-single' },
                            { value: 'search' },
                            { value: 'create' },
                            { value: 'update' },
                            { value: 'delete' },
                          ]}
                        />
                      </FieldInputWrapper>
                    </FieldGroup>
                  </FieldWrapper>
                  {actionType && actionType !== 'none' ? (
                    <FieldWrapper padded>
                      <FieldLabel isValid info={t('ActionValue')} />
                      {renderActionField()}
                    </FieldWrapper>
                  ) : null}
                </>
              )}
              {newData.type === 'block' ? (
                <>
                  <FieldWrapper padded>
                    <FieldLabel label={t('InputType')} isValid info={t('Optional')} />
                    <FieldInputWrapper>
                      <Connectors
                        name="input-type"
                        isInitialEditing={data?.['input-type']}
                        onChange={handleDataUpdate}
                        value={newData?.['input-type']}
                      />
                    </FieldInputWrapper>
                  </FieldWrapper>
                  <FieldWrapper padded>
                    <FieldLabel label={t('OutputType')} isValid info={t('Optional')} />
                    <FieldInputWrapper>
                      <Connectors
                        name="output-type"
                        isInitialEditing={data?.['output-type']}
                        onChange={handleDataUpdate}
                        value={newData?.['output-type']}
                      />
                    </FieldInputWrapper>
                  </FieldWrapper>
                </>
              ) : null}
              {newData.type === 'if' && (
                <>
                  <ConditionField onChange={handleDataUpdate} data={newData} required />
                  <FieldWrapper padded>
                    <FieldLabel label={t('InputOutputType')} isValid info={t('Optional')} />
                    <FieldInputWrapper>
                      <Connectors
                        name="input-output-type"
                        isInitialEditing={data['input-output-type']}
                        onChange={handleDataUpdate}
                        value={newData['input-output-type']}
                      />
                    </FieldInputWrapper>
                  </FieldWrapper>
                </>
              )}
            </div>
            {newData.type === 'block' && blockLogicType === 'custom' ? (
              <FSMView
                embedded
                isExternalMetadataHidden={isMetadataHidden}
                onHideMetadataClick={setIsMetadataHidden}
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
          </ContentWrapper>
          <ActionsWrapper style={{ padding: '10px' }}>
            <ButtonGroup fill>
              <Tooltip content={t('ResetTooltip')}>
                <Button
                  text={t('Reset')}
                  icon={'history'}
                  onClick={() => {
                    confirmAction(
                      'ResetFieldsConfirm',
                      () => {
                        postMessage(Messages.RESET_CONFIG_ITEMS, {
                          iface_id: interfaceId,
                          state_id: id,
                        });
                        setActionType(data?.action?.type);
                        setNewData(data);
                      },
                      'Reset',
                      'warning'
                    );
                  }}
                />
              </Tooltip>
              {newData.action?.value?.['class'] && (
                <ManageConfigItemsButton
                  type="fsm"
                  key={newData.action.value['class']}
                  onClick={() => setShowConfigItemsManager(true)}
                />
              )}
              <Button
                text={t('Submit')}
                disabled={!isDataValid()}
                icon="tick"
                loading={isLoading}
                name="fsm-submit-state"
                intent={isLoading ? Intent.WARNING : Intent.SUCCESS}
                onClick={() => {
                  setIsLoading(true);

                  postMessage('submit-fsm-state', {
                    iface_id: interfaceId,
                    state_id: id,
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
                }}
              />
            </ButtonGroup>
          </ActionsWrapper>
        </Content>
      </CustomDialog>
      {showConfigItemsManager && (
        <CustomDialog
          isOpen
          title={t('ConfigItemsManager')}
          onClose={() => setShowConfigItemsManager(false)}
          style={{ width: '80vw', backgroundColor: '#fff' }}
        >
          <ConfigItemManager
            type="fsm"
            stateData={{ id: newData.id, class_name: newData.action?.value?.['class'] }}
            interfaceId={interfaceId}
            disableAdding
          />
        </CustomDialog>
      )}
    </>
  );
};

export default withMessageHandler()(FSMStateDialog);
