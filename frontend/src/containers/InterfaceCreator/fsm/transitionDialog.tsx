import { Button, ButtonGroup, Callout, Intent, Spinner, Tooltip } from '@blueprintjs/core';
import cloneDeep from 'lodash/cloneDeep';
import every from 'lodash/every';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import uniq from 'lodash/uniq';
import React, { useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';
import { IFSMStates, IFSMTransition } from '.';
import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import MultiSelect from '../../../components/Field/multiSelect';
import RadioField from '../../../components/Field/radioField';
import String from '../../../components/Field/string';
import FieldLabel from '../../../components/FieldLabel';
import {
  ActionsWrapper,
  ContentWrapper,
  FieldInputWrapper,
  FieldWrapper,
} from '../../../components/FieldWrapper';
import Spacer from '../../../components/Spacer';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import ConnectorSelector from './connectorSelector';

export interface IFSMTransitionDialogProps {
  onClose: () => any;
  states: IFSMStates;
  onSubmit: (newData: IModifiedTransitions) => void;
  editingData: { stateId: number; index: number }[];
}

export type TTransitionCondition = 'custom' | 'connector' | 'none';

export interface IModifiedTransition {
  name: string;
  data: IFSMTransition;
}

export interface IModifiedTransitions {
  [id: string]: IModifiedTransition;
}

const StyledTransitionWrapper = styled.div`
  padding-top: 10;

  h3 {
    padding-top: 10px;
  }

  &:not(:first-child) {
    margin-bottom: 10px;
    border-top: 1px solid #eee;
  }
`;

export const getConditionType: (condition: any) => TTransitionCondition = (condition) =>
  condition === null || condition === undefined
    ? 'none'
    : typeof condition === 'object'
    ? 'connector'
    : 'custom';

export const isConditionValid: (transitionData: IFSMTransition) => boolean = (transitionData) => {
  const condition = getConditionType(transitionData.condition);

  if (condition === 'connector') {
    return !!transitionData?.condition?.['class'] && !!transitionData?.condition?.connector;
  }

  if (condition === 'custom') {
    return validateField('string', transitionData?.condition);
  }

  return true;
};

export const renderConditionField: (
  conditionType: TTransitionCondition,
  transitionData: IFSMTransition,
  onChange: any
) => any = (conditionType, transitionData, onChange) => {
  switch (conditionType) {
    case 'connector': {
      return (
        <ConnectorSelector
          value={transitionData?.condition}
          onChange={(value) => onChange('condition', value)}
          types={['condition']}
        />
      );
    }
    case 'custom': {
      return (
        <String
          name="condition"
          onChange={(name, value) => onChange(name, value)}
          value={transitionData?.condition}
        />
      );
    }
    default:
      return null;
  }
};

export const ConditionField = ({ data, onChange, required }) => {
  const t = useContext(TextContext);

  const conditionType = getConditionType(data.condition);

  return (
    <>
      <FieldWrapper padded>
        <FieldLabel label={t('Condition')} isValid={isConditionValid(data)} info={t('Optional')} />
        <FieldInputWrapper>
          <RadioField
            name="conditionType"
            onChange={(_name, value) => {
              onChange(
                'condition',
                value === 'none' ? null : value === 'custom' ? '' : { class: null }
              );
            }}
            value={conditionType || 'none'}
            items={
              required
                ? [{ value: 'custom' }, { value: 'connector' }]
                : [{ value: 'custom' }, { value: 'connector' }, { value: 'none' }]
            }
          />
          {conditionType && conditionType !== 'none' ? (
            <>
              <Spacer size={20} />
              {renderConditionField(conditionType, data, onChange)}
            </>
          ) : null}
        </FieldInputWrapper>
      </FieldWrapper>
      {conditionType === 'custom' && (
        <FieldWrapper padded>
          <FieldLabel
            label={t('field-label-lang')}
            isValid={validateField('string', data?.language || 'qore')}
          />
          <FieldInputWrapper>
            <RadioField
              name="language"
              onChange={(name, value) => {
                onChange(name, value);
              }}
              value={data?.language || 'qore'}
              items={[
                {
                  value: 'qore',
                  icon_filename: 'qore-106x128.png',
                },
                {
                  value: 'python',
                  icon_filename: 'python-129x128.png',
                },
              ]}
            />
          </FieldInputWrapper>
        </FieldWrapper>
      )}
    </>
  );
};

export const TransitionEditor = ({ onChange, transitionData, errors, qorus_instance }) => {
  const t = useContext(TextContext);

  const renderErrorsField: (transitionData: IFSMTransition) => any = (transitionData) => {
    if (qorus_instance && !errors) {
      return <Spinner size={14} />;
    }

    return (
      <MultiSelect
        simple
        default_items={[{ name: 'All' }, ...(errors || [])]}
        name="errors"
        onChange={(_name, value) => onChange('errors', value)}
        value={transitionData?.errors}
      />
    );
  };

  return (
    <>
      {transitionData.branch && (
        <FieldWrapper padded>
          <FieldLabel label={t('Branch')} isValid />
          <FieldInputWrapper>
            <RadioField
              name="branch"
              onChange={(_name, value) => {
                onChange('branch', value);
              }}
              value={transitionData.branch}
              items={[{ value: 'true' }, { value: 'false' }]}
            />
          </FieldInputWrapper>
        </FieldWrapper>
      )}
      {!transitionData.branch && (
        <>
          <ConditionField onChange={onChange} data={transitionData} />
          <FieldWrapper padded>
            <FieldLabel label={t('Errors')} isValid info={t('Optional')} />
            <FieldInputWrapper>
              {!qorus_instance && (
                <>
                  <Callout intent={Intent.WARNING}>{t('TransitionErrorsNoInstance')}</Callout>
                  <Spacer size={10} />
                </>
              )}
              {renderErrorsField(transitionData)}
            </FieldInputWrapper>
          </FieldWrapper>
        </>
      )}
    </>
  );
};

const FSMTransitionDialog: React.FC<IFSMTransitionDialogProps> = ({
  onClose,
  states,
  editingData,
  onSubmit,
}) => {
  const { qorus_instance, fetchData } = useContext<{ qorus_instance?: string }>(InitialContext);

  const getTransitionFromStates: () => IModifiedTransitions = () =>
    editingData.reduce(
      (modifiedData, { stateId, index }) => ({
        ...modifiedData,
        [`${stateId}:${index}`]: {
          name: `${states[stateId].name} -> ${
            states[states[stateId].transitions[index].state].name
          }`,
          data: cloneDeep(states)[stateId].transitions[index],
        },
      }),
      {}
    );

  const [newData, setNewData] = useState<IModifiedTransitions>(getTransitionFromStates());
  const [errors, setErrors] = useState<{ name: string }[] | null>(null);
  const t = useContext(TextContext);

  useMount(() => {
    if (qorus_instance) {
      (async () => {
        const result = await fetchData('/errors?list');
        setErrors(uniq(result.data).map((datum) => ({ name: datum })));
      })();
    }
  });

  const removeTransition = (id: string) => {
    setNewData((cur) => {
      const result = { ...cur };

      result[id] = null;

      return result;
    });
  };

  const handleDataUpdate = (id: string, name: string, value: any) => {
    setNewData((cur) => {
      const result = { ...cur };

      result[id].data[name] = value;

      return result;
    });
  };

  const handleSubmitClick = async () => {
    onClose();
    onSubmit(newData);
  };

  const isDataValid: () => boolean = () => {
    let isValid = true;

    forEach(newData, (transitionData, id) => {
      if (transitionData && !isConditionValid(transitionData.data)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const areAllTransitionsDeleted = () => {
    return every(newData, (data) => {
      return !data;
    });
  };

  return (
    <CustomDialog
      onClose={onClose}
      isOpen
      title={t('EditingTransition')}
      style={{ width: '80vw', paddingBottom: 0 }}
    >
      <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
        <ContentWrapper>
          {areAllTransitionsDeleted() ? (
            <Callout
              style={{ marginLeft: '10px', marginTop: '10px', width: '99%' }}
              intent="warning"
            >
              {t('AllTransitionsRemoved')}
            </Callout>
          ) : (
            <>
              {map(
                newData,
                (transitionData: IModifiedTransition, id: string) =>
                  transitionData && (
                    <StyledTransitionWrapper>
                      <h3>
                        {transitionData.name}
                        <Button
                          style={{ float: 'right' }}
                          intent="danger"
                          icon="trash"
                          onClick={() => {
                            removeTransition(id);
                          }}
                        />
                      </h3>
                      <TransitionEditor
                        onChange={(name, value) => handleDataUpdate(id, name, value)}
                        transitionData={transitionData.data}
                        errors={errors}
                        qorus_instance={qorus_instance}
                      />
                    </StyledTransitionWrapper>
                  )
              )}
            </>
          )}
        </ContentWrapper>
        <ActionsWrapper style={{ padding: '10px' }}>
          <ButtonGroup fill>
            <Tooltip content={t('ResetTooltip')}>
              <Button
                text={t('Reset')}
                icon={'history'}
                onClick={() => setNewData(getTransitionFromStates())}
                name="fsm-reset-transition"
              />
            </Tooltip>
            <Button
              text={t('Submit')}
              disabled={!isDataValid()}
              icon={'tick'}
              name="fsm-submit-transition"
              intent={Intent.SUCCESS}
              onClick={handleSubmitClick}
            />
          </ButtonGroup>
        </ActionsWrapper>
      </Content>
    </CustomDialog>
  );
};

export default FSMTransitionDialog;
