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
  const { methodsData }: any = useContext(MethodsContext);
  const { addMethod } = useContext(FieldContext);
  const t: Function = useContext<Function>(TextContext);
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');

  const isMethodValid = () => {
    return (
      validateField('string', name, { has_to_be_valid_identifier: true }) &&
      validateField('string', description)
    );
  };

  return (
    <CustomDialog
      title={t('AddNewMethod')}
      isOpen
      onClose={onClose}
      style={{ backgroundColor: '#fff' }}
    >
      <div className={Classes.DIALOG_BODY}>
        <SubField title={t('field-label-name')}>
          <String value={name} name="methodName" onChange={(_n, v) => setName(v)} />
        </SubField>
        <SubField title={t('field-label-desc')}>
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
  const { methodsData, addNewMethodWithData }: any = useContext(MethodsContext);
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
        <Button intent="success" icon="add" onClick={() => setAddingMethod(true)} />
        <Select
          fill
          forceDropdown
          defaultItems={methodsData}
          value={value}
          onChange={onChange}
          name={name}
        />
      </ControlGroup>
    </>
  );
};

export default MethodSelector;
