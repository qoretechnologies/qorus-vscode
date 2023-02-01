import { FunctionComponent, useContext } from 'react';

import styled from 'styled-components';

import { ReqoreButton, ReqoreContext, ReqoreControlGroup } from '@qoretechnologies/reqore';
import { InitialContext } from '../context/init';

export interface IQorusUrlProps {
  name: string;
  url: string;
  safe_url: string;
  onDelete: (envId: number, instanceId: number, name: string) => void;
  instanceId: number;
  envId: number;
  id: number;
  t: any;
}

const StyledUrl = styled.div`
  width: 100%;
  border-radius: 3px;
  min-height: 35px;
  overflow: hidden;
  word-break: break-all;
  line-height: 35px;
  margin-bottom: 5px;
  transition: all 0.2s linear;

  .bp3-icon {
    opacity: 0.7;
  }

  .button-wrapper {
    margin-top: 3px;
  }
`;

const QorusUrl: FunctionComponent<IQorusUrlProps> = ({
  name,
  url,
  safe_url,
  instanceId,
  onDelete,
  envId,
  id,
  t,
}) => {
  const initContext = useContext(InitialContext);
  const { confirmAction } = useContext(ReqoreContext);

  return (
    <ReqoreControlGroup fluid stack fill>
      <ReqoreButton description={`[${safe_url}]`}>{name}</ReqoreButton>
      <ReqoreButton
        fixed
        icon="DeleteBinLine"
        intent="danger"
        tooltip="Edit instance"
        onClick={() =>
          confirmAction({
            description: t('ConfirmRemoveUrl'),
            onConfirm: () => onDelete(envId, instanceId, name),
          })
        }
      />
    </ReqoreControlGroup>
  );
};

export default QorusUrl;
