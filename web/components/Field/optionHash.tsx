import { Button, ButtonGroup, ControlGroup } from '@blueprintjs/core';
import size from 'lodash/size';
import React, { FunctionComponent, useContext } from 'react';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { InitialContext } from '../../context/init';
import withTextContext from '../../hocomponents/withTextContext';
import AutoField from './auto';
import SelectField from './select';

type IPair = {
  id: number;
  value: string;
  name: string;
};

export const StyledPairField = styled.div`
  margin-bottom: 10px;
`;

const OptionHashField: FunctionComponent<
  { t: TTranslator; items: any[]; options: any } & IField & IFieldChange
> = ({
  name,
  onChange,
  value = [{ id: 1, value: '', name: '' }],
  get_message,
  return_message,
  items,
  t,
  options,
}) => {
  const initContext = useContext(InitialContext);
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
    onChange(name, [...value, { id: size(value) + 1, value: '', name: '' }]);
  };

  const handleRemoveClick: (id: number) => void = (id) => {
    // Remove the selected pair
    onChange(
      name,
      value.filter((_p: IPair, index: number) => id !== index)
    );
  };

  const getNameType: (name: string) => string = (name) => {
    // Find the option and return it's type
    return options[name].type;
  };

  // Filter the items
  const filteredItems = items.filter((item) => !value.find((val) => val.name === item.name));

  return (
    <>
      {value.map((pair: IPair, index: number) => (
        <StyledPairField key={pair.name}>
          <div>
            <ControlGroup fill>
              <Button text={`${index + 1}.`} />
              <SelectField
                name="name"
                value={pair.name}
                get_message={get_message}
                return_message={return_message}
                defaultItems={filteredItems}
                onChange={(fieldName: string, value: string) => {
                  changePairData(index, fieldName, value);
                }}
                fill
              />
              {pair.name ? (
                <AutoField
                  defaultType={getNameType(pair.name)}
                  name="value"
                  value={pair.value}
                  onChange={(fieldName: string, value: string): void => {
                    changePairData(index, fieldName, value);
                  }}
                  fill
                  t={t}
                />
              ) : null}
              {index !== 1 && (
                <Button
                  icon={'trash'}
                  intent="danger"
                  onClick={() =>
                    initContext.confirmAction('ConfirRemoveItem', () => handleRemoveClick(index))
                  }
                />
              )}
            </ControlGroup>
          </div>
        </StyledPairField>
      ))}
      {size(options) !== 0 && size(value) !== size(options) && (
        <ButtonGroup fill>
          <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
        </ButtonGroup>
      )}
    </>
  );
};

export default withTextContext()(OptionHashField);
