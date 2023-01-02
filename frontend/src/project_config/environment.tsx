import { FunctionComponent } from 'react';

import size from 'lodash/size';
import styled from 'styled-components';

import {
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreSpacer,
} from '@qoretechnologies/reqore';
import { TTranslator } from '../App';
import withTextContext from '../hocomponents/withTextContext';
import Add from './add';
import QorusInstance from './instance';
import { IQorusInstance } from './ProjectConfig';

export interface IEnvironmentPanel {
  id: number;
  name: string;
  qoruses: IQorusInstance[];
  path: string;
  active: boolean;
  onEnvironmentNameChange: (id: number, newName: string) => void;
  onEnvironmentDeleteClick: (id: number) => void;
  onSetActiveInstanceClick: (url: string, set: boolean) => void;
  onInstanceSubmit: (id: number, name: string, url: string) => void;
  onInstanceDelete: (id: number, instanceId: number) => void;
  onInstanceChange: (id: number, instanceId: number, name: string, url: string) => void;
  onUrlSubmit: (id: number, instanceId: number, name: string, url: string) => void;
  onUrlDelete: (id: number, instanceId: number, name: string) => void;
  activeInstance?: string;
  t: TTranslator;
}

const StyledEnvWrapper = styled.div`
  background-color: #fff;
  border-radius: 5px;
  break-inside: avoid;
  margin-bottom: 10px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
`;

const StyledEnvHeader = styled.div`
  height: 70px;
  display: flex;
  flex-flow: row wrap;
  padding: 10px;
  border-bottom: 1px solid #eee;

  .bp3-icon {
    opacity: 0.7;
  }
`;

const StyledQorusLogo = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 99px;
  background-color: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid;
  border-color: ${({ active }) => (active ? '#7fba27' : '#ddd')};
`;

const StyledNameWrapper = styled.div`
  display: inline-flex;
  line-height: 50px;
  padding: 0 10px;
  flex: 1;
  justify-content: space-between;
`;

const StyledName = styled.h3`
  margin: 0;
  padding: 0;
`;

const StyledInstanceList = styled.div`
  padding: 10px;
  width: 100%;
  border-radius: 3px;
`;

export const StyledSubHeader = styled.h4`
  margin: 0;
  padding: 0;
  margin-bottom: 10px;
  padding: 0px 0 8px 0px;
  border-bottom: 1px solid #eee;
  color: #444;
  height: 30px;

  span {
    vertical-align: middle;
  }
`;

export const StyledNoData = styled.p`
  color: #666;

  .bp3-icon {
    opacity: 0.5;
    margin-right: 10px;
  }
`;

const EnvironmentPanel: FunctionComponent<IEnvironmentPanel> = ({
  id,
  name,
  qoruses,
  path,
  image_path,
  active,
  onEnvironmentNameChange,
  onEnvironmentDeleteClick,
  onInstanceSubmit,
  onInstanceDelete,
  onInstanceChange,
  onUrlSubmit,
  onUrlDelete,
  onSetActiveInstanceClick,
  activeInstance,
  t,
}) => {
  const handleInstanceSubmit: (name: string, url: string) => void = (name, url) => {
    // Submit the new instance
    onInstanceSubmit(id, name, url);
  };

  const handleInstanceDelete: (instanceId: number) => void = (instanceId) => {
    // Submit the new instance
    onInstanceDelete(id, instanceId);
  };

  const handleInstanceDataChange: (instanceId: number, name: string, url: string) => void = (
    instanceId,
    name,
    url
  ) => {
    // Submit new instance data
    onInstanceChange(id, instanceId, name, url);
  };

  return (
    <ReqorePanel minimal padded={false} opacity={0}>
      {size(qoruses) ? (
        qoruses.map((qorusInstance: IQorusInstance) => (
          <>
            <ReqoreSpacer height={10} />
            <QorusInstance
              {...qorusInstance}
              envId={id}
              onDelete={handleInstanceDelete}
              onDataChange={handleInstanceDataChange}
              onUrlSubmit={onUrlSubmit}
              onUrlDelete={onUrlDelete}
              onSetActive={onSetActiveInstanceClick}
              isActive={qorusInstance.name === activeInstance}
            />
          </>
        ))
      ) : (
        <>
          <ReqoreSpacer height={10} />
          <ReqoreMessage icon="Forbid2Line" flat>
            {t('NoInstances')}
          </ReqoreMessage>
        </>
      )}
      <ReqoreSpacer height={15} />
      <ReqoreControlGroup fluid>
        <Add withUrl onSubmit={handleInstanceSubmit} id="instance" text={t('AddInstance')} />
      </ReqoreControlGroup>
    </ReqorePanel>
  );
};

export default withTextContext()(EnvironmentPanel);
