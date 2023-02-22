import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreP,
  ReqoreSpacer,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import { IField } from '../../../components/FieldWrapper';
import { TTrigger } from '../../../containers/InterfaceCreator/fsm';
import FSMTriggerDialog from '../../../containers/InterfaceCreator/fsm/triggerDialog';
import { TextContext } from '../../../context/text';
import Select from '../select';
import IFSMListTriggers from './triggers';

export interface IFSM {
  name?: string;
  triggers?: TTrigger[];
}

export type IFSMList = IFSM[];

export interface IFSMListFieldProps extends IField {
  value: IFSMList;
  interfaceKind: string;
}

export const getTriggerName = (trigger: TTrigger) => {
  if (trigger.hasOwnProperty('method')) {
    return trigger.method;
  }

  return `${trigger.class}:${trigger.connector}`;
};

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

  const handleTriggerRemove = (trigger: TTrigger, index: number): void => {
    console.log(trigger);
    setData((cur) => {
      const result = [...cur];

      result[index].triggers = result[index].triggers.filter(
        (trig) => getTriggerName(trigger) !== getTriggerName(trig)
      );

      return result;
    });
  };

  return (
    <>
      <ReqoreCollection
        sortable
        filterable
        flat={false}
        items={data.map(
          (datum, index): IReqoreCollectionItemProps => ({
            label: `Item ${index + 1}`,
            customTheme: { main: 'main:darken:1' },
            actions: [
              {
                icon: 'DeleteBin4Line',
                show: size(data) > 1,
                onClick: () => handleFSMRemove(index),
                intent: 'danger',
              },
            ],
            content: (
              <>
                <Select
                  key={`fsm-${index}`}
                  onChange={(_name, value) => updateFSMData(index, 'name', value)}
                  name={`fsm-${index}`}
                  description={t('FiniteStateMachine')}
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
                <ReqoreSpacer height={10} />
                <ReqoreP>{t('Triggers')}</ReqoreP>
                <ReqoreSpacer height={10} />
                <IFSMListTriggers
                  disabled={!datum.name}
                  setTriggerManager={setTriggerManager}
                  handleTriggerRemove={handleTriggerRemove}
                  fsmIndex={index}
                  triggers={datum.triggers}
                  key={`fsm-${index}-triggers`}
                />
              </>
            ),
          })
        )}
      />
      <ReqoreVerticalSpacer height={10} />
      <ReqoreButton
        onClick={() => setData((cur) => [...cur, { name: null, triggers: [] }])}
        fluid
        rightIcon="AddLine"
        intent="info"
        icon="AddLine"
      >
        {t('AddNew')}
      </ReqoreButton>
      {triggerManager.isOpen && (
        <FSMTriggerDialog
          {...triggerManager}
          triggers={data[triggerManager.fsmIndex].triggers}
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
