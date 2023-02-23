import { ReqoreColumns } from '@qoretechnologies/reqore';
import { IReqorePanelProps, ReqorePanel } from '@qoretechnologies/reqore/dist/components/Panel';

const FieldGroup = ({ children, isValid, ...rest }: IReqorePanelProps & { isValid?: boolean }) => (
  <ReqorePanel
    collapsible={!!rest.label}
    minimal
    icon={!!rest.label ? 'Group2Line' : undefined}
    size="small"
    {...rest}
    intent={isValid === false ? 'danger' : rest.intent}
  >
    <ReqoreColumns columnsGap="10px" minColumnWidth="450px">
      {children}
    </ReqoreColumns>
  </ReqorePanel>
);

export default FieldGroup;
