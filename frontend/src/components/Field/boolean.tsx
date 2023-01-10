import { ReqoreCheckbox } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import { isUndefined } from 'util';
import { IField } from '.';
import { IFieldChange } from '../../components/FieldWrapper';
import { getValueOrDefaultValue } from '../../helpers/validations';

const BooleanField: FunctionComponent<IField & IFieldChange> = ({
  name,
  onChange,
  value,
  default_value,
  disabled,
}) => {
  useMount(() => {
    // Set the default value
    onChange(name, getValueOrDefaultValue(value, default_value || false, false));
  });

  const handleEnabledChange: (event: any) => void = () => {
    // Run the onchange
    if (onChange) {
      onChange(name, !value);
    }
  };

  if (isUndefined(value)) {
    return null;
  }

  return (
    <ReqoreCheckbox
      disabled={disabled}
      checked={value || false}
      onClick={handleEnabledChange}
      asSwitch
      onText="Yes"
      offText="No"
      checkedIcon="CheckLine"
      uncheckedIcon="CloseLine"
      margin="none"
    />
  );
};

export default BooleanField;
