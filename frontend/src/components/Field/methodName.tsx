import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreMessage,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { FunctionComponent, useContext, useState } from 'react';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { MethodsContext } from '../../context/methods';
import { validateField } from '../../helpers/validations';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import CustomDialog from '../CustomDialog';
import { FieldWrapper } from '../FieldWrapper';
import { SaveColorEffect } from './multiPair';
import String from './string';

export interface IStringField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
  read_only?: boolean;
  placeholder?: string;
  canBeNull?: boolean;
}

const MethodNameField: FunctionComponent<IStringField & IField & IFieldChange> = ({
  name,
  onChange,
  value,
  default_value,
  fill,
  disabled,
  placeholder,
  t,
}) => {
  const [editManager, setEditManager] = useState<any>({});
  const methods = useContext(MethodsContext);

  const isNameValid: (name: string) => boolean = (name) => {
    // Check if this method name already exists for this service
    const exists = methods.methods.find((method) => method.name === name);

    return validateField('string', name) && !exists;
  };

  const val = value || default_value;
  const handleClose = () => setEditManager({});

  return (
    <>
      <ReqoreControlGroup fluid stack>
        <ReqoreInput
          placeholder={placeholder}
          disabled={disabled}
          readOnly
          fluid={fill}
          value={val}
        />
        <ReqoreButton
          onClick={() => {
            setEditManager({
              isOpen: true,
              startValue: val,
              value: val,
            });
          }}
          disabled={disabled}
          fixed
          icon="EditLine"
        />
      </ReqoreControlGroup>
      {editManager.isOpen && (
        <CustomDialog
          title={t('EditMethodName')}
          onClose={handleClose}
          isOpen
          bottomActions={[
            {
              label: t('Cancel'),
              icon: 'CloseLine',
              onClick: handleClose,
            },
            {
              label: t('Save'),
              effect: SaveColorEffect,
              position: 'right',
              disabled: !isNameValid(editManager.value),
              onClick: () => {
                onChange(name, editManager.value, undefined, undefined, undefined, {
                  originalName: editManager.startValue,
                });
                setEditManager({});
              },
              icon: 'CheckLine',
            },
          ]}
        >
          <ReqoreMessage intent="warning" size="small">
            {t('EditMethodNameTriggerWarning')}
          </ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
          <FieldWrapper
            isValid={isNameValid(editManager.value)}
            collapsible={false}
            compact
            label="Method name"
          >
            <String
              onChange={(_name, v) => setEditManager({ ...editManager, value: v })}
              value={editManager.value}
              name="methodName"
              fill
              autoFocus
            />
          </FieldWrapper>
        </CustomDialog>
      )}
    </>
  );
};

export default compose(
  withMessageHandler(),
  withTextContext()
)(MethodNameField) as FunctionComponent<IStringField & IField & IFieldChange>;
