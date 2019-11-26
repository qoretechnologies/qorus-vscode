import React, { FC, useCallback } from 'react';
import { Button, ButtonGroup } from '@blueprintjs/core';

export interface IAddFieldProps {
    onClick: any;
    isCustom: boolean;
    isOutput: boolean;
    canManageFields: boolean;
    field: any;
    onManageClick: any;
}

const AddFieldButton: FC<IAddFieldProps> = ({ onClick, isCustom, isOutput, canManageFields, field, onManageClick }) => {
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
        <>
            {isOutput && (
                <Button
                    style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)', left: '-12px' }}
                    icon="cog"
                    small
                    onClick={onManageClick}
                />
            )}
            <ButtonGroup style={{ position: 'absolute', bottom: '-12px', left: '50%', transform: 'translateX(-50%)' }}>
                {canManageFields && <Button onClick={onAddClick} icon="small-plus" small />}
                {isCustom ? <Button onClick={onEditClick} icon="edit" small /> : null}
                {isCustom && <Button onClick={onDeleteClick} icon="trash" small intent="danger" />}
            </ButtonGroup>
        </>
    );
};

export default AddFieldButton;
