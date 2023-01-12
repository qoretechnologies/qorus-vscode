import { ReqoreControlGroup, ReqoreSpacer, ReqoreTag } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';

export interface IFieldLabel {
  label?: string;
  isValid: boolean;
  info?: string;
  type?: string;
}

const FieldLabel: FunctionComponent<IFieldLabel> = ({ label, isValid, info, type }) => (
  <>
    <ReqoreControlGroup vertical>
      <ReqoreTag
        width="200px"
        color={isValid ? 'transparent' : 'danger'}
        label={label}
        icon={isValid ? 'CheckboxBlankCircleFill' : 'ErrorWarningLine'}
        minimal
      />
      {type && <ReqoreTag label={type} asBadge minimal size="small" icon="CodeLine" />}
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
  </>
);

export default FieldLabel;
