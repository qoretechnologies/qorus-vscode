import { Button, ButtonGroup, Classes, ControlGroup } from '@blueprintjs/core';
import React, { useContext } from 'react';
import { FieldContext } from '../../context/fields';
import { MethodsContext } from '../../context/methods';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import CustomDialog from '../CustomDialog';
import SubField from '../SubField';
import LongStringField from './longString';
import Select from './select';
import String from './string';

const NewMethodDialog = ({ onSubmit, onClose }) => {
  const { methods }: any = useContext(MethodsContext);
  const t: Function = useContext<Function>(TextContext);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const isMethodValid = () => {
    return (
      validateField('string', name, { has_to_be_valid_identifier: true }) &&
      methods.find((method) => method.name === name) === undefined &&
      validateField('string', description)
    );
  };

  const isNameValid = () => {
    return (
      validateField('string', name, { has_to_be_valid_identifier: true }) &&
      methods.find((method) => method.name === name) === undefined
    );
  };

  const isDescValid = () => {
    return validateField('string', description);
  };

  return (
    <CustomDialog
      title={t('AddMethodTooltip')}
      isOpen
      onClose={onClose}
      style={{ backgroundColor: '#fff' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <SubField title={t('field-label-name')} isValid={isNameValid()}>
          <String value={name} name="methodName" onChange={(_n, v) => setName(v)} />
        </SubField>
        <SubField title={t('field-label-desc')} isValid={isDescValid()}>
          <LongStringField
            value={description}
            name="methodDesc"
            onChange={(_n, v) => setDescription(v)}
          />
        </SubField>
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <ButtonGroup>
            <Button
              text={t('Cancel')}
              onClick={() => {
                onClose();
              }}
            />
            <Button
              id="global-dialog-confirm"
              text={t('Submit')}
              intent={'success'}
              disabled={!isMethodValid()}
              onClick={() => {
                onClose();
                onSubmit(name, description);
              }}
            />
          </ButtonGroup>
        </div>
      </div>
    </CustomDialog>
  );
};

const MethodSelector = ({ onChange, name, value }) => {
  const { methods, addNewMethodWithData }: any = useContext(MethodsContext);
  const { addMethod } = useContext(FieldContext);
  const t: Function = useContext<Function>(TextContext);
  // State that indicates if new method is being added
  const [addingMethod, setAddingMethod] = React.useState(false);

  return (
    <>
      {addingMethod && (
        <NewMethodDialog
          onClose={() => setAddingMethod(false)}
          onSubmit={(name, description) => {
            addMethod(name, description, addNewMethodWithData);
            onChange('method', name);
          }}
        />
      )}
      <ControlGroup fill>
        <Button
          intent="success"
          icon="add"
          onClick={() => setAddingMethod(true)}
          className={Classes.FIXED}
          style={{
            maxHeight: '30px',
          }}
        />
        <Select
          fill
          forceDropdown
          defaultItems={methods}
          value={value}
          onChange={onChange}
          name={name}
        />
      </ControlGroup>
    </>
  );
};

export default MethodSelector;
