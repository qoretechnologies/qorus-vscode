import { Callout, Classes, Icon } from '@blueprintjs/core';
import { cloneDeep, forEach } from 'lodash';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import styled from 'styled-components';
import { isObject } from 'util';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import Spacer from '../Spacer';
import SubField from '../SubField';
import AutoField from './auto';
import SelectField from './select';

export const StyledOptionField = styled.div`
  padding: 10px;
  border-bottom: 1px solid #e6e6e6;
  border-right: 1px solid #e6e6e6;
  border-left: 1px solid #e6e6e6;

  &:nth-child(even) {
    background-color: #ffffff;
  }

  &:nth-child(odd) {
    background-color: #f7f7f7;
  }

  &:first-child {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
    border-top: 1px solid #e6e6e6;
  }

  &:last-child {
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
`;

const getType = (type) => (isArray(type) ? type[0] : type);

/* "Fix options to be an object with the correct type." */
export const fixOptions = (value: IOptions = {}, options: IOptionsSchema): IOptions => {
  const fixedValue = cloneDeep(value);

  // Add missing required options to the fixedValue
  forEach(options, (option, name) => {
    if (option.required && !fixedValue[name]) {
      fixedValue[name] = { type: option.type, value: option.default_value };
    }
  });

  return reduce(
    fixedValue,
    (newValue, option, optionName) => {
      if (!isObject(option)) {
        return {
          ...newValue,
          [optionName]: {
            type: getType(options[optionName].type),
            value: option,
          },
        };
      }

      return { ...newValue, [optionName]: option };
    },
    {}
  );
};

export type IQorusType =
  | 'string'
  | 'int'
  | 'list'
  | 'bool'
  | 'float'
  | 'binary'
  | 'hash'
  | 'date'
  | 'any'
  | 'auto'
  | 'mapper'
  | 'workflow'
  | 'service'
  | 'job'
  | 'data-provider'
  | 'file-as-string';
export type TOption = {
  type: IQorusType;
  value: any;
};
export type IOptions = {
  [optionName: string]: TOption;
};

export interface IOptionsSchema {
  type: IQorusType;
  default_value?: any;
  required?: boolean;
}

export interface IOptionsProps {
  name: string;
  url?: string;
  customUrl?: string;
  value?: IOptions;
  options?: IOptionsSchema;
  onChange: (name: string, value?: IOptions) => void;
  placeholder?: string;
}

