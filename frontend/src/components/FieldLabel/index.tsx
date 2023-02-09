import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreSpacer,
  ReqoreTag,
} from '@qoretechnologies/reqore';
import { size } from 'lodash';
import { FunctionComponent, useContext } from 'react';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';

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

export interface IFieldLabel extends IFieldActions {
  label?: string;
  isValid: boolean;
  info?: string;
  type?: string;
}

const FieldLabel: FunctionComponent<IFieldLabel> = ({
  label,
  isValid,
  info,
  type,
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
    <>
      <ReqoreControlGroup vertical>
        <ReqoreTag
          width="200px"
          color={isValid ? 'success' : 'danger'}
          label={label}
          icon={isValid ? 'CheckLine' : 'ErrorWarningLine'}
          actions={[
            {
              icon: 'QuestionMark',
              tooltip: {
                content: desc,
                intent: 'info',
                placement: 'right',
                maxWidth: '600px',
              },
            },
            {
              icon: 'DeleteBinLine',
              intent: 'danger',
              tooltip: t('RemoveField'),
              onClick: () => {
                if (onClick) {
                  if (size(value)) {
                    initContext.confirmAction('ConfirmRemoveField', () => onClick(name));
                  } else {
                    onClick(name);
                  }
                }
              },
            },
          ]}
          minimal
        />
        {type && <ReqoreTag label={type} asBadge minimal icon="CodeLine" />}
        {info && (
          <ReqoreTag
            label={info}
            minimal
            width="200px"
            size="small"
            icon="InformationLine"
            intent="muted"
          />
        )}
      </ReqoreControlGroup>
      <ReqoreSpacer width={10} />
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
      </ReqoreControlGroup>
    </>
  );
};

export default FieldLabel;
