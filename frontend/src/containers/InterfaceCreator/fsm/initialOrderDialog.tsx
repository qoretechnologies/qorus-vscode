import cloneDeep from 'lodash/cloneDeep';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import React, { useState } from 'react';
import { IFSMState, IFSMStates } from '.';
import OrderDialog from './orderDialog';
import { getStateType } from './state';
import FSMStateDialog from './stateDialog';

export interface IFSMTransitionOrderDialogProps {
  onClose: any;
  onSubmit: (data: IFSMStates) => any;
  states: IFSMStates;
  allStates: IFSMStates;
  fsmName: string;
  interfaceId: string;
}

export const FSMInitialOrderDialog: React.FC<IFSMTransitionOrderDialogProps> = ({
  onClose,
  onSubmit,
  allStates,
  states,
  fsmName,
  interfaceId,
}) => {
  const [newStates, setNewStates] = useState<IFSMStates>(cloneDeep(states));
  const [editingState, setEditingState] = useState<string>(undefined);

  const changeOrder = (from: number, to: number): void => {
    setNewStates((cur) => {
      const result = { ...cur };
      const transformedStates = getTransformedStates(result);

      const fromStateData = transformedStates[from];
      const toStateData = transformedStates[to];

      result[fromStateData.keyId].execution_order = toStateData.execution_order;
      result[toStateData.keyId].execution_order = fromStateData.execution_order;

      return result;
    });
  };

  const removeState = () => true;

  const renderMetadata = (item: IFSMState) => (
    <p style={{ margin: '3px 0 0 0', padding: 0, marginLeft: '15.5px', fontSize: '13px' }}>
      {getStateType(item)}
    </p>
  );

  const updateStateData = (id: number, data: IFSMState) => {
    setNewStates((cur: IFSMStates): IFSMStates => {
      const result = { ...cur };

      result[id] = {
        ...newStates[id],
        ...data,
      };

      return result;
    });
    setEditingState(null);
  };

  const getTransformedStates = (data) =>
    map(data, (state, keyId) => ({ ...state, keyId })).sort(
      (a, b) => a.execution_order - b.execution_order
    );

  const transformedStates = getTransformedStates(newStates);

  return (
    <>
      <OrderDialog
        onClose={onClose}
        data={transformedStates}
        changeOrder={changeOrder}
        metadata={renderMetadata}
        onEditClick={(index) => setEditingState(String(index))}
        onDeleteClick={removeState}
        dialogTitle="EditStatesOrder"
        onResetClick={() => {
          setNewStates(cloneDeep(states));
          setEditingState(null);
        }}
        onSubmitClick={() => {
          onSubmit(newStates);
          onClose();
        }}
      />
      {editingState ? (
        <FSMStateDialog
          fsmName={fsmName}
          onSubmit={updateStateData}
          onClose={() => setEditingState(null)}
          data={states[editingState]}
          id={editingState}
          interfaceId={interfaceId}
          disableInitial
          otherStates={reduce(
            allStates,
            (newAllStates, state, id) =>
              id === editingState ? { ...newAllStates } : { ...newAllStates, [id]: state },
            {}
          )}
        />
      ) : null}
    </>
  );
};

export default FSMInitialOrderDialog;
