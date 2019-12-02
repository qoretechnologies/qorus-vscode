import React, { FC, useCallback } from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';

export interface IAddFieldProps {
    onClick: any;
    isCustom: boolean;
    canManageFields: boolean;
    field: any;
}

const AddFieldButton: FC<IAddFieldProps> = ({ onClick, isCustom, canManageFields, field }) => {
    const onAddClick = useCallback(() => {
        onClick(field);
    }, []);

    const onEditClick = useCallback(() => {
        onClick(field, true);
    }, []);

    const onDeleteClick = useCallback(() => {
        onClick(field, false, true);
    }, []);

    return (
        <ButtonGroup
            style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
            }}
        >
            {canManageFields && (
                <Button
                    onClick={onAddClick}
                    minimal
                    icon="small-plus"
                    small
                    style={{ minWidth: '18px', minHeight: '18px' }}
                />
            )}
            {isCustom ? (
                <Button
                    onClick={onEditClick}
                    className="field-manage"
                    icon="edit"
                    small
                    minimal
                    style={{ minWidth: '18px', minHeight: '18px' }}
                />
            ) : null}
            {isCustom && (
                <Button
                    className="field-manage"
                    onClick={onDeleteClick}
                    icon="trash"
                    small
                    minimal
                    intent="danger"
                    style={{ minWidth: '18px', minHeight: '18px' }}
                />
            )}
        </ButtonGroup>
    );
};

export default AddFieldButton;
