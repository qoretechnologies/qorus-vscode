import React, { FC, useCallback, useContext } from 'react';
import { Button, ButtonGroup, Tooltip } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { InitialContext } from '../../context/init';

export interface IAddFieldProps {
    onClick: any;
    isCustom: boolean;
    canManageFields: boolean;
    field: any;
    t: TTranslator;
}

const AddFieldButton: FC<IAddFieldProps> = ({ onClick, isCustom, canManageFields, field, t }) => {
    const initContext = useContext(InitialContext);

    const onAddClick = useCallback(() => {
        onClick(field);
    }, [field]);

    const onEditClick = useCallback(() => {
        onClick(field, true);
    }, [field]);

    const onDeleteClick = useCallback(() => {
        onClick(field, false, true);
    }, [field]);

    return (
        <ButtonGroup
            style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
            }}
        >
            {isCustom ? (
                <Tooltip content={t('EditMapperField')}>
                    <Button
                        onClick={onEditClick}
                        className="field-manage"
                        icon="edit"
                        small
                        minimal
                        style={{ minWidth: '18px', minHeight: '18px' }}
                    />
                </Tooltip>
            ) : null}
            {isCustom && (
                <Tooltip content={t('RemoveMapperField')}>
                    <Button
                        className="field-manage"
                        onClick={() => initContext.confirmAction('ConfirmRemoveField', onDeleteClick)}
                        icon="trash"
                        small
                        minimal
                        intent="danger"
                        style={{ minWidth: '18px', minHeight: '18px' }}
                    />
                </Tooltip>
            )}
            {canManageFields && (
                <Tooltip content={t('AddNewMapperField')}>
                    <Button
                        onClick={onAddClick}
                        minimal
                        icon="small-plus"
                        small
                        style={{ minWidth: '18px', minHeight: '18px' }}
                    />
                </Tooltip>
            )}
        </ButtonGroup>
    );
};

export default withTextContext()(AddFieldButton);
