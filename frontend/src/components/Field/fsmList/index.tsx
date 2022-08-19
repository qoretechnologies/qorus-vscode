import { Button, Classes } from '@blueprintjs/core';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import React, { ReactNode, useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { IField } from '../../../components/FieldWrapper';
import { TTrigger } from '../../../containers/InterfaceCreator/fsm';
import FSMTriggerDialog from '../../../containers/InterfaceCreator/fsm/triggerDialog';
import { TextContext } from '../../../context/text';
import Spacer from '../../Spacer';
import Select from '../select';
import IFSMListTriggers from './triggers';

export interface IFSM {
  name?: string;
  triggers?: TTrigger[];
}

export type IFSMList = IFSM[];

export interface IFSMListFieldProps extends IField {
  value: IFSMList;
}

export const getTriggerName = (trigger: TTrigger) => {
  if (trigger.hasOwnProperty('method')) {
    return trigger.method;
  }

  return `${trigger.class}:${trigger.connector}`;
};

const StyledFSMWrapper = styled.div`
  display: flex;
  border: 1px solid #d7d7d7;
  border-radius: 5px;
  margin-bottom: 10px;
`;

const StyledIndex = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-right: 1px solid #d7d7d7;
  width: 40px;
  background-color: #f1f1f1;
  font-weight: 500;
`;

const StyledDeleteButton = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
  border-left: 1px solid #d7d7d7;
  background-color: #f1f1f1;
`;

const StyledWrapper = styled.div`
  flex: 1;
  padding: 15px;
  background-color: #f1f1f1;
`;

const FSMListField: React.FC<IFSMListFieldProps> = ({
  value,
  reference,
  name,
  onChange,
  iface_kind,
  requestFieldData,
}) => {
  const t = useContext(TextContext);
  const [data, setData] = useState<IFSMList>(
    value || [
      {
        name: null,
        triggers: [],
      },
    ]
  );

  const [triggerManager, setTriggerManager] = useState<{
    isOpen: boolean;
    data?: TTrigger;
    fsmIndex?: number;
    index?: number;
  }>({ isOpen: false });

  const handleFSMRemove = (index: number): void => {
    setData((cur) => {
      let result = [...cur];

      result = result.filter((_trig, idx) => idx !== index);

      return result;
    });
  };

  useEffect(() => {
    onChange(name, data);
  }, [data]);

  const updateFSMData = (index: number, propName: string, value): void => {
    setData((cur) => {
      const result = [...cur];

      result[index][propName] = value;

      return result;
    });
  };

  const handleTriggerRemove = (trigger: ReactNode, index: number): void => {
    setData((cur) => {
      const result = [...cur];

      result[index].triggers = result[index].triggers.filter(
        (trig) => trigger !== getTriggerName(trig)
      );

      return result;
    });
  };

  return (
    <>
      {data.map((datum, index) => (
        <StyledFSMWrapper>
          <StyledIndex>{index + 1}.</StyledIndex>
          <StyledWrapper>
            <p>{t('field-label-fsm')}</p>
            <Select
              onChange={(_name, value) => updateFSMData(index, 'name', value)}
              name={`fsm-${index}`}
              value={datum.name}
              requestFieldData={requestFieldData}
              get_message={{
                action: 'creator-get-objects',
                object_type: 'fsm',
              }}
              return_message={{
                action: 'creator-return-objects',
                object_type: 'fsm',
                return_value: 'objects',
              }}
              reference={reference}
            />
            <Spacer size={10} />
            <p>
              {t('Triggers')}
              <span className={Classes.TEXT_MUTED}>{!datum.name ? t('PleaseSelectFSM') : ''}</span>
            </p>
            <IFSMListTriggers
              disabled={!datum.name}
              setTriggerManager={setTriggerManager}
              handleTriggerRemove={handleTriggerRemove}
              fsmIndex={index}
              triggers={datum.triggers}
            />
          </StyledWrapper>
          {size(data) > 1 && (
            <StyledDeleteButton>
              <Button
                icon="cross"
                intent="danger"
                onClick={() => handleFSMRemove(index)}
                name={`field-fsm-${index}-remove`}
              />
            </StyledDeleteButton>
          )}
        </StyledFSMWrapper>
      ))}
      <Button
        fill
        icon="add"
        onClick={() => setData([...data, { name: null, triggers: [] }])}
        name="field-fsm-add-another"
      >
        {t('AddAnother')}
      </Button>
      {triggerManager.isOpen && (
        <FSMTriggerDialog
          {...triggerManager}
          ifaceType={iface_kind}
          onClose={() => setTriggerManager({ isOpen: false })}
          onSubmit={(dt, index, fsmIndex) => {
            const newTriggers: TTrigger[] = cloneDeep(data[fsmIndex].triggers);

            if (index || index === 0) {
              newTriggers[index] = dt;
            } else {
              newTriggers.push(dt);
            }

            updateFSMData(fsmIndex, 'triggers', newTriggers);
          }}
        />
      )}
    </>
  );
};

export default FSMListField;
