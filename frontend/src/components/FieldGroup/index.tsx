import { ReqoreColumns } from '@qoretechnologies/reqore';
import { IReqorePanelProps, ReqorePanel } from '@qoretechnologies/reqore/dist/components/Panel';
import React from 'react';

const FieldGroup = ({ children, isValid, ...rest }: IReqorePanelProps & { isValid?: boolean }) => (
  <ReqorePanel
    collapsible={!!rest.label}
    minimal
    icon={!!rest.label ? 'Group2Line' : undefined}
    size="small"
    {...rest}
    intent={isValid === false ? 'danger' : rest.intent}
  >
    <ReqoreColumns columnsGap="10px" minColumnWidth="250px">
      {React.Children.map(children, (child) =>
        React.isValidElement(child) ? React.cloneElement(child as any, { inGroup: true }) : child
      )}
    </ReqoreColumns>
  </ReqorePanel>
);

export default FieldGroup;
