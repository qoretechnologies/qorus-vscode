import { ReqoreButton, ReqoreControlGroup } from '@qoretechnologies/reqore';
import { IReqoreEffect } from '@qoretechnologies/reqore/dist/components/Effect';
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

export const FancyColorEffect: IReqoreEffect = {
  gradient: {
    direction: 'to right bottom',
    colors: {
      0: '#12002f:lighten:2',
      100: '#12002f',
    },
    animate: 'hover',
  },
};

export const QorusColorEffect: IReqoreEffect = {
  gradient: {
    colors: {
      0: '#6e1977:lighten',
      100: '#6e1977',
    },
    animate: 'hover',
    animationSpeed: 5,
  },
};

export const SynthColorEffect: IReqoreEffect = {
  gradient: {
    colors: {
      0: '#5865f2',
      100: '#6e1977',
    },
    animate: 'always',
    animationSpeed: 5,
  },
};

export const PositiveColorEffect: IReqoreEffect = {
  gradient: {
    direction: 'to right',
    colors: {
      0: 'info:lighten',
      100: 'info',
    },
    animate: 'hover',
  },
};

export const WarningColorEffect: IReqoreEffect = {
  gradient: {
    direction: 'to right',
    colors: {
      0: 'warning:lighten:2',
      100: 'warning:lighten',
    },
    animate: 'always',
  },
};

export const PendingColorEffect: IReqoreEffect = {
  gradient: {
    direction: 'to right bottom',
    colors: {
      0: 'pending:lighten',
      100: '#160437',
    },
  },
};

export const NegativeColorEffect: IReqoreEffect = {
  gradient: {
    direction: 'to right bottom',
    colors: {
      0: 'danger:lighten',
      100: 'danger:darken',
    },
    animate: 'hover',
  },
};

export const SaveColorEffect: IReqoreEffect = {
  gradient: {
    colors: {
      0: 'success:lighten',
      100: 'success:darken',
    },
    animate: 'hover',
  },
};

export const SaveColorEffectAlt: IReqoreEffect = {
  gradient: {
    colors: {
      0: 'success:darken',
      100: 'info',
    },
    animate: 'hover',
  },
};

export const SelectorColorEffect: IReqoreEffect = {
  gradient: {
    direction: 'to right bottom',
    colors: {
      0: 'main:lighten',
      100: 'main:darken',
    },
  },
};

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
      <ReqoreControlGroup fluid>
        <ReqoreButton
          icon={'AddLine'}
          rightIcon={'AddLine'}
          textAlign="center"
          fluid
          onClick={handleAddClick}
          effect={PositiveColorEffect}
        >
          {t('AddNew')}
        </ReqoreButton>
      </ReqoreControlGroup>
    </>
  );
};

export default withTextContext()(MultiPairField);
