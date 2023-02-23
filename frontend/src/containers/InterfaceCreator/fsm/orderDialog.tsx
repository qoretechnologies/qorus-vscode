import { ReqoreButton, ReqoreControlGroup, ReqoreMessage } from '@qoretechnologies/reqore';
import { size } from 'lodash';
import React, { useContext } from 'react';
import styled from 'styled-components';
import { IFSMState, IFSMTransition } from '.';
import Content from '../../../components/Content';
import { SaveColorEffect } from '../../../components/Field/multiPair';
import { TextContext } from '../../../context/text';

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
    <Content
      padded={false}
      minimal
      transparent
      bottomActions={[
        {
          label: t('Reset'),
          onClick: onResetClick,
          icon: 'HistoryLine',
          tooltip: t('ResetTooltip'),
        },
        {
          label: t('Submit'),
          onClick: onSubmitClick,
          icon: 'CheckLine',
          effect: SaveColorEffect,
          tooltip: t('SubmitTooltip'),
          disabled: isDisabled,
          position: 'right',
        },
      ]}
    >
      <ReqoreControlGroup vertical fill>
        {size(data) === 0 ? (
          <ReqoreMessage intent="muted" fluid>
            No transitions exist for this state
          </ReqoreMessage>
        ) : null}
        {data.map((datum, index) => (
          <ReqoreControlGroup key={index} stack fill fluid>
            <ReqoreButton description={metadata ? metadata(datum) : ''}>
              {index + 1}. {title || datum.name || ''}
            </ReqoreButton>
            <ReqoreButton
              fixed
              tooltip={t('MoveItemUp')}
              icon="ArrowUpLine"
              disabled={index === 0}
              onClick={() => changeOrder(index, index - 1)}
            />
            <ReqoreButton
              fixed
              tooltip={t('MoveItemDown')}
              icon="ArrowDownLine"
              disabled={index === data.length - 1}
              onClick={() => changeOrder(index, index + 1)}
            />
            <ReqoreButton
              fixed
              tooltip={t('Edit')}
              icon="EditLine"
              onClick={() => onEditClick(datum.keyId || index)}
            />
            <ReqoreButton
              fixed
              tooltip={t('Delete')}
              icon="DeleteBinLine"
              intent="danger"
              onClick={() => onDeleteClick(datum.keyId || index)}
            />
          </ReqoreControlGroup>
        ))}
      </ReqoreControlGroup>
    </Content>
  );
};

export default OrderDialog;
