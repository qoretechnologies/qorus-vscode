import { Callout, Spinner } from '@blueprintjs/core';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import { InitialContext } from '../../context/init';
import withTextContext from '../../hocomponents/withTextContext';
import ClassArray from './classArray';
import ConnectorField from './connectors';

export type TProcessorArgs = { [arg: string]: string };
export type TProcessorArgsList = { id: number; prefix: string; name: string }[];
export type TTypeProvider = { path: string; name: string; type: string };

export interface IProcessorField extends IField {
    value: {
        args: TProcessorArgs;
        'processor-input-type': TTypeProvider;
        'processor-output-type': TTypeProvider;
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
        if (!value) {
            onChange(name, {
                args: undefined,
                'processor-input-type': undefined,
                'processor-output-type': undefined,
            });
        }
    });

    useUpdateEffect(() => {
        onChange(name, {
            args: transformArgs(args),
            'processor-input-type': inputType,
            'processor-output-type': outputType,
        });
    }, [args, inputType, outputType]);

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
        </div>
    );
};

export default withTextContext()(ProcessorField);
