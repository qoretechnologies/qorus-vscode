import { Button, ButtonGroup, Callout, ControlGroup } from '@blueprintjs/core';
import { size } from 'lodash';
import React, { FunctionComponent, useRef } from 'react';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ConnectorField from './connectors';
import SelectField from './select';
import StringField from './string';

type IPair = {
  id: number;
  [key: string]: string | number;
};

export const StyledPairField = styled.div`
  margin-bottom: 10px;
`;

const ClassConnectorsField: FunctionComponent<TTranslator & IField & IFieldChange> = ({
  name,
  onChange,
  value,
  t,
  initialData,
  requestFieldData,
}) => {
  const isEditing = useRef(!!value);

  const changePairData: (index: number, key: string, val: any) => void = (index, key, val) => {
    const newValue = [...value];
    // Get the pair based on the index
    const pair: IPair = newValue[index];
    // Update the field
    pair[key] = val;
    // Reset providers if type changes
    if (key === 'type') {
      pair['input-provider'] = null;
      pair['output-provider'] = null;
    }
    // Update the pairs
    onChange(name, newValue);
  };

  const handleAddClick: () => void = () => {
    onChange(name, [
      ...value,
      {
        id: size(value) + 1,
        name: `${requestFieldData('class-name', 'value') || 'Connector'}${size(value) + 1}`,
        type: 'input',
        method: '',
        'input-provider': null,
        'output-provider': null,
      },
    ]);
  };

  const handleRemoveClick: (id: number) => void = (id) => {
    // Remove the selected pair
    onChange(
      name,
      value.filter((_p: IPair, index: number) => id !== index)
    );
  };

  value = value || [
    {
      id: 1,
      name: `${requestFieldData('class-name', 'value') || 'Connector'}1`,
      type: 'input',
      method: '',
      'input-provider': null,
      'output-provider': null,
    },
  ];

  return (
    <>
      {[...value].map((pair: IPair, index: number) => (
        <StyledPairField key={index + 1}>
          <div>
            <ControlGroup fill>
              <Button text={`${index + 1}.`} />
              <SelectField
                defaultItems={[
                  { name: 'input' },
                  { name: 'output' },
                  { name: 'input-output' },
                  { name: 'event' },
                  { name: 'condition' },
                ]}
                fill
                value={pair.type}
                name="type"
                onChange={(fieldName: string, val: string) => {
                  changePairData(index, fieldName, val);
                }}
              />
              <StringField
                name="name"
                value={pair.name}
                onChange={(fieldName: string, val: string) => {
                  changePairData(index, fieldName, val);
                }}
                placeholder={t('Name')}
                fill
              />

              <StringField
                name="method"
                value={pair.method}
                onChange={(fieldName: string, val: string) => {
                  changePairData(index, fieldName, val);
                }}
                placeholder={t('Method')}
                fill
              />
              {size(value) !== 1 && (
                <Button
                  icon={'trash'}
                  intent="danger"
                  onClick={() =>
                    initialData.confirmAction('ConfirmRemoveConnector', () =>
                      handleRemoveClick(index)
                    )
                  }
                />
              )}
            </ControlGroup>
          </div>
          <div>
            {initialData.qorus_instance ? (
              <>
                {(pair.type === 'input' ||
                  pair.type === 'input-output' ||
                  pair.type === 'condition') && (
                  <ConnectorField
                    value={pair['input-provider']}
                    isInitialEditing={isEditing}
                    title={t('InputType')}
                    name="input-provider"
                    providerType={pair.type === 'input' ? 'inputs' : null}
                    onChange={(fieldName, val) => changePairData(index, fieldName, val)}
                  />
                )}
                {(pair.type === 'output' ||
                  pair.type === 'input-output' ||
                  pair.type === 'event') && (
                  <ConnectorField
                    value={pair['output-provider']}
                    isInitialEditing={isEditing}
                    title={t('OutputType')}
                    name="output-provider"
                    providerType={pair.type === 'output' ? 'outputs' : null}
                    onChange={(fieldName, val) => changePairData(index, fieldName, val)}
                  />
                )}
              </>
            ) : (
              <Callout intent="warning">{t('ActiveInstanceProvidersConnectors')}</Callout>
            )}
          </div>
        </StyledPairField>
      ))}
      <ButtonGroup fill>
        <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
      </ButtonGroup>
    </>
  );
};

export default compose(withInitialDataConsumer(), withTextContext())(ClassConnectorsField);
