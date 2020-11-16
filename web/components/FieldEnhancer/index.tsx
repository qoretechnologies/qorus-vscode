import capitalize from 'lodash/capitalize';
import React, { useContext, useState } from 'react';
import { Messages } from '../../constants/messages';
import { CreateInterface } from '../../containers/InterfaceCreator';
import { FieldContext } from '../../context/fields';
import { InitialContext } from '../../context/init';
import { MapperContext } from '../../context/mapper';
import { TextContext } from '../../context/text';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import CustomDialog from '../CustomDialog';

export interface IFieldEnhancerProps {
    children: (onEditClick: any, onCreateClick: any) => any;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    context?: any;
}

const FieldEnhancer: React.FC<IFieldEnhancerProps> = ({ children, addMessageListener, postMessage, context }) => {
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
    const mapperContext = useContext(MapperContext);

    const handleCreateClick = (reference: any, onSubmit?: () => any) => {
        // Set the context for the mapper if this is
        // mapper interface
        if (reference.iface_kind === 'mapper' && context?.static_data) {
            mapperContext.setMapper({
                interfaceContext: context,
            });
        }
        // Open the dialog
        setEditManager({
            isOpen: true,
            changeType: 'CreateInterface',
            interfaceKind: reference.iface_kind,
            context: context || (reference.type && reference.type !== '' ? { type: capitalize(reference.type) } : null),
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
            // Set the context for the mapper if this is
            // mapper interface
            if (reference.iface_kind === 'mapper' && context?.static_data) {
                mapperContext.setMapper({
                    interfaceContext: context,
                });
            }
            // Open the dialog
            setEditManager({
                isOpen: true,
                interfaceKind: reference.iface_kind,
                originalName: iface_name,
                changeType: 'EditInterface',
                context,
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
                        onSubmit={(data) => {
                            const name: string = data.name || data['class-class-name'];
                            const version: string =
                                editManager.interfaceKind === 'mapper' || editManager.interfaceKind === 'step'
                                    ? `:${data.version}`
                                    : '';

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
