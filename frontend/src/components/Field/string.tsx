import { ReqoreInput } from '@qoretechnologies/reqore';
import { ChangeEvent, FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import { isNull } from 'util';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { getValueOrDefaultValue } from '../../helpers/validations';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';

export interface IStringField extends IField {
  t?: TTranslator;
  fill?: boolean;
  postMessage?: TPostMessage;
  addMessageListener?: TMessageListener;
  read_only?: boolean;
  placeholder?: string;
  canBeNull?: boolean;
  sensitive?: boolean;
  autoFocus?: boolean;
  onChange?: IFieldChange;
}

const StringField = ({
  name,
  onChange,
  value,
  default_value,
  fill,
  postMessage,
  addMessageListener,
  get_message,
  return_message,
  read_only,
  disabled,
  placeholder,
  canBeNull,
  sensitive,
  autoFocus,
}: IStringField) => {
  // Fetch data on mount
  useMount(() => {
    // Populate default value
    onChange && onChange(name, getValueOrDefaultValue(value, default_value, canBeNull));
    // Get backend data
    if (get_message && return_message) {
      postMessage(get_message.action);
      addMessageListener(return_message.action, (data: any) => {
        if (data) {
          onChange(name, data[return_message.return_value]);
        }
      });
    }
  });

  // When input value changes
  const handleInputChange = (event: ChangeEvent<HTMLInputElement>): void => {
    onChange(name, event.target.value);
  };

  // Clear the input on reset click
  const handleResetClick = (): void => {
    onChange(name, '');
  };

  return (
    <ReqoreInput
      placeholder={placeholder}
      disabled={disabled}
      readOnly={read_only}
      fluid={fill}
      value={
        canBeNull && isNull(value) ? 'Value set to [null]' : !value ? default_value || '' : value
      }
      onFocus={(event) => event.stopPropagation()}
      onClick={(event) => event.stopPropagation()}
      onChange={handleInputChange}
      type={sensitive ? 'password' : 'text'}
      autoFocus={autoFocus}
      onClearClick={value && value !== '' && !read_only && !disabled && handleResetClick}
    />
  );
};

export default compose(withMessageHandler(), withTextContext())(StringField) as FunctionComponent<
  IStringField & IField & IFieldChange
>;
