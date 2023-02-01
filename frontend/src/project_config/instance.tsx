import { FunctionComponent, useContext, useState } from 'react';

import styled from 'styled-components';

import {
  ReqoreContext,
  ReqoreH4,
  ReqoreMessage,
  ReqoreP,
  ReqorePanel,
  ReqoreSpacer,
} from '@qoretechnologies/reqore';
import { TTranslator } from '../App';
import { NegativeColorEffect } from '../components/Field/multiPair';
import withTextContext from '../hocomponents/withTextContext';
import Add from './add';
import { IQorusInstance } from './ProjectConfig';
import QorusUrl from './url';

export interface IQorusInstanceProps extends IQorusInstance {
  onDataChange: (instanceId: number, name: string, url?: string) => void;
  onDelete: (id: number) => void;
  onUrlSubmit: (
    envId: number,
    instanceId: number,
    name: string,
    url: string,
    isOtherUrl: boolean
  ) => void;
  onUrlDelete: (envId: number, instanceId: number, name: string) => void;
  onSetActive: (url: string, set: boolean) => void;
  envId: number;
  isActive: boolean;
  t: TTranslator;
}

const StyledInstanceWrapper = styled.div`
  width: 100%;
  background-color: #f1f1f1;
  padding: 0 10px;
  border-radius: 3px;
  cursor: pointer;
  min-height: 35px;
  overflow: hidden;
  line-height: 35px;
  margin-bottom: 10px;
  transition: all 0.2s linear;

  &:hover {
    background-color: #e7e7e7;

    .bp3-icon {
      opacity: 0.7;
    }
  }

  &.expanded {
    background-color: #add8e6ad;

    .bp3-icon {
      opacity: 0.7;
    }
  }

  .bp3-icon {
    opacity: 0.4;
  }

  .button-wrapper {
    margin-top: 3px;
  }
`;

const StyledUrlWrapper = styled.div`
  border: 1px solid #eee;
  border-radius: 3px;
  padding: 10px;
  margin-bottom: 10px;
  overflow: hidden;
`;

const QorusInstance: FunctionComponent<IQorusInstanceProps> = ({
  name,
  url,
  id,
  urls,
  onDelete,
  onDataChange,
  isActive,
  onUrlSubmit,
  onUrlDelete,
  envId,
  safe_url,
  onSetActive,
  t,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const { confirmAction } = useContext(ReqoreContext);

  const handleDataChange: (newName: string, url: string) => void = (newName, url) => {
    // Change the data of this instance
    onDataChange(id, newName, url);
    // Turn off editing
    setIsEditing(false);
  };

  const handleAddCancel: () => void = () => {
    // Turn off editing
    setIsEditing(false);
  };

  const handleUrlSubmit: (newName: string, url: string) => void = (newName, url) => {
    // Submit the url
    onUrlSubmit(envId, id, newName, url, true);
  };

  return (
    <>
      {isEditing ? (
        <Add
          name={name}
          url={url}
          withUrl
          defaultAdding
          fill
          id="instance"
          onCancel={handleAddCancel}
          onSubmit={handleDataChange}
        />
      ) : (
        <ReqorePanel
          collapsible
          isCollapsed
          // @ts-expect-error
          name="instance-item"
          label={name}
          flat
          padded={isActive}
          intent={isActive ? 'info' : undefined}
          actions={[
            {
              icon: isActive ? 'StopCircleFill' : 'RestartFill',
              intent: isActive ? 'info' : undefined,
              tooltip: isActive ? 'Logout' : 'Log in to this instance',
              onClick: () => onSetActive(url, !isActive),
            },
            {
              icon: 'EditLine',
              tooltip: 'Edit instance',
              onClick: () => setIsEditing(true),
            },
            {
              icon: 'DeleteBinLine',
              effect: NegativeColorEffect,
              tooltip: 'Delete instance',
              onClick: () =>
                confirmAction({
                  description: t('ConfirmRemoveInstance'),
                  onConfirm: () => onDelete(id),
                  intent: 'danger',
                }),
            },
          ]}
        >
          <>
            <ReqoreSpacer height={10} />
            <ReqoreMessage title={t('MainUrl')}>
              <div>
                <ReqoreP style={{ wordBreak: 'break-all' }}>
                  <a href={url}>{safe_url}</a>
                </ReqoreP>
                <ReqoreSpacer height={10} />
                <ReqoreH4>{t('OtherUrls')}</ReqoreH4>
                {urls.length === 0 && (
                  <>
                    <ReqoreSpacer height={10} />
                    <ReqoreMessage icon="Forbid2Line">{t('NoUrls')}</ReqoreMessage>
                  </>
                )}
                <ReqoreSpacer height={10} />
                {urls.map((url, index: number) => (
                  <QorusUrl
                    id={index}
                    {...url}
                    onDelete={onUrlDelete}
                    envId={envId}
                    instanceId={id}
                    key={index}
                    t={t}
                  />
                ))}
              </div>
            </ReqoreMessage>
            <ReqoreSpacer height={10} />
            <Add withUrl fill text={t('AddNewUrl')} onSubmit={handleUrlSubmit} id="other-url" />
          </>
        </ReqorePanel>
      )}
    </>
  );
};

export default withTextContext()(QorusInstance);
