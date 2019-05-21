import React, { FunctionComponent, useState } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import { size, map } from 'lodash';

export interface IInterfaceCreatorPanel {
    type: string;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
}

const InterfaceCreatorPanel: FunctionComponent<IInterfaceCreatorPanel> = ({
    type,
    addMessageListener,
    postMessage,
}) => {
    const [fields, setFields] = useState([]);

    useEffectOnce(() => {
        addMessageListener(Messages.FIELDS_FETCHED, (data: any) => {
            // Save the fields
            setFields(data.fields);
        });
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type });
    });

    if (!size(fields)) {
        return <p> Loading fields... </p>;
    }

    return (
        <>
            {map(fields, (field: any, fieldName: string) => (
                <p>{fieldName}</p>
            ))}
        </>
    );
};

export default withMessageHandler()(InterfaceCreatorPanel);
