import { Classes, Icon } from '@blueprintjs/core';
import capitalize from 'lodash/capitalize';
import cloneDeep from 'lodash/cloneDeep';
import React, { useContext, useState } from 'react';
import { IFSMState, IFSMStates, IFSMTransition } from '.';
import { TextContext } from '../../../context/text';
import OrderDialog from './orderDialog';
import { getStateType } from './state';
import FSMTransitionDialog, { getConditionType, isConditionValid } from './transitionDialog';

export interface IFSMTransitionOrderDialogProps {
  id: string;
  transitions: IFSMTransition[];
  onClose: any;
  getStateData: (id: string) => IFSMState;
  onSubmit: (id: string, data: IFSMState) => any;
  onEditClick: (id: string, index: number) => any;
  states: IFSMStates;
}

const FSMTransitionOrderDialog: React.FC<IFSMTransitionOrderDialogProps> = ({
  id,
  transitions,
  onClose,
  getStateData,
  onSubmit,
  onEditClick,
  states,
}) => {
  const [newTransitions, setNewTransitions] = useState<IFSMTransition[]>(
    cloneDeep(transitions) || []
  );
  const [editingTransition, setEditingTransition] = useState<number | null>(null);
  const t = useContext(TextContext);

  const changeOrder = (from: number, to: number): void => {
    setNewTransitions((cur) => {
      const result = [...cur];

      [result[from], result[to]] = [result[to], result[from]];

      return result;
    });
  };

  const renderStateInfo = (id) => {
    const { name }: IFSMState = getStateData(id);
    const realType: string = getStateType(getStateData(id));

    return (
      <>
        <strong>{name}</strong> <span className={Classes.TEXT_MUTED}>[{realType}]</span>
      </>
    );
  };

  const renderTransitionInfo = (data: IFSMTransition) => {
    const { condition, errors }: IFSMTransition = data;
    const conditionType: string = getConditionType(condition);

    let conditionText = '';

    if (conditionType !== 'none') {
      const conditionValue =
        conditionType === 'custom'
          ? condition
          : `${condition.class || t('Missing')}:${condition.connector || t('Missing')}`;

      conditionText = `${capitalize(conditionType)} ${t(
        'TransitionOrderCondition'
      )}: ${conditionValue} ${errors?.length ? ' | ' : ''}`;
    }

    if (errors?.length) {
      conditionText += `${errors.length} ${t('TransitionErrors')}: [${errors
        .map((error) => error.name)
        .join(', ')}]`;
    }

    return (
      <>
        <p
          style={{ margin: '3px 0 0 0', padding: 0, marginLeft: '15.5px', fontSize: '13px' }}
          className={Classes.TEXT_MUTED}
        >
          {conditionText}
        </p>
      </>
    );
  };

  const updateTransitionData = (_stateId, index, data, remove?: boolean) => {
    setNewTransitions((cur) => {
      let result = [...cur];

      if (remove) {
        delete result[index];
      } else {
        result[index] = data;
      }

      result = result.filter((tr) => tr);

      return result;
    });
  };

  const removeTransition = (index) => {
    setNewTransitions((cur) => {
      let result = [...cur];

      result = result.filter((_transition, idx) => idx !== index);

      return result;
    });
  };

  const isTransitionValid = (item: IFSMTransition) => {
    return isConditionValid(item);
  };

  const isDataValid = () => {
    return newTransitions.every((transition) => isConditionValid(transition));
  };

  const renderMetadata = (item: IFSMTransition) => (
    <>
      {renderStateInfo(item.state)}{' '}
      {!isTransitionValid(item) && <Icon icon="cross" intent="danger" />}
      {renderTransitionInfo(item)}
    </>
  );

  return (
    <>
      <OrderDialog
        onClose={onClose}
        data={newTransitions}
        title="TransitionToState"
        metadata={renderMetadata}
        dialogTitle="EditTransitionsOrder"
        changeOrder={changeOrder}
        onEditClick={(index) => setEditingTransition(index)}
        onDeleteClick={removeTransition}
        onResetClick={() => {
          setNewTransitions(cloneDeep(transitions));
          setEditingTransition(null);
        }}
        onSubmitClick={() => {
          onSubmit(id, { transitions: newTransitions });
          onClose();
        }}
        isDisabled={!isDataValid()}
      />
      {editingTransition || editingTransition === 0 ? (
        <FSMTransitionDialog
          onSubmit={updateTransitionData}
          onClose={() => setEditingTransition(null)}
          states={states}
          editingData={[{ stateId: id, index: editingTransition }]}
        />
      ) : null}
    </>
  );
};

export default FSMTransitionOrderDialog;
