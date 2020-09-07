import React, { useState, useContext, useEffect } from 'react';
import useMount from 'react-use/lib/useMount';
import { TextContext } from '../../context/text';
import map from 'lodash/map';
import size from 'lodash/size';
import reduce from 'lodash/reduce';
import AutoField from './auto';
import SubField from '../SubField';
import SelectField from './select';
import { Classes, Icon, Callout } from '@blueprintjs/core';
import { InitialContext } from '../../context/init';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import Spacer from '../Spacer';

const Options = ({ name, value, onChange, url, ...rest }) => {
    const t = useContext(TextContext);
    const [options, setOptions] = useState({});
    const [selectedOptions, setSelectedOptions] = useState(value);
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
                setSelectedOptions(null);
                removeValue();
                // Fetch the options for this mapper type
                const data = await fetchData(`/options/${url}`);
                // Save the new options
                setOptions(data.data);
            })();
        }
    }, [url, qorus_instance]);

    const handleValueChange = (optionName: string, val: any, type: string) => {
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
        setSelectedOptions((current) => ({
            ...current,
            [optionName]: options[optionName],
        }));
    };

    const removeSelectedOption = (optionName: string) => {
        setSelectedOptions((current) => {
            const result = { ...current };

            delete result[optionName];

            return result;
        });
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
            if (selectedOptions && selectedOptions[name]) {
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
            {map(selectedOptions, ({ type, desc, ...rest }, optionName) => (
                <SubField
                    title={rest.name || optionName}
                    desc={desc}
                    onRemove={() => {
                        confirmAction('RemoveSelectedOption', () => removeSelectedOption(optionName));
                    }}
                >
                    <AutoField
                        {...getTypeAndCanBeNull(type)}
                        name={optionName}
                        onChange={(optionName, val) => handleValueChange(optionName, val, type)}
                        value={value?.[optionName]?.value}
                    />
                </SubField>
            ))}
            {size(selectedOptions) === 0 && (
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
