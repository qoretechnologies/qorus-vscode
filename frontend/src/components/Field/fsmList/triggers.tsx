import { ReqoreButton, ReqoreControlGroup, ReqoreTag } from '@qoretechnologies/reqore';
import React, { useContext } from 'react';
import { TTrigger } from '../../../containers/InterfaceCreator/fsm';
import { TextContext } from '../../../context/text';
import { getTriggerName } from './';

export interface IFSMListTriggersProps {
  triggers: TTrigger[];
  setTriggerManager: any;
  handleTriggerRemove: (name: TTrigger, fsmIndex: number) => any;
  fsmIndex: number;
  disabled: boolean;
}

const IFSMListTriggers: React.FC<IFSMListTriggersProps> = ({
  triggers = [],
  setTriggerManager,
  handleTriggerRemove,
  fsmIndex,
  disabled,
}) => {
  const t = useContext(TextContext);

  return (
    <ReqoreControlGroup wrap fluid>
      {triggers.length === 0 && (
        <ReqoreTag icon="ForbidLine" color="transparent" label={t('NoTriggersYet')} />
      )}
      {triggers.map((trigger: TTrigger, index: number) => (
        <ReqoreTag
          key={index}
          onClick={() => {
            setTriggerManager({ isOpen: true, data: trigger, fsmIndex, index });
          }}
          fixed
          onRemoveClick={(e) => {
            e.stopPropagation();
            handleTriggerRemove(trigger, fsmIndex);
          }}
          label={getTriggerName(trigger)}
        />
      ))}
      <ReqoreButton
        icon="AddLine"
        intent="info"
        disabled={disabled}
        fixed
        onClick={() => setTriggerManager({ isOpen: true, fsmIndex })}
      />
    </ReqoreControlGroup>
  );
};

export default IFSMListTriggers;
