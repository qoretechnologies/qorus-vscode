import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { FunctionComponent } from 'react';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import withTextContext from '../../hocomponents/withTextContext';
import { PositiveColorEffect } from './multiPair';
import SelectPairField from './selectPair';

type IPair = {
  id: number;
  prefix: string;
  name: string;
};

export const StyledPairField = styled.div`
  margin-bottom: 10px;
`;

const ClassArrayField: FunctionComponent<
  {
    t: TTranslator;
    showClassesWarning: boolean;
    defaultSelectItems: any[];
    withTextField?: boolean;
  } & IField &
    IFieldChange
> = ({
  name,
  onChange,
  value = [{ id: 1, prefix: '', name: '' }],
  get_message,
  return_message,
  t,
  resetClassConnections,
  showClassesWarning,
  defaultSelectItems,
  reference,
  iface_kind,
  withTextField,
  requestFieldData,
  canRemoveLast,
}) => {
  const changePairData: (index: number, key: string, val: any) => void = (index, key, val) => {
    // Check if the current value is empty
    if (key === 'name' && !(value[index][key] === '' || !value[index][key])) {
      // Reset the class connections if it's not
      resetClassConnections && resetClassConnections();
    }
    const newValue = [...value];
    // Get the pair based on the index
    const pair: IPair = newValue[index];
    // Update the field
    pair[key] = val;
    // Update the pairs
    onChange(name, newValue);
  };

  const handleAddClick: () => void = () => {
    onChange(name, [...value, { id: size(value) + 1, prefix: '', name: '' }]);
  };

  const handleRemoveClick: (id: number) => void = (id) => {
    // Get the pair data
    const pairData: IPair = value.find((_p: IPair, index: number) => id === index);
    // Check if this field had a class selected
    if (pairData.name) {
      // Reset the class connections if it's not
      resetClassConnections && resetClassConnections();
    }
    // Remove the selected pair
    onChange(
      name,
      value.filter((_p: IPair, index: number) => id !== index)
    );
  };

  return (
    <>
      {showClassesWarning && (
        <>
          <ReqoreMessage intent="warning">{t('ClassChangesWarning')}</ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
        </>
      )}
      <ReqoreControlGroup fluid wrap>
        {value.map((pair: IPair, index: number) => (
          <StyledPairField key={index + 1}>
            <SelectPairField
              index={index + 1}
              canBeRemoved={canRemoveLast || size(value) !== 1}
              onRemoveClick={() => handleRemoveClick(index)}
              key={index + 1}
              keyName="prefix"
              valueName="name"
              keyValue={pair.prefix}
              valueValue={pair.name}
              get_message={get_message}
              defaultSelectItems={defaultSelectItems}
              reference={reference}
              iface_kind={iface_kind}
              return_message={return_message}
              requestFieldData={requestFieldData}
              onChange={(fieldName: string, value: any) => {
                changePairData(index, fieldName, value);
              }}
              hideTextField={!withTextField}
            />
          </StyledPairField>
        ))}
      </ReqoreControlGroup>
      <ReqoreVerticalSpacer height={10} />
      <ReqoreControlGroup fluid>
        <ReqoreButton
          icon={'AddLine'}
          rightIcon={'AddLine'}
          textAlign="center"
          onClick={handleAddClick}
          effect={PositiveColorEffect}
        >
          {t('AddAnother')}
        </ReqoreButton>
      </ReqoreControlGroup>
    </>
  );
};

export default withTextContext()(ClassArrayField);
