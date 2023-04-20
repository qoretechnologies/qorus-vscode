import { ReqoreMessage, ReqoreRadioGroup } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import Java from '../../images/java-96x128.png';
import Python from '../../images/python-129x128.png';
import Qore from '../../images/qore-106x128.png';

const LangToIcon = {
  'java-96x128.png': Java,
  'python-129x128.png': Python,
  'qore-106x128.png': Qore,
};

export interface IRadioField {
  t: TTranslator;
  initialData: any;
  disabled?: boolean;
}

const StyledRadio = styled.div`
  line-height: 30px;
  height: 30px;
  cursor: pointer;

  p {
    display: inline-block;
    margin: 0;
    margin-left: 10px;
  }
`;

const LangIcon = styled.img`
  display: inline-block;
  height: 15px;
  width: 15px;
  margin-left: 10px;
  vertical-align: sub;
`;

const icons = {
  qore: 'qore-106x128.png',
  python: 'python-129x128.png',
};

const RadioField: FunctionComponent<IRadioField & IField & IFieldChange> = ({
  t,
  items,
  default_value,
  onChange,
  name,
  value,
  initialData,
  disabled,
  warning,
}) => {
  useMount(() => {
    // Set the default value
    if (!value && default_value) {
      onChange(name, default_value);
    }
  });

  const handleValueChange: (value: string) => void = (value) => {
    // Send the change
    onChange(name, value);
  };

  return (
    <>
      {warning && (
        <ReqoreMessage intent="warning" minimal>
          {warning}
        </ReqoreMessage>
      )}
      <ReqoreRadioGroup
        items={(items || []).map((item) => ({
          label: item.title || t(`field-label-${item.value}`),
          disabled,
          value: item.value,
          margin: 'right',
          labelEffect: {
            spaced: 1,
            weight: 'bold',
            uppercase: true,
            textSize: 'small',
          },
          image:
            item.icon_filename || item.icon
              ? LangToIcon[item.icon_filename || icons[item.icon!]]
              : undefined,
          divider: item.isDivider,
        }))}
        disabled={disabled}
        onSelectClick={(value) => handleValueChange(value)}
        selected={value}
      />
    </>
  );
};

export default compose(withInitialDataConsumer(), withTextContext())(RadioField);
