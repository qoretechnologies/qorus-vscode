import { ReqoreButton, ReqoreControlGroup, ReqoreTag } from '@qoretechnologies/reqore';
import size from 'lodash/size';
import { FunctionComponent, useContext } from 'react';
import styled from 'styled-components';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';

const StyledFieldLabel = styled.div`
  padding: 0px 0 0 10px;
  flex: 0 1 auto;
  display: flex;
  justify-content: flex-end;
  align-items: center;
`;

export interface IFieldActions {
  desc?: string;
  name?: string;
  onClick: (name: string) => any;
  removable: boolean;
  value: any;
  parentValue?: any;
  onResetClick: () => any;
  isSet: boolean;
  disabled: boolean;
}

const FieldActions: FunctionComponent<IFieldActions> = ({
  desc,
  name,
  onClick,
  removable,
  value,
  parentValue,
  onResetClick,
  isSet,
  disabled,
}) => {
  const initContext = useContext(InitialContext);
  const t = useContext(TextContext);

  return (
    <StyledFieldLabel>
      <ReqoreControlGroup>
        {isSet && parentValue !== undefined && !disabled ? (
          <ReqoreButton
            icon={'HistoryLine'}
            tooltip={t('ResetFieldToOriginal')}
            intent="warning"
            onClick={() => {
              initContext.confirmAction(
                'ConfirmResetField',
                () => onResetClick(),
                'Reset',
                'warning'
              );
            }}
          />
        ) : null}
        {removable && (
          <ReqoreButton
            icon={'DeleteBin6Line'}
            tooltip={t('RemoveField')}
            intent="danger"
            onClick={() => {
              if (onClick) {
                if (size(value)) {
                  initContext.confirmAction('ConfirmRemoveField', () => onClick(name));
                } else {
                  onClick(name);
                }
              }
            }}
          />
        )}
        {desc && (
          <ReqoreTag
            tooltip={{
              content: desc,
              intent: 'info',
              placement: 'left',
              flat: false,
              maxWidth: '600px',
            }}
            icon={'QuestionMark'}
          />
        )}
      </ReqoreControlGroup>
    </StyledFieldLabel>
  );
};

export default FieldActions;
