import React, { useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import map from 'lodash/map';
import size from 'lodash/size';

import { ReqoreMessage, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import CustomDialog from '../../../components/CustomDialog';
import { SaveColorEffect } from '../../../components/Field/multiPair';
import RadioField from '../../../components/Field/radioField';
import SelectField from '../../../components/Field/select';
import StringField from '../../../components/Field/string';
import { FieldWrapper } from '../../../components/FieldWrapper';
import { FieldContext } from '../../../context/fields';
import { InitialContext } from '../../../context/init';
import { validateField } from '../../../helpers/validations';
import { TTrigger } from './';
import ConnectorSelector from './connectorSelector';

export interface IFSMTriggerDialogProps {
  index?: number;
  fsmIndex: number;
  data?: TTrigger;
  onSubmit: (data: TTrigger, index?: number, fsmIndex?: number) => any;
  onClose: any;
  ifaceType?: string;
  triggers?: { method: string }[];
}

export const FSMTriggerDialog: React.FC<IFSMTriggerDialogProps> = ({
  index,
  data,
  onSubmit,
  onClose,
  ifaceType,
  fsmIndex,
  triggers,
}) => {
  const { t } = useTranslation();
  const initialData = useContext(InitialContext);
  const { requestInterfaceData } = useContext(FieldContext);

  const getBaseClassName = () => {
    return requestInterfaceData(ifaceType, 'base-class-name')?.value;
  };

  const getMethods: () => { name: string }[] = () => {
    const methods = requestInterfaceData('service-methods') || {};
    // If the methods are empty, check if there are methos in the initial data
    if (!size(methods) && size(initialData.service?.methods)) {
      return initialData.service.methods;
    }

    return map(methods, (method) => {
      let isValid;
      if (!!method.find) {
        isValid = method.find((field) => field.isValid === true);
      }
      if (!!isValid) {
        const name = method.find((field) => field.name === 'name').value;
        return { name };
      }

      return undefined;
    }).filter((v) => v);
  };

  const getTriggerType = (data: TTrigger): 'trigger' | 'event-connector' => 'trigger';

  const [triggerType, setTriggerType] = useState<'trigger' | 'event-connector'>(
    getTriggerType(data || {})
  );
  const [newData, setNewData] = useState<TTrigger>(data || {});

  const handleDataUpdate = (name: string, value: string) => {
    if (name === 'method') {
      setNewData({
        method: value,
      });
    } else {
      setNewData(value);
    }
  };

  const isTriggerValid = (): boolean => {
    if (newData.method) {
      return validateField('string', newData.method);
    } else if (newData.connector) {
      return !!newData.connector && !!newData['class'];
    }

    return false;
  };

  const renderTriggerField = () => {
    if (triggerType === 'trigger') {
      if (!ifaceType && !newData.method) {
        return null;
      }

      if (!ifaceType && newData.method) {
        return <StringField disabled value={newData.method} />;
      }

      const methods = getMethods();
      const baseClassName: string = getBaseClassName();

      if (ifaceType === 'step' && !baseClassName) {
        return <ReqoreMessage intent="warning">{t('StepBaseClassMissing')}</ReqoreMessage>;
      }

      return (
        <>
          {ifaceType === 'service' && size(methods) === 0 && (
            <ReqoreMessage intent="warning">{t('TriggerNoMethodsAvailable')}</ReqoreMessage>
          )}
          {(ifaceType !== 'service' || size(methods) !== 0) && (
            <SelectField
              get_message={
                ifaceType !== 'service' && {
                  action: 'get-triggers',
                  message_data: {
                    iface_kind: ifaceType,
                    'base-class-name': baseClassName,
                  },
                }
              }
              return_message={
                ifaceType !== 'service' && {
                  action: 'return-triggers',
                  return_value: 'data.triggers',
                }
              }
              defaultItems={ifaceType === 'service' && methods}
              value={newData.method}
              onChange={handleDataUpdate}
              name="method"
              description={t('Trigger')}
              fill
              predicate={(name: string) => {
                const match = triggers?.find((trigger) => trigger.method === name);

                return !match;
              }}
            />
          )}
        </>
      );
    }

    return (
      <ConnectorSelector
        value={newData}
        onChange={(value) => handleDataUpdate('connector', value)}
        types={['event']}
      />
    );
  };

  const radios = useMemo(() => {
    const result = ifaceType === 'service' ? [{ value: 'event-connector' }] : [];

    if (!ifaceType && !newData.method) {
      return result;
    }

    return [...result, { value: 'trigger' }];
  }, [newData, ifaceType]);

  return (
    <CustomDialog
      onClose={onClose}
      isOpen
      title={t('TriggerManager')}
      bottomActions={[
        {
          label: t('Reset'),
          onClick: () => {
            setNewData(data || {});
          },
          tooltip: t('ResetTooltip'),
          icon: 'HistoryLine',
        },
        {
          label: t('Submit'),
          onClick: () => {
            onSubmit(newData, index, fsmIndex);
            onClose();
          },
          icon: 'CheckLine',
          flat: false,
          effect: SaveColorEffect,
          disabled: !isTriggerValid(),
          position: 'right',
        },
      ]}
    >
      <FieldWrapper isValid={isTriggerValid()} collapsible={false} compact>
        <RadioField
          name="conditionType"
          onChange={(_name, value) => {
            setNewData({});
            setTriggerType(value);
          }}
          value={ifaceType !== 'service' ? 'trigger' : triggerType}
          items={radios}
        />
        <ReqoreVerticalSpacer height={10} />
        {renderTriggerField()}
      </FieldWrapper>
    </CustomDialog>
  );
};

export default FSMTriggerDialog;
