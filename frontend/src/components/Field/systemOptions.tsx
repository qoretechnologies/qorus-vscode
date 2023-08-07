import { setupPreviews } from '@previewjs/plugin-react/setup';
import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { cloneDeep, findKey, forEach, last } from 'lodash';
import isArray from 'lodash/isArray';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useMemo, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { isObject } from 'util';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { insertAtIndex } from '../../helpers/functions';
import { validateField } from '../../helpers/validations';
import { getGlobalDescriptionTooltip } from '../FieldWrapper';
import AutoField from './auto';
import { NegativeColorEffect, PositiveColorEffect } from './multiPair';
import SelectField from './select';
import { TemplateField } from './template';

const getType = (
  type: IQorusType | IQorusType[],
  operators?: IOperatorsSchema,
  operator?: TOperatorValue
) => {
  const finalType = getTypeFromOperator(operators, fixOperatorValue(operator)) || type;

  return isArray(finalType) ? finalType[0] : finalType;
};

const getTypeFromOperator = (
  operators?: IOperatorsSchema,
  operatorData?: (string | null | undefined)[]
) => {
  if (!operators || !operatorData || !size(operatorData) || !last(operatorData)) {
    return null;
  }

  return operators[last(operatorData) as string]?.type || null;
};

export const fixOperatorValue = (operator: TOperatorValue): (string | null | undefined)[] => {
  return isArray(operator) ? operator : [operator];
};

