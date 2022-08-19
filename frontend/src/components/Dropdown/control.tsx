/* @flow */
import React from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';

const Control = ({ children, small, noCaret, intent, icon, iconName, onClick, disabled }) => {
    const newIcon = icon || iconName;
    const newIconName = !newIcon && !children ? 'caret-down' : newIcon;
    const rightIconName = !newIcon && !children ? undefined : 'caret-down';

    return children || newIcon || !noCaret ? (
        <ButtonGroup>
            <Button
                small={small}
                type="button"
                text={children}
                intent={intent}
                icon={newIconName}
                rightIcon={!noCaret ? rightIconName : null}
                onClick={onClick}
                disabled={disabled}
            />
        </ButtonGroup>
    ) : null;
};

Control.displayName = 'DropdownControl';

export default Control;
