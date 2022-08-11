import React, { useContext } from 'react';

import useEffectOnce from 'react-use/lib/useEffectOnce';
import shortid from 'shortid';

import { Dialog, IDialogProps } from '@blueprintjs/core';

import { DialogsContext } from '../../context/dialogs';

export interface ICustomDialogProps extends IDialogProps {
    children: any;
    noBottomPad?: boolean;
}

const CustomDialog: React.FC<ICustomDialogProps> = ({ children, noBottomPad, ...rest }) => {
    const dialogContext = useContext(DialogsContext);

    useEffectOnce(() => {
        const id = shortid.generate();

        dialogContext.addDialog(id, rest.onClose);
        // Remove the dialog when unmounted
        return () => {
            dialogContext.removeDialog(id);
        };
    });

    return (
        <Dialog {...rest} canEscapeKeyClose={false}>
            {children}
        </Dialog>
    );
};

export default CustomDialog;
