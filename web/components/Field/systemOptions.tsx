import { Callout, Classes, Icon } from '@blueprintjs/core';
import { cloneDeep, forEach } from 'lodash';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { isObject } from 'util';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import Spacer from '../Spacer';
import SubField from '../SubField';
import AutoField from './auto';
import SelectField from './select';

/* "Fix options to be an object with the correct type." */
export const fixOptions = (value = {}, options) => {
  const fixedValue = cloneDeep(value);

  // Add missing required options to the fixedValue
  forEach(options, (option, name) => {
    console.log(option);
    if (option.required && !fixedValue[name]) {
      fixedValue[name] = { type: option.type, value: option.value };
    }
  });

  console.log({ fixedValue });

  return reduce(
    fixedValue,
    (newValue, option, optionName) => {
      if (!isObject(option)) {
        return {
          ...newValue,
          [optionName]: {
            type: isArray(options[optionName].type)
              ? options[optionName].type[0]
              : options[optionName].type,
            value: option,
          },
        };
      }

      return { ...newValue, [optionName]: option };
    },
    {}
  );
};

const Options = ({ name, value, onChange, url, customUrl, ...rest }) => {
  const t = useContext(TextContext);
  const [options, setOptions] = useState(rest?.options || {});
  //const [selectedOptions, setSelectedOptions] = useState(null);
  const { fetchData, confirmAction, qorus_instance } = useContext(InitialContext);
  const [error, setError] = useState<string>(null);

  const getUrl = () => customUrl || `/options/${url}`;

  useMount(() => {
    if (qorus_instance && (url || customUrl)) {
      (async () => {
        setOptions({});
        // Fetch the options for this mapper type
        const data = await fetchData(getUrl());

        if (data.error) {
          setOptions({});
          return;
        }
        onChange(name, fixOptions(value, data.data));
        // Save the new options
        setOptions(data.data);
      })();
    }
  });

  useUpdateEffect(() => {
    if ((url || customUrl) && qorus_instance) {
      (async () => {
        setOptions({});
        setError(null);
        removeValue();
        // Fetch the options for this mapper type
        const data = await fetchData(getUrl());
        if (data.error) {
          setOptions({});
          return;
        }
        // Save the new options
        setOptions(data.data);
        onChange(name, fixOptions({}, data.data));
      })();
    }
  }, [url, qorus_instance, customUrl]);

  const handleValueChange = (optionName: string, val?: any, type?: string) => {
    onChange(name, {
      ...value,
      [optionName]: {
        type,
        value: val,
      },
    });
  };

  const removeValue = () => {
    onChange(name, null);
  };

  const addSelectedOption = (optionName: string) => {
    handleValueChange(
      optionName,
      null,
      getTypeAndCanBeNull(options[optionName].type, options[optionName].allowed_values).type
    );
  };

  const removeSelectedOption = (optionName: string) => {
    delete value[optionName];

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

  if (!options) {
    return <p>{t('LoadingOptions')}</p>;
  }

  if (!size(options)) {
    return <p>{t('NoOptionsAvailable')}</p>;
  }

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
      defaultInternalType: realType,
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
      {map(fixedValue, ({ type, ...rest }, optionName) =>
        !!options[optionName] ? (
          <SubField
            subtle
            key={optionName}
            title={rest.name || optionName}
            desc={options[optionName].desc}
            onRemove={
              !options[optionName].required
                ? () => {
                    confirmAction('RemoveSelectedOption', () => removeSelectedOption(optionName));
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
                    val,
                    getTypeAndCanBeNull(type, options[optionName].allowed_values).type
                  );
                }
              }}
              value={rest.value}
              sensitive={options[optionName].sensitive}
              default_value={options[optionName].default}
              allowed_values={options[optionName].allowed_values}
            />
          </SubField>
        ) : null
      )}
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
          placeholder={`${t('AddNewOption')} (${size(filteredOptions)})`}
        />
      )}
    </>
  );
};

export default Options;
