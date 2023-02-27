import { ReqoreControlGroup } from '@qoretechnologies/reqore';
import { memo } from 'react';
import useMount from 'react-use/lib/useMount';
import { splitByteSize } from '../../helpers/functions';
import { getValueOrDefaultValue } from '../../helpers/validations';
import { IField } from '../FieldWrapper';
import Number from './number';
import SelectField from './select';
//import String from './string';

const ByteSizeField = memo(
  ({ value, default_value, onChange, name, canBeNull, disabled, read_only }: IField) => {
    const val = getValueOrDefaultValue(value, default_value, canBeNull);
    // Fetch data on mount
    useMount(() => {
      // Populate default value
      onChange && onChange(name, val);
    });

    const [bytes, size] = splitByteSize(val);

    return (
      <ReqoreControlGroup stack fluid>
        <Number
          name="bytes"
          fill
          value={bytes}
          onChange={(_name, v) => onChange(name, `${v || ''}${size || ''}`)}
          disabled={disabled}
          read_only={read_only}
        />
        <SelectField
          name="size"
          value={size}
          defaultItems={[{ name: 'KB' }, { name: 'MB' }]}
          onChange={(_name, v) => onChange(name, `${bytes || ''}${v}`)}
          disabled={disabled}
          read_only={read_only}
        />
      </ReqoreControlGroup>
    );
  }
);

export default ByteSizeField;
