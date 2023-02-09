import { setupPreviews } from '@previewjs/plugin-react/setup';
import { ReqoreMessage, ReqorePanel, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { noop } from 'lodash';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import { getFieldDescriptionAction } from '../FieldWrapper';

const StyledDescriptionField = styled(ReqoreMessage)`
  p:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

export interface ISubFieldProps {
  title?: string;
  desc?: string;
  children: any;
  subtle?: boolean;
  onRemove?: () => any;
  detail?: string;
  isValid?: boolean;
  collapsible?: boolean;
  nested?: boolean;
}
export const DescriptionField = ({ desc }: { desc?: string }) =>
  desc ? (
    <StyledDescriptionField
      size="small"
      minimal
      icon="InformationLine"
      customTheme={{ main: '#000000' }}
      effect={{
        color: '#aeaeae',
      }}
    >
      <ReactMarkdown>{desc}</ReactMarkdown>
    </StyledDescriptionField>
  ) : null;

const SubField: React.FC<ISubFieldProps> = ({
  title,
  desc,
  children,
  subtle,
  onRemove,
  detail,
  isValid,
  collapsible,
  nested,
}) => {
  return (
    <>
      <ReqorePanel
        flat
        transparent={subtle}
        minimal
        size="small"
        style={{ width: '100%' }}
        contentStyle={{ display: 'flex', flexFlow: 'column' }}
        contentEffect={
          subtle ? undefined : { gradient: { colors: 'main', direction: 'to right bottom' } }
        }
        intent={isValid === false ? 'danger' : undefined}
        label={title}
        badge={detail}
        icon={subtle ? undefined : title || detail ? 'SettingsLine' : undefined}
        collapsible={collapsible}
        unMountContentOnCollapse={false}
        actions={[
          getFieldDescriptionAction(desc),
          {
            icon: 'DeleteBinLine',
            intent: 'danger',
            minimal: true,
            onClick: onRemove,
            size: 'small',
            show: !!onRemove,
          },
        ]}
      >
        {desc ? <ReqoreVerticalSpacer height={10} /> : null}
        {children}
      </ReqorePanel>
      <ReqoreVerticalSpacer height={10} />
    </>
  );
};

setupPreviews(SubField, () => ({
  Basic: { title: 'SubField', children: <p> Hello </p> },
  InValid: { title: 'SubField', children: <p> Hello </p>, isValid: false },
  Subtle: { title: 'SubField', children: <p> Hello </p>, subtle: true },
  WithDetail: { title: 'SubField', children: <p> Hello </p>, detail: 'This is detail' },
  WithRemoveButton: {
    title: 'SubField',
    children: <p> Hello </p>,
    detail: 'This is detail',
    onRemove: noop,
  },
}));

export default SubField;
