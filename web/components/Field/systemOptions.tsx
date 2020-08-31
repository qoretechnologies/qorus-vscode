import React, { useState, useContext } from 'react';
import useMount from 'react-use/lib/useMount';
import { TextContext } from '../../context/text';
import map from 'lodash/map';
import AutoField from './auto';
import SubField from '../SubField';

const SystemOptions = ({ name, value, onChange }) => {
    const t = useContext(TextContext);
    const [options, setOptions] = useState({});

    useMount(() => {
        setOptions({
            'stack-size': {
                type: 'byte-size',
                desc: 'Stack size description',
                name: 'Stack size',
            },
        });
    });

    if (!options) {
        return <p>{t('Loading')}</p>;
    }

    return map(options, ({ type, desc, ...rest }, optionName) => (
        <>
            <SubField title={rest.name || optionName} desc={desc}>
                <AutoField
                    type={type}
                    defaultType={type}
                    name={optionName}
                    onChange={(optionName, val) =>
                        onChange(name, {
                            ...value,
                            [optionName]: {
                                type,
                                value: val,
                            },
                        })
                    }
                    value={value?.[optionName]?.value}
                />
            </SubField>
        </>
    ));
};

export default SystemOptions;
