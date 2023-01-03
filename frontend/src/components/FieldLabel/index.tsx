import { ReqoreControlGroup, ReqoreSpacer, ReqoreTag } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';

export interface IFieldLabel {
  label?: string;
  isValid: boolean;
  info?: string;
}

const FieldLabel: FunctionComponent<IFieldLabel> = ({ label, isValid, info }) => (
  <>
    <ReqoreControlGroup vertical>
      <ReqoreTag
        width="200px"
        color={isValid ? 'transparent' : 'danger'}
        label={label}
        icon={isValid ? undefined : 'ErrorWarningLine'}
        minimal
      />
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
