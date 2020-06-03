import React, { useState } from 'react';
import SelectField from '../../../components/Field/select';
import useMount from 'react-use/lib/useMount';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../../hocomponents/withMessageHandler';
import { ButtonGroup, Spinner } from '@blueprintjs/core';

export interface IConnectorSelectorProps {
    value: {
        class: string;
        connector: string;
    };
    onChange: (value: { class: string; connector: string }) => void;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
}

export interface IClass {
    name: string;
    desc: string;
    'class-connectors': IConnector[];
}

export interface IConnector {
    name: string;
    type: 'input' | 'output' | 'input-output' | 'event' | 'condition';
}

const allowedConnectorTypes: string[] = ['input', 'input-output', 'output'];

const ConnectorSelector = ({ value, onChange, addMessageListener, postMessage }: IConnectorSelectorProps) => {
    const [classes, setClasses] = useState<IClass[]>(null);

    useMount(() => {
        addMessageListener('creator-return-objects', (data) => {
            if (data.object_type === 'class-with-connectors') {
                setClasses(data.objects);
            }
        });

        postMessage('creator-get-objects', {
            object_type: 'class-with-connectors',
            custom_data: {
                connector_type: ['input', 'output', 'input-output'],
            },
        });
    });

    const getConnectors = (): IConnector[] => {
        const selectedClass: IClass = classes.find((clss) => clss.name === value['class']);

        return selectedClass['class-connectors'].filter((connector) => allowedConnectorTypes.includes(connector.type));
    };

    const handleChange = (name: string, val: any) => {
        console.log(name, val);
        let newValue = value;

        if (name === 'class' && newValue) {
            newValue.connector = null;
        }

        onChange({
            ...value,
            [name]: val,
        });
    };

    if (!classes) {
        return <Spinner size={16} />;
    }

    return (
        <ButtonGroup>
            <SelectField onChange={handleChange} value={value?.['class']} name="class" defaultItems={classes} />
            {value?.['class'] && (
                <SelectField
                    defaultItems={getConnectors()}
                    onChange={handleChange}
                    value={value?.connector}
                    name="connector"
                />
            )}
        </ButtonGroup>
    );
};

export default withMessageHandler()(ConnectorSelector);
