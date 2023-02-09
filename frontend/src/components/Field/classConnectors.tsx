import {
  ReqoreButton,
  ReqoreColumn,
  ReqoreColumns,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreTag,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { FunctionComponent, useRef } from 'react';
import compose from 'recompose/compose';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ConnectorField from './connectors';
import { PositiveColorEffect } from './multiPair';
import SelectField from './select';
import StringField from './string';

type IPair = {
  id: number;
  [key: string]: string | number;
};

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

    if (!pair['input-provider']) {
      delete pair['input-provider'];
    }

    if (!pair['output-provider']) {
      delete pair['output-provider'];
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
      <ReqoreColumns minColumnWidth="400px" columnsGap="10px">
        {[...value].map((pair: IPair, index: number) => (
          <ReqoreColumn flexFlow="column">
            <ReqoreControlGroup fluid stack vertical>
              <ReqoreControlGroup>
                <ReqoreTag label={`${index + 1}.`} fixed />
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
              </ReqoreControlGroup>
              <ReqoreControlGroup>
                <StringField
                  name="name"
                  label="Name"
                  value={pair.name}
                  onChange={(fieldName: string, val: string) => {
                    changePairData(index, fieldName, val);
                  }}
                  placeholder={t('Name')}
                />
                <StringField
                  name="method"
                  label="Method"
                  value={pair.method}
                  onChange={(fieldName: string, val: string) => {
                    changePairData(index, fieldName, val);
                  }}
                  placeholder={t('Method')}
                />
                {size(value) !== 1 && (
                  <ReqoreButton
                    icon="DeleteBin4Fill"
                    intent="danger"
                    fixed
                    onClick={() =>
                      initialData.confirmAction('ConfirmRemoveConnector', () =>
                        handleRemoveClick(index)
                      )
                    }
                  />
                )}
              </ReqoreControlGroup>
            </ReqoreControlGroup>
            <ReqoreVerticalSpacer height={10} />
            {initialData.qorus_instance ? (
              <ReqoreColumns columnsGap="10px" minColumnWidth="400px" style={{ width: '100%' }}>
                {(pair.type === 'input' ||
                  pair.type === 'input-output' ||
                  pair.type === 'condition') && (
                  <ReqoreColumn flexFlow="column">
                    <ConnectorField
                      value={pair['input-provider']}
                      isInitialEditing={isEditing}
                      title={t('InputType')}
                      name="input-provider"
                      providerType={pair.type === 'input' ? 'inputs' : null}
                      onChange={(fieldName, val) => changePairData(index, fieldName, val)}
                    />
                  </ReqoreColumn>
                )}
                {(pair.type === 'output' ||
                  pair.type === 'input-output' ||
                  pair.type === 'event') && (
                  <ReqoreColumn flexFlow="column">
                    <ConnectorField
                      value={pair['output-provider']}
                      isInitialEditing={isEditing}
                      title={t('OutputType')}
                      name="output-provider"
                      providerType={pair.type === 'output' ? 'outputs' : null}
                      onChange={(fieldName, val) => changePairData(index, fieldName, val)}
                    />
                  </ReqoreColumn>
                )}
              </ReqoreColumns>
            ) : (
              <ReqoreMessage intent="warning">
                {t('ActiveInstanceProvidersConnectors')}
              </ReqoreMessage>
            )}
          </ReqoreColumn>
        ))}
      </ReqoreColumns>
      <ReqoreControlGroup fluid>
        <ReqoreButton
          icon={'AddLine'}
          rightIcon={'AddLine'}
          textAlign="center"
          onClick={handleAddClick}
          effect={PositiveColorEffect}
        >
          {t('AddNew')}
        </ReqoreButton>
      </ReqoreControlGroup>
    </>
  );
};

export default compose(withInitialDataConsumer(), withTextContext())(ClassConnectorsField);
