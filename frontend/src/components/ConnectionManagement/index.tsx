import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreSpinner,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { memo, useCallback, useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
import { fetchData } from '../../helpers/functions';
import { ISelectFieldItem } from '../Field/select';

export interface IConnectionManagementProps {
  selectedConnection?: string;
  onChange?: (value: string) => void;
  redirectUri?: string;
  allowedValues?: ISelectFieldItem[];
}

export const ConnectionManagement = memo(
  ({ selectedConnection, onChange, redirectUri, allowedValues }: IConnectionManagementProps) => {
    const item = selectedConnection
      ? allowedValues?.find(
          (item) => item.value === selectedConnection || item.name === selectedConnection
        )
      : undefined;

    const { loading, value } = useAsyncRetry(async () => {
      if (!selectedConnection || !item?.metadata?.oauth2_auth_code) {
        return undefined;
      }

      const data = await fetchData(
        `/connections/${selectedConnection}/oauth2AuthRequestUri`,
        'PUT',
        {
          redirect_uri: redirectUri || window.location.href,
        }
      );

      if (data.ok) {
        return data.data;
      }

      return undefined;
    }, [selectedConnection, item?.metadata?.oauth2_auth_code]);

    const handleAuthorizeClick = useCallback(() => {
      if (value) {
        window.open(value, '_blank', 'noopener noreferrer width=700,height=1000');
      }
    }, [value]);

    const needsAuth = useMemo(() => item?.metadata?.needs_auth, [item]);

    if (loading) {
      return <ReqoreSpinner type={4}> Loading... </ReqoreSpinner>;
    }

    return (
      <>
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
              onClick={handleAuthorizeClick}
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
          <ReqoreButton icon="AddLine"> Create new connection </ReqoreButton>
          {selectedConnection && <ReqoreButton icon="Edit2Line"> Edit connection </ReqoreButton>}
        </ReqoreControlGroup>
      </>
    );
  }
);
