import { Button, ButtonGroup } from '@blueprintjs/core';
import { size } from 'lodash';
import { FunctionComponent } from 'react';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import withTextContext from '../../hocomponents/withTextContext';
import PairField from './pair';

type IPair = {
  id: number;
  [key: string]: string | number;
};

export const StyledPairField = styled.div`
  margin-bottom: 10px;
`;

const MultiPairField: FunctionComponent<TTranslator & IField & IFieldChange> = ({
  fields,
  name,
  onChange,
  value = [{ id: 1, [fields[0]]: '', [fields[1]]: '' }],
  t,
}) => {
  const changePairData: (index: number, key: string, val: any) => void = (index, key, val) => {
    const newValue = [...value];
    // Get the pair based on the index
    const pair: IPair = newValue[index];
    // Update the field
    pair[key] = val;
    // Update the pairs
    onChange(name, newValue);
  };

  const handleAddClick: () => void = () => {
    onChange(name, [...value, { id: size(value) + 1, [fields[0]]: '', [fields[1]]: '' }]);
  };

  const handleRemoveClick: (id: number) => void = (id) => {
    // Remove the selected pair
    onChange(
      name,
      value.filter((_p: IPair, index: number) => id !== index)
    );
  };

  return (
    <>
      {value.map((pair: IPair, index: number) => (
        <StyledPairField key={index + 1}>
          <PairField
            index={index + 1}
            canBeRemoved={size(value) !== 1}
            onRemoveClick={() => handleRemoveClick(index)}
            key={index + 1}
            keyName={fields[0]}
            valueName={fields[1]}
            keyValue={pair[fields[0]]}
            valueValue={pair[fields[1]]}
            onChange={(fieldName: string, value: any) => {
              changePairData(index, fieldName, value);
            }}
          />
        </StyledPairField>
      ))}
      <ButtonGroup fill>
        <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
      </ButtonGroup>
    </>
  );
};

export default withTextContext()(MultiPairField);
