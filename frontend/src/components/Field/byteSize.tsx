import { ReqoreControlGroup } from '@qoretechnologies/reqore';
import useMount from 'react-use/lib/useMount';
import { splitByteSize } from '../../helpers/functions';
import { getValueOrDefaultValue } from '../../helpers/validations';
import Number from './number';
import SelectField from './select';
//import String from './string';

const ByteSizeField = ({
  value,
  default_value,
  onChange,
  name,
  canBeNull,
  disabled,
  read_only,
}) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    onChange && onChange(name, getValueOrDefaultValue(value, default_value, canBeNull));
  });

  const [bytes, size] = splitByteSize(value);

  return (
    <ReqoreControlGroup stack fluid>
      <Number
        name="bytes"
        fill
        value={bytes}
        onChange={(_name, val) => onChange(name, `${val || ''}${size || ''}`)}
      />
      <SelectField
        name="size"
        value={size}
        defaultItems={[{ name: 'KB' }, { name: 'MB' }]}
        onChange={(_name, val) => onChange(name, `${bytes || ''}${val}`)}
      />
    </ReqoreControlGroup>
  );
};

export default ByteSizeField;
