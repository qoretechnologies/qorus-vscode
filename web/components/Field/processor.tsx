import React, { useState, useEffect, useContext } from 'react';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import Field from '.';
import ConnectorField from './connectors';
import ClassArray from './classArray';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { InitialContext } from '../../context/init';
import AutoField from './auto';
import useMount from 'react-use/lib/useMount';
import withTextContext from '../../hocomponents/withTextContext';
import { Callout, Spinner } from '@blueprintjs/core';

export type TProcessorArgs = { [arg: string]: string };
export type TProcessorArgsList = { id: number; prefix: string; name: string }[];
export type TTypeProvider = { path: string; name: string; type: string };
export type TProcessorOptions = { [key: string]: any };

export interface IProcessorField extends IField {
    value: {
        args: TProcessorArgs;
        'processor-input-type': TTypeProvider;
        'processor-output-type': TTypeProvider;
        options: TProcessorOptions;
    };
}

export const transformArgs: (
    args: TProcessorArgs | TProcessorArgsList,
    fromValue?: boolean
) => TProcessorArgs | TProcessorArgsList = (args, fromValue) => {
    if (fromValue) {
        let i = 0;
        return size(args) === 0
            ? []
            : (reduce(
                  args as TProcessorArgs,
                  (newArgs, type, arg) => {
                      // Build the list argument
                      const listArg = { id: i, prefix: arg, name: type };

                      i++;

                      return [...newArgs, listArg];
                  },
                  []
              ) as TProcessorArgsList);
    } else {
        return size(args) === 0
            ? undefined
            : (reduce(
                  args as TProcessorArgsList,
                  (newArgs: TProcessorArgs, arg) => ({ ...newArgs, [arg.prefix]: arg.name }),
                  {}
              ) as TProcessorArgs);
    }
};

const ProcessorField: React.FC<IFieldChange & IProcessorField> = ({ name, value, onChange, t }) => {
    const initialData = useContext(InitialContext);
    const [args, setArgs] = useState<TProcessorArgsList>(
        value ? (transformArgs(value.args, true) as TProcessorArgsList) : undefined
    );
    const [inputType, setInputType] = useState<TTypeProvider>(value?.['processor-input-type']);
    const [outputType, setOutputType] = useState<TTypeProvider>(value?.['processor-input-type']);
    const [options, setOptions] = useState<TProcessorOptions>(value?.options);
    const [types, setTypes] = useState(null);

    useMount(() => {
        if (initialData.qorus_instance) {
            (async () => {
                // Fetch the available types
                const types: any = await initialData.fetchData(`dataprovider/basetypes`);
                // Save the types
                setTypes(types.data);
            })();
        }
    });

    useUpdateEffect(() => {
        onChange(name, {
            args: transformArgs(args),
            'processor-input-type': inputType,
            'processor-output-type': outputType,
            options,
        });
    }, [args, inputType, outputType, options]);

    if (initialData.qorus_instance && !types) {
        return <Spinner size={20}>Loading...</Spinner>;
    }

    return (
        <div>
            <p>{t('Arguments')}</p>
            {!initialData?.qorus_instance ? (
                <Callout intent="warning">{t('ActiveInstanceRequired')}</Callout>
            ) : (
                <ClassArray
                    name="processor-args"
                    keyName="arg"
                    valueName="type"
                    defaultSelectItems={types.map((type) => ({
                        name: type.name,
                    }))}
                    withTextField
                    value={args}
                    canRemoveLast
                    onChange={(_name, value) => setArgs(value)}
                />
            )}
            <p>{t('InputType')}</p>
            {!initialData?.qorus_instance ? (
                <Callout intent="warning">{t('ActiveInstanceRequired')}</Callout>
            ) : (
                <ConnectorField
                    inline
                    value={inputType}
                    isInitialEditing={!!initialData.class}
                    name={name}
                    onChange={(_name, value) => setInputType(value)}
                />
            )}
            <p>{t('OutputType')}</p>
            {!initialData?.qorus_instance ? (
                <Callout intent="warning">{t('ActiveInstanceRequired')}</Callout>
            ) : (
                <ConnectorField
                    inline
                    value={inputType}
                    isInitialEditing={!!initialData.class}
                    name={name}
                    onChange={(_name, value) => setOutputType(value)}
                />
            )}
            <p>{t('Options')}</p>
            <AutoField
                defaultType="hash"
                onChange={(name, value) => setOptions(value)}
                value={options}
                requestFieldData={(data) => (data === 'can_be_undefined' ? true : 'hash')}
            />
        </div>
    );
};

export default withTextContext()(ProcessorField);