const Options = ({
  name,
  value,
  onChange,
  url,
  customUrl,
  placeholder,
  ...rest
}: IOptionsProps) => {
  const t: any = useContext(TextContext);
  const [options, setOptions] = useState<IOptionsSchema | undefined>(rest?.options || undefined);
  //const [selectedOptions, setSelectedOptions] = useState(null);
  const { fetchData, confirmAction, qorus_instance }: any = useContext(InitialContext);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const getUrl = () => customUrl || `/options/${url}`;

  useMount(() => {
    if (qorus_instance && (url || customUrl)) {
      (async () => {
        setOptions(undefined);
        setLoading(true);
        // Fetch the options for this mapper type
        const data = await fetchData(getUrl());

        if (data.error) {
          setLoading(false);
          setOptions(undefined);
          return;
        }
        onChange(name, fixOptions(value, data.data));
        // Save the new options
        setLoading(false);
        setOptions(data.data);
      })();
    }
  });

  useUpdateEffect(() => {
    if ((url || customUrl) && qorus_instance) {
      (async () => {
        setOptions(undefined);
        setError(null);
        removeValue();
        setLoading(true);
        // Fetch the options for this mapper type
        const data = await fetchData(getUrl());
        if (data.error) {
          setLoading(false);
          setOptions(undefined);
          return;
        }
        // Save the new options
        setLoading(false);
        setOptions(data.data);
        onChange(name, fixOptions({}, data.data));
      })();
    }
  }, [url, qorus_instance, customUrl]);

  const handleValueChange = (optionName: string, currentValue: any, val?: any, type?: string) => {
    onChange(name, {
      ...currentValue,
      [optionName]: {
        type,
        value: val,
      },
    });
  };

  const removeValue = () => {
    onChange(name, undefined);
  };

  const removeSelectedOption = (optionName: string) => {
    delete value?.[optionName];

    onChange(name, value);
  };

  if (!qorus_instance) {
    return <Callout intent="warning">{t('OptionsQorusInstanceRequired')}</Callout>;
  }

  if (error) {
    return (
      <Callout intent="danger">
        <p style={{ fontWeight: 500 }}>{t('ErrorLoadingOptions')}</p>
        {t(error)}
      </Callout>
    );
  }

  if (loading) {
    return <p>{t('LoadingOptions')}</p>;
  }

  if (!size(options)) {
    return <Callout intent="warning">{t('NoOptionsAvailable')}</Callout>;
  }

  const addSelectedOption = (optionName: string) => {
    handleValueChange(
      optionName,
      value,
      options[optionName].default_value,
      getTypeAndCanBeNull(options[optionName].type, options[optionName].allowed_values).type
    );
  };

  const getTypeAndCanBeNull = (type: string, allowed_values: any[]) => {
    let canBeNull = false;
    let realType = isArray(type) ? type[0] : type;

    if (realType?.startsWith('*')) {
      realType = realType.replace('*', '');
      canBeNull = true;
    }

    realType = realType === 'string' && allowed_values ? 'select-string' : realType;

    return {
      type: realType,
      defaultType: realType,
      defaultInternalType: realType === 'auto' || realType === 'any' ? undefined : realType,
      canBeNull,
    };
  };

  const fixedValue = fixOptions(value, options);
  const filteredOptions = reduce(
    options,
    (newOptions, option, name) => {
      if (fixedValue && fixedValue[name]) {
        return newOptions;
      }

      return { ...newOptions, [name]: option };
    },
    {}
  );

  return (
    <>
      <div>
        {map(fixedValue, ({ type, ...other }, optionName) =>
          !!options[optionName] ? (
            <StyledOptionField>
              <SubField
                subtle
                key={optionName}
                title={optionName}
                isValid={validateField(getType(type), other.value)}
                detail={getType(options[optionName].type)}
                desc={options[optionName].desc}
                onRemove={
                  !options[optionName].required
                    ? () => {
                        confirmAction('RemoveSelectedOption', () =>
                          removeSelectedOption(optionName)
                        );
                      }
                    : undefined
                }
              >
                <AutoField
                  {...getTypeAndCanBeNull(type, options[optionName].allowed_values)}
                  name={optionName}
                  onChange={(optionName, val) => {
                    if (val !== undefined) {
                      handleValueChange(
                        optionName,
                        fixedValue,
                        val,
                        getTypeAndCanBeNull(type, options[optionName].allowed_values).type
                      );
                    }
                  }}
                  noSoft={!!rest?.options}
                  value={other.value}
                  sensitive={options[optionName].sensitive}
                  default_value={options[optionName].default}
                  allowed_values={options[optionName].allowed_values}
                />
              </SubField>
            </StyledOptionField>
          ) : null
        )}
      </div>
      {size(fixedValue) === 0 && (
        <p className={Classes.TEXT_MUTED}>
          <Icon icon="info-sign" /> {t('NoOptionsSelected')}
        </p>
      )}
      <Spacer size={10} />
      {size(filteredOptions) >= 1 && (
        <SelectField
          name="options"
          defaultItems={Object.keys(filteredOptions).map((option) => ({
            name: option,
            desc: options[option].desc,
          }))}
          onChange={(_name, value) => addSelectedOption(value)}
          placeholder={`${t(placeholder || 'AddNewOption')} (${size(filteredOptions)})`}
        />
      )}
    </>
  );
};

export default Options;
