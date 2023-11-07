import { ReqoreButton, ReqoreControlGroup, ReqoreVerticalSpacer } from '@qoretechnologies/reqore';
import { memo, useMemo, useState } from 'react';
import { useAuthorizeOAuth2App } from '../../hooks/useAuthorizeOAuth2App';
import { ISelectFieldItem } from '../Field/select';
import { ConnectionManagementModal } from './ManagementModal';

export interface IConnectionManagementProps {
  selectedConnection?: string;
  onChange?: (value: string) => void;
  redirectUri?: string;
  allowedValues?: ISelectFieldItem[];
  app?: string;
  action?: string;
}

export const ConnectionManagement = memo(
  ({
    selectedConnection,
    onChange,
    redirectUri,
    allowedValues,
    app,
    action,
  }: IConnectionManagementProps) => {
    const [manageConnection, setManageConnection] = useState(undefined);

    const item = selectedConnection
      ? allowedValues?.find(
          (item) => item.value === selectedConnection || item.name === selectedConnection
        )
      : undefined;

    const { authorizeConnection } = useAuthorizeOAuth2App({
      redirectUri,
    });

    const needsAuth = useMemo(() => item?.metadata?.needs_auth, [item]);

    return (
      <>
        {manageConnection && (
          <ConnectionManagementModal
            appName={app}
            actionName={action}
            selectedConnection={manageConnection?.connection}
            onClose={() => setManageConnection(undefined)}
            onSubmit={(connectionName, authorize) => {
              onChange?.(connectionName);

              if (authorize) {
                authorizeConnection(connectionName, true);
              }

              setManageConnection(undefined);
            }}
          />
        )}
        {item?.metadata?.oauth2_auth_code && (
          <ReqoreControlGroup fluid vertical>
            <ReqoreVerticalSpacer height={5} />
            <ReqoreButton
              icon="ShareBoxLine"
              label={needsAuth ? 'Authorization required' : 'Re-authorize'}
              badge={
                needsAuth
                  ? {
                      icon: 'SpamLine',
                      intent: 'warning',
                    }
                  : undefined
              }
              effect={
                needsAuth
                  ? {
                      gradient: {
                        colors: {
                          0: 'main',
                          100: 'warning:darken',
                        },
                      },
                    }
                  : undefined
              }
              onClick={() =>
                authorizeConnection(selectedConnection, item?.metadata?.oauth2_auth_code)
              }
              description={
                needsAuth
                  ? 'This connection needs to be authorized before it can be used'
                  : 'Click here to re-authorize the connection'
              }
            />
          </ReqoreControlGroup>
        )}
        <ReqoreVerticalSpacer height={10} />
        <ReqoreControlGroup fluid>
          {selectedConnection && (
            <ReqoreButton
              icon="Edit2Line"
              disabled={!app}
              onClick={() => setManageConnection({ connection: selectedConnection })}
            >
              Edit connection
            </ReqoreButton>
          )}
          <ReqoreButton icon="AddLine" onClick={() => setManageConnection({})} disabled={!app}>
            Create new connection
          </ReqoreButton>
        </ReqoreControlGroup>
      </>
    );
  }
);
