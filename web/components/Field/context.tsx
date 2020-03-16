import React, { FunctionComponent, useState, useEffect } from 'react';
import { ControlGroup } from '@blueprintjs/core';
import { IFieldChange, IField } from '../../containers/InterfaceCreator/panel';
import SelectField from './select';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import String from './string';
import useMount from 'react-use/lib/useMount';

export interface IContextField {
    value: {
        iface_kind: string;
        name: string;
    };
}

const ContextField: FunctionComponent<IContextField & IFieldChange & IField> = ({
    onChange,
    value = {},
    default_value,
    name,
    read_only,
    disabled,
}) => {
    const [ifaces, setIfaces] = useState(null);

    useMount(() => {
        if (default_value) {
            onChange(name, default_value);
        }
    });

    useEffect(() => {
        if (value.iface_kind) {
            // Fetch the interfaces
            setIfaces(
                value.iface_kind === 'workflow'
                    ? [
                          {
                              name: 'Workflow123:1.0',
                          },
                          {
                              name: 'SuperWorkflow555:1.0',
                          },
                      ]
                    : [
                          {
                              name: 'Service6666:1.0',
                          },
                          {
                              name: 'AnotherService555:1.0',
                          },
                      ]
            );
        }
    }, [value.iface_kind]);

    if (read_only || disabled) {
        return <String name={name} read_only value={`${default_value.iface_kind}:${default_value.name}`} />;
    }

    return (
        <div>
            <ControlGroup fill>
                <SelectField
                    name="iface_kind"
                    value={value.iface_kind}
                    defaultItems={[
                        {
                            name: 'workflow',
                        },
                        {
                            name: 'service',
                        },
                    ]}
                    onChange={(_fieldName: string, val: string) => {
                        onChange(name, { iface_kind: val });
                        setIfaces(null);
                    }}
                    fill
                />
                {ifaces && (
                    <SelectField
                        name="name"
                        value={value.name}
                        defaultItems={ifaces}
                        onChange={(_fieldName: string, val: string) => {
                            onChange(name, { ...value, name: val });
                        }}
                        fill
                    />
                )}
            </ControlGroup>
        </div>
    );
};

export default withMessageHandler()(ContextField);
