import { ReqoreButton, ReqoreControlGroup } from '@qoretechnologies/reqore';
import React, { useContext } from 'react';
import { cancelControl, submitControl } from '../../containers/InterfaceCreator/controls';
import { FieldContext } from '../../context/fields';
import { MethodsContext } from '../../context/methods';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import CustomDialog from '../CustomDialog';
import SubField from '../SubField';
import LongStringField from './longString';
import { PositiveColorEffect } from './multiPair';
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
      bottomActions={[
        cancelControl(() => {
          onClose();
        }),
        submitControl(
          () => {
            onClose();
            onSubmit(name, description);
          },
          {
            disabled: !isMethodValid(),
          }
        ),
      ]}
    >
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
      <ReqoreControlGroup fluid stack fill>
        <Select
          fill
          forceDropdown
          defaultItems={methods}
          value={value}
          onChange={onChange}
          name={name}
        />
        <ReqoreButton
          effect={PositiveColorEffect}
          icon="AddLine"
          onClick={() => setAddingMethod(true)}
          fixed
        />
      </ReqoreControlGroup>
    </>
  );
};

export default MethodSelector;
