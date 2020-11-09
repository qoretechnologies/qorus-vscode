import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { IFSMState, IFSMTransition } from '.';
import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import { TextContext } from '../../../context/text';
import { ActionsWrapper, ContentWrapper } from '../panel';

const StyledOrderWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 50px;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 10px;

    > span {
        font-size: 15px;
    }

    &:nth-child(even) {
        background-color: #eee;
        border-color: #ddd;
    }
`;

export interface IOrderDialogProps {
    onClose: () => any;
    data: (IFSMState | IFSMTransition)[];
    changeOrder: (start: number, target: number) => void;
    onEditClick: (index: number) => void;
    onDeleteClick: (index) => void;
    isDisabled?: boolean;
    onResetClick: () => any;
    onSubmitClick: () => any;
    title?: string;
    metadata?: (data: IFSMState | IFSMTransition) => JSX.Element;
}

const OrderDialog: React.FC<IOrderDialogProps> = ({
    onClose,
    data,
    changeOrder,
    onEditClick,
    onDeleteClick,
    title,
    metadata,
    isDisabled,
    onResetClick,
    onSubmitClick,
    dialogTitle,
}) => {
    const t = useContext(TextContext);

    return (
        <CustomDialog onClose={onClose} isOpen title={t(dialogTitle)} style={{ width: '80vw', paddingBottom: 0 }}>
            <Content style={{ backgroundColor: '#fff', borderTop: '1px solid #d7d7d7', padding: '10px' }}>
                <ContentWrapper style={{ padding: 0 }}>
                    {data.map((datum, index) => (
                        <>
                            <StyledOrderWrapper key={index}>
                                <span name="fsm-transition-order-name">
                                    <strong>{index + 1}.</strong> {title || datum.name || ''}{' '}
                                    {metadata ? metadata(datum) : ''}
                                </span>
                                <ButtonGroup>
                                    <Tooltip content={t('MoveItemUp')}>
                                        <Button
                                            icon="arrow-up"
                                            disabled={index === 0}
                                            onClick={() => changeOrder(index, index - 1)}
                                            name="fsm-move-transition-up"
                                        />
                                    </Tooltip>
                                    <Tooltip content={t('MoveItemDown')}>
                                        <Button
                                            icon="arrow-down"
                                            disabled={index === data.length - 1}
                                            onClick={() => changeOrder(index, index + 1)}
                                            name="fsm-move-transition-down"
                                        />
                                    </Tooltip>
                                    <Tooltip content={t('Edit')}>
                                        <Button
                                            icon="edit"
                                            intent="warning"
                                            onClick={() => onEditClick(datum.keyId || index)}
                                            name="fsm-edit-transition"
                                        />
                                    </Tooltip>
                                    <Tooltip content={t('Delete')}>
                                        <Button
                                            icon="trash"
                                            intent="danger"
                                            onClick={() => onDeleteClick(datum.keyId || index)}
                                            name="fsm-delete-transition"
                                        />
                                    </Tooltip>
                                </ButtonGroup>
                            </StyledOrderWrapper>
                        </>
                    ))}
                </ContentWrapper>
                <ActionsWrapper>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button text={t('Reset')} icon={'history'} onClick={onResetClick} />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            icon={'tick'}
                            name="fsm-submit-transitions"
                            intent={Intent.SUCCESS}
                            disabled={isDisabled}
                            onClick={onSubmitClick}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default OrderDialog;
