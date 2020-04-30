import React, { useContext, useState } from 'react';

import { Messages } from '../../constants/messages';
import { CreateInterface } from '../../containers/InterfaceCreator';
import { FieldContext } from '../../context/fields';
import { InitialContext } from '../../context/init';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import CustomDialog from '../CustomDialog';
import { TextContext } from '../../context/text';
import capitalize from 'lodash/capitalize';

export interface IFieldEnhancerProps {
    children: (onEditClick: any, onCreateClick: any) => any;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
}

const FieldEnhancer: React.FC<IFieldEnhancerProps> = ({ children, addMessageListener, postMessage }) => {
    const [editManager, setEditManager] = useState<{
        interfaceKind?: string;
        isOpen?: boolean;
        onSubmit?: () => any;
        originalName: string;
        changeType: string;
    }>({});
    const initialData = useContext(InitialContext);
    const fields = useContext(FieldContext);
    const t = useContext(TextContext);

    const handleCreateClick = (reference: any, onSubmit?: () => any) => {
        // First reset the current fields of the same kind
        fields.resetFields(reference.iface_kind);
        // Remove leftover data
        initialData.changeInitialData(reference.iface_kind, null);
        // Open the dialog
        setEditManager({
            isOpen: true,
            changeType: 'CreateInterface',
            interfaceKind: reference.iface_kind,
            context: { type: capitalize(reference.type) },
            onSubmit,
            onClose: () => {
                // Reset the current fields of the same kind
                fields.resetFields(reference.iface_kind);
            },
        });
    };

    const handleEditClick = (iface_name: string, reference: any, onSubmit?: () => any) => {
        const iface_kind = reference.iface_kind === 'other' ? reference.type : reference.iface_kind;
        // Add message listener for the interface data
        const listener = addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
            // First reset the current fields of the same kind
            fields.resetFields(reference.iface_kind);
            // Set the new data
            initialData.changeInitialData(reference.iface_kind, data[iface_kind]);
            // Open the dialog
            setEditManager({
                isOpen: true,
                interfaceKind: reference.iface_kind,
                originalName: iface_name,
                changeType: 'EditInterface',
                onSubmit,
                onClose: () => {
                    // Reset the current fields of the same kind
                    fields.resetFields(reference.iface_kind);
                    // Set the new data
                    initialData.changeInitialData(reference.iface_kind, null);
                },
            });
            // Remove this listener
            listener();
        });
        // Get the interface data
        postMessage(Messages.GET_INTERFACE_DATA, {
            ...reference,
            iface_kind,
            custom_data: reference.type ? { type: reference.type } : null,
            name: iface_name,
        });
    };

    return (
        <>
            {editManager.isOpen && (
                <CustomDialog
                    onClose={() => {
                        editManager.onClose();
                        setEditManager({});
                    }}
                    title={t(editManager.changeType)}
                    isOpen
                    style={{ width: '95vw', height: '95vh' }}
                >
                    <CreateInterface
                        initialData={{ ...initialData, subtab: editManager.interfaceKind }}
                        context={editManager.context}
                        onSubmit={data => {
                            const name: string = data.name || data['class-class-name'];
                            const version: string = editManager.interfaceKind === 'mapper' ? data.version : '';

                            editManager.onSubmit(editManager.originalName, `${name}${version}`);
                            setEditManager({});
                        }}
                    />
                </CustomDialog>
            )}
            {children(handleEditClick, handleCreateClick)}
        </>
    );
};

export default withMessageHandler()(FieldEnhancer);
