import React, { useContext, useState } from 'react';

import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import useMount from 'react-use/lib/useMount';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { isObject } from 'util';

import { Callout, Classes, Icon } from '@blueprintjs/core';

import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import Spacer from '../Spacer';
import SubField from '../SubField';
import AutoField from './auto';
import SelectField from './select';

export const fixOptions = (value, options) => {
    return reduce(
        value,
        (newValue, option, optionName) => {
            if (!isObject(option)) {
                return {
                    ...newValue,
                    [optionName]: {
                        type: options[optionName].type,
                        value: option,
                    },
                };
            }

            return { ...newValue, [optionName]: option };
        },
        {}
    );
};

const Options = ({ name, value, onChange, url, ...rest }) => {
    const t = useContext(TextContext);
    const [options, setOptions] = useState({});
    //const [selectedOptions, setSelectedOptions] = useState(null);
    const { fetchData, confirmAction, qorus_instance } = useContext(InitialContext);
    const [error, setError] = useState<string>(null);

    useMount(() => {
        if (qorus_instance) {
            (async () => {
                setOptions(null);
                // Fetch the options for this mapper type
                const data = await fetchData(`/options/${url}`);

                if (data.error) {
                    setError(data.error.error);
                    return;
                }
                onChange(name, fixOptions(value, data.data));
                // Save the new options
                setOptions(data.data);
            })();
        }
    });

    useUpdateEffect(() => {
        if (url && qorus_instance) {
            (async () => {
                setOptions(null);
                setError(null);
                removeValue();
                // Fetch the options for this mapper type
                const data = await fetchData(`/options/${url}`);
                // Save the new options
                setOptions(data.data);
            })();
        }
    }, [url, qorus_instance]);

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
        handleValueChange(optionName, null, options[optionName].type);
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

    const filteredOptions = reduce(
        options,
        (newOptions, option, name) => {
            if (value && value[name]) {
                return newOptions;
            }

            return { ...newOptions, [name]: option };
        },
        {}
    );

    const getTypeAndCanBeNull = (type: string) => {
        if (type.startsWith('*')) {
            return {
                type: type.replace('*', ''),
                defaultType: type.replace('*', ''),
                canBeNull: true,
            };
        }

        return {
            type,
            defaultType: type,
        };
    };

    return (
        <>
            {map(fixOptions(value, options), ({ type, ...rest }, optionName) =>
                !!options[optionName] ? (
                    <SubField
                        title={rest.name || optionName}
                        desc={options[optionName].desc}
                        onRemove={() => {
                            confirmAction('RemoveSelectedOption', () => removeSelectedOption(optionName));
                        }}
                    >
                        <AutoField
                            {...getTypeAndCanBeNull(type)}
                            name={optionName}
                            onChange={(optionName, val) => handleValueChange(optionName, val, type)}
                            value={value?.[optionName]?.value}
                            default_value={options[optionName].default}
                            radioItems={options[optionName].allowed_values}
                        />
                    </SubField>
                ) : null
            )}
            {size(value) === 0 && (
                <p className={Classes.TEXT_MUTED}>
                    <Icon icon="info-sign" /> {t('NoOptionsSelected')}
                </p>
            )}
            <Spacer size={10} />
            {size(filteredOptions) >= 1 && (
                <SelectField
                    name="options"
                    defaultItems={Object.keys(filteredOptions).map((option) => ({ name: option }))}
                    onChange={(_name, value) => addSelectedOption(value)}
                    placeholder={`${t('AddNewOption')} (${size(filteredOptions)})`}
                />
            )}
        </>
    );
};

export default Options;
