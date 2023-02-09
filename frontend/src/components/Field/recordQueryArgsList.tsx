import { ReqoreButton, ReqoreControlGroup } from '@qoretechnologies/reqore';
import { useContext } from 'react';
import styled from 'styled-components';
import { TextContext } from '../../context/text';
import { TRecordType } from './connectors';
import { RecordQueryArgs } from './connectors/searchArgs';
import { PositiveColorEffect } from './multiPair';
import { IOptions } from './systemOptions';

export interface IRecordQueryArgsListProps {
  name: string;
  url: string;
  value?: IOptions[];
  onChange: (name: string, value: IOptions[]) => void;
  canRemoveLast?: boolean;
  type: TRecordType;
}

export const StyledPairField = styled.div`
  margin-bottom: 10px;
`;

export const RecordQueryArgsList = ({
  name,
  onChange,
  value,
  url,
  canRemoveLast,
  type,
}: IRecordQueryArgsListProps) => {
  const t = useContext(TextContext);

  const changePairData = (index, val: IOptions | null) => {
    const newValue = [...(value || [])];
    // Update the field
    newValue[index] = val;
    // Update the pairs
    onChange(name, newValue);
  };

  const handleAddClick = () => {
    onChange(name, [...(value || []), {}]);
  };

  const handleRemoveClick: (id: number) => void = (id) => {
    // Remove the selected pair
    onChange(
      name,
      (value || []).filter((_options: IOptions, index: number) => id !== index)
    );
  };

  return (
    <>
      {value &&
        value.map((options: IOptions, index: number) => (
          <StyledPairField key={index + 1}>
            <RecordQueryArgs
              value={options}
              type={type}
              onChange={(_n, newOptions) => {
                changePairData(index, newOptions);
              }}
              url={url}
            />
          </StyledPairField>
        ))}
      <ReqoreControlGroup fluid>
        <ReqoreButton
          icon={'AddLine'}
          rightIcon="AddLine"
          effect={PositiveColorEffect}
          onClick={handleAddClick}
        >
          {t('AddAnotherRecord')}
        </ReqoreButton>
      </ReqoreControlGroup>
    </>
  );
};
