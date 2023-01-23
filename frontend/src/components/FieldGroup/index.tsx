import { ReqoreColumns } from '@qoretechnologies/reqore';
import { IReqorePanelProps, ReqorePanel } from '@qoretechnologies/reqore/dist/components/Panel';

const FieldGroup = ({ children, isValid, ...rest }: IReqorePanelProps & { isValid?: boolean }) => (
  <ReqorePanel
    collapsible
    minimal
    icon="Group2Line"
    size="small"
    {...rest}
    intent={isValid ? rest.intent : 'danger'}
  >
    <ReqoreColumns columnsGap="20px" minColumnWidth="450px">
      {children}
    </ReqoreColumns>
  </ReqorePanel>
);

export default FieldGroup;