/* "Fix options to be an object with the correct type." */
export const fixOptions = (
  value: IOptions = {},
  options: IOptionsSchema,
  operators?: IOperatorsSchema
): IOptions => {
  const fixedValue = cloneDeep(value);

  // Add missing required options to the fixedValue
  forEach(options, (option, name) => {
    if (option.required && !fixedValue[name]) {
      fixedValue[name] = {
        type: getType(option.type, operators, fixedValue[name]?.op),
        value: option.default_value,
      };
    }
  });

  return reduce(
    fixedValue,
    (newValue, option, optionName) => {
      if (!isObject(option)) {
        return {
          ...newValue,
          [optionName]: {
            type: getType(options[optionName].type, operators, option.op),
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
  | 'boolean'
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
  | 'select-string'
  | 'data-provider'
  | 'file-as-string'
  | 'number';

export type TOperatorValue = string | string[] | undefined | null;

export type TOption = {
  type: IQorusType;
  value: any;
  op?: TOperatorValue;
};
export type IOptions =
  | {
      [optionName: string]: TOption;
    }
  | undefined;

export interface IOptionsSchemaArg {
  type: IQorusType | IQorusType[];
  default_value?: any;
  required?: boolean;
  allowed_values?: any[];
  sensitive?: boolean;
  desc?: string;
  arg_schema?: IOptionsSchema;
}

export interface IOptionsSchema {
  [optionName: string]: IOptionsSchemaArg;
}

export interface IOperator {
  type?: IQorusType;
  name: string;
  desc: string;
  supports_nesting?: boolean;
  selected?: boolean;
}

export interface IOperatorsSchema {
  [operatorName: string]: IOperator;
}

export interface IOptionsProps {
  name: string;
  url?: string;
  customUrl?: string;
  value?: IOptions;
  options?: IOptionsSchema;
  onChange: (name: string, value?: IOptions) => void;
  placeholder?: string;
  operatorsUrl?: string;
  noValueString?: string;
  isValid?: boolean;
  onOptionsLoaded?: (options: IOptionsSchema) => void;
  recordRequiresSearchOptions?: boolean;
  readOnly?: boolean;
}

export const getTypeAndCanBeNull = (
  type: IQorusType | IQorusType[],
  allowed_values?: any[],
  operatorData?: TOperatorValue,
  operators?: IOperatorsSchema
) => {
  let canBeNull = false;
  let realType = getType(type, operators, operatorData);

  if (realType?.startsWith('*')) {
    realType = realType.replace('*', '') as IQorusType;
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

const Options = ({
  name,
  value,
  onChange,
  url,
  customUrl,
  placeholder,
  operatorsUrl,
  noValueString,
  isValid,
  onOptionsLoaded,
  recordRequiresSearchOptions,
  readOnly,
  ...rest
}: IOptionsProps) => {
  const t: any = useContext(TextContext);
  const [options, setOptions] = useState<IOptionsSchema | undefined>(rest?.options || undefined);
  const [operators, setOperators] = useState<IOperatorsSchema | undefined>(undefined);
  const { fetchData, confirmAction, qorus_instance }: any = useContext(InitialContext);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(rest.options ? false : true);

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
          setOptions({});
          return;
        }
        onChange(name, fixOptions(value, data.data));
        // Save the new options
        if (!operatorsUrl) {
          setLoading(false);
        }
        setOptions(data.data);
        onOptionsLoaded?.(data.data);
      })();
    }
    if (qorus_instance && operatorsUrl) {
      (async () => {
        setOperators(undefined);
        setLoading(true);
        // Fetch the options for this mapper type
        const data = await fetchData(`/${operatorsUrl}`);

        if (data.error) {
          setLoading(false);
          setOperators({});
          return;
        }
        setOperators(data.data);
        // Save the new options
        setLoading(false);
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
          setOptions({});
          return;
        }
        // Save the new options
        if (!operatorsUrl) {
          setLoading(false);
        }
        setOptions(data.data);
        onOptionsLoaded?.(data.data);
        onChange(name, fixOptions({}, data.data));
      })();
    }
  }, [url, qorus_instance, customUrl]);

  useUpdateEffect(() => {
    if (operatorsUrl && qorus_instance) {
      (async () => {
        setOperators(undefined);
        setLoading(true);
        // Fetch the options for this mapper type
        const data = await fetchData(`/${operatorsUrl}`);

        if (data.error) {
          setLoading(false);
          setOperators({});
          return;
        }
        // Save the new options
        setLoading(false);
        setOperators(data.data);
      })();
    }
  }, [operatorsUrl, qorus_instance]);

  const handleValueChange = (
    optionName: string,
    currentValue: any = {},
    val?: any,
    type?: string
  ) => {
    // Check if this option is already added
    if (!currentValue[optionName]) {
      // If it's not, add potential default operators
      const defaultOperators: TOperatorValue = reduce(
        operators || {},
        (filteredOperators: TOperatorValue, operator, operatorKey) => {
          if (operator.selected) {
            return [...(filteredOperators as string[]), operatorKey];
          }

          return filteredOperators;
        },
        []
      );
      // If there are default operators, add them to the value
      if (defaultOperators?.length) {
        onChange(name, {
          ...currentValue,
          [optionName]: {
            type,
            value: val,
            op: defaultOperators,
          },
        });

        return;
      }
    }

    onChange(name, {
      ...currentValue,
      [optionName]: {
        ...currentValue[optionName],
        type,
        value: val,
      },
    });
  };

  const handleOperatorChange = (
    optionName: string,
    currentValue: IOptions,
    operator: string,
    index: number
  ) => {
    onChange(name, {
      ...currentValue,
      [optionName]: {
        ...currentValue[optionName],
        op: fixOperatorValue(currentValue[optionName].op).map((op, idx) => {
          if (idx === index) {
            return operator;
          }
          return op as string;
        }),
      },
    });
  };

  // Add empty operator at the provider index
  const handleAddOperator = (optionName, currentValue: IOptions, index: number) => {
    onChange(name, {
      ...currentValue,
      [optionName]: {
        ...currentValue[optionName],
        op: insertAtIndex(fixOperatorValue(currentValue[optionName].op), index, null),
      },
    });
  };

  const handleRemoveOperator = (optionName, currentValue: IOptions, index: number) => {
    onChange(name, {
      ...currentValue,
      [optionName]: {
        ...currentValue[optionName],
        op: fixOperatorValue(currentValue[optionName].op).filter((_op, idx) => idx !== index),
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
    return <ReqoreMessage intent="warning">{t('OptionsQorusInstanceRequired')}</ReqoreMessage>;
  }

  if (error) {
    return (
      <ReqoreMessage intent="danger" title={t('ErrorLoadingOptions')}>
        {t(error)}
      </ReqoreMessage>
    );
  }

  if ((operatorsUrl && !operators) || (!rest.options && !options)) {
    return <p>{t('LoadingOptions')}</p>;
  }

  if (!options || !size(options)) {
    return <ReqoreMessage intent="warning">{t('NoOptionsAvailable')}</ReqoreMessage>;
  }

  const addSelectedOption = (optionName: string) => {
    handleValueChange(
      optionName,
      value,
      options[optionName].default_value,
      getTypeAndCanBeNull(options[optionName].type, options[optionName].allowed_values).type
    );
  };

  const fixedValue = useMemo(() => fixOptions(value, options), [value, options]);
  const {
    availableOptions,
    unavailableOptionsCount,
  }: { availableOptions: IOptions; unavailableOptionsCount: number } = useMemo(() => {
    let _unavailableOptionsCount = 0;
    const _availableOptions = reduce(
      fixedValue,
      (newValue, option, optionName) => {
        // Check if this option is in the options schema
        // do not add it if not
        if (!options[optionName]) {
          _unavailableOptionsCount += 1;
          return newValue;
        }

        if (!isObject(option)) {
          return {
            ...newValue,
            [optionName]: {
              type: getType(options[optionName].type, operators, option.op),
              value: option,
            },
          };
        }

        return { ...newValue, [optionName]: option };
      },
      {}
    );

    return {
      availableOptions: _availableOptions,
      unavailableOptionsCount: _unavailableOptionsCount,
    };
  }, [options, fixedValue]);
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

  const getIntent = (name, type, value, op) => {
    const intent =
      validateField(getType(type), value, {
        has_to_have_value: true,
        ...options[name],
      }) && (operatorsUrl ? !!op : true)
        ? undefined
        : recordRequiresSearchOptions
        ? 'info'
        : 'danger';

    return intent;
  };

  return (
    <>
      {recordRequiresSearchOptions && !readOnly ? (
        <>
          <ReqoreMessage intent="info">
            This provider record requires some search options to be set. You can set them below.
          </ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
        </>
      ) : null}
      <ReqoreCollection
        label="Options"
        minColumnWidth="400px"
        responsiveTitle={false}
        headerSize={4}
        filterable
        sortable
        flat={false}
        minimal
        contentRenderer={(children) => (
          <>
            {unavailableOptionsCount ? (
              <>
                <ReqoreMessage intent="warning">
                  {`${unavailableOptionsCount} option(s) hidden because they are not supported on the current instance`}
                </ReqoreMessage>
                <ReqoreVerticalSpacer height={10} />
              </>
            ) : null}
            {children}
          </>
        )}
        badge={size(fixedValue)}
        intent={isValid === false ? 'danger' : undefined}
        style={{ width: '100%' }}
        items={map(
          availableOptions,
          ({ type, ...other }, optionName): IReqoreCollectionItemProps => ({
            label: optionName,
            size: 'small',
            customTheme: {
              main: 'main:lighten',
            },
            intent: getIntent(optionName, type, other.value, other.op),
            badge: getType(options[optionName].type),
            tooltip: {
              ...getGlobalDescriptionTooltip(options[optionName].desc, optionName),
              placement: 'top',
            },
            className: 'system-option',
            actions: [
              {
                icon: 'DeleteBinLine',
                intent: 'danger',
                show: !options[optionName].required && !readOnly,
                onClick: () => {
                  confirmAction('RemoveSelectedOption', () => removeSelectedOption(optionName));
                },
              },
            ],
            content: (
              <>
                {operators && size(operators) ? (
                  <>
                    <ReqoreControlGroup fill wrap className="operators">
                      {fixOperatorValue(other.op).map((operator, index) => (
                        <React.Fragment key={index}>
                          <SelectField
                            fixed
                            defaultItems={map(operators, (operator) => ({
                              name: operator.name,
                              desc: operator.desc,
                            }))}
                            disabled={readOnly}
                            value={operator && `${operators?.[operator].name}`}
                            onChange={(_n, val) => {
                              if (val !== undefined) {
                                handleOperatorChange(
                                  optionName,
                                  fixedValue,
                                  findKey(operators, (operator) => operator.name === val) as string,
                                  index
                                );
                              }
                            }}
                          />
                          {index === fixOperatorValue(other.op).length - 1 &&
                          operator &&
                          operators[operator].supports_nesting ? (
                            <ReqoreButton
                              icon="AddLine"
                              disabled={readOnly}
                              fixed
                              effect={PositiveColorEffect}
                              onClick={() => handleAddOperator(optionName, fixedValue, index + 1)}
                            />
                          ) : null}
                          {size(fixOperatorValue(other.op)) > 1 ? (
                            <ReqoreButton
                              disabled={readOnly}
                              icon="DeleteBinLine"
                              effect={NegativeColorEffect}
                              fixed
                              onClick={() => handleRemoveOperator(optionName, fixedValue, index)}
                            />
                          ) : null}
                        </React.Fragment>
                      ))}
                    </ReqoreControlGroup>
                    <ReqoreVerticalSpacer height={5} />
                  </>
                ) : null}
                <TemplateField
                  {...options[optionName]}
                  component={AutoField}
                  {...getTypeAndCanBeNull(type, options[optionName].allowed_values, other.op)}
                  className="system-option"
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
                  key={optionName}
                  arg_schema={options[optionName].arg_schema}
                  noSoft={!!rest?.options}
                  value={other.value}
                  sensitive={options[optionName].sensitive}
                  default_value={options[optionName].default_value}
                  allowed_values={options[optionName].allowed_values}
                  disabled={readOnly}
                  readOnly={readOnly}
                />
                {operators && size(operators) && size(other.op) ? (
                  <>
                    <ReqoreVerticalSpacer height={5} />
                    <ReqoreMessage size="small">
                      <ReqoreTagGroup>
                        <ReqoreTag size="small" labelKey="WHERE" label={optionName} />
                        <ReqoreTag
                          size="small"
                          labelKey="IS"
                          label={fixOperatorValue(other.op).join(' ')}
                        />
                        <ReqoreTag
                          size="small"
                          intent="info"
                          label={other.value?.toString() || ''}
                        />
                      </ReqoreTagGroup>
                    </ReqoreMessage>
                  </>
                ) : null}
              </>
            ),
          })
        )}
      />

      {size(filteredOptions) >= 1 && !readOnly ? (
        <>
          <ReqoreVerticalSpacer height={10} />
          <SelectField
            name="options"
            defaultItems={Object.keys(filteredOptions).map((option) => ({
              name: option,
              desc: options[option].desc,
            }))}
            fill
            onChange={(_name, value) => addSelectedOption(value)}
            placeholder={`${t(placeholder || 'AddNewOption')} (${size(filteredOptions)})`}
          />
        </>
      ) : null}
    </>
  );
};

const PreviewOptions = (props: Omit<IOptionsProps, 'onChange'>) => {
  const [value, setValue] = useState<IOptions>(props.value);

  return <Options value={value} onChange={(_name, val) => setValue(val)} {...props} />;
};

setupPreviews(PreviewOptions, () => ({
  Default: {
    name: 'options',
    options: {
      RequiredString: {
        type: ['string'] as IQorusType[],
        desc: 'A string',
        required: true,
        default_value: 'hello',
      },
    },
  },
}));

export default Options;
