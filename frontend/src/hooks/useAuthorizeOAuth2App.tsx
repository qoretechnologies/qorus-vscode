import { useCallback } from 'react';
import { fetchData } from '../helpers/functions';

export interface IUseAuthorizeOAuth2AppProps {
  redirectUri?: string;
  onWindowOpen?: () => void;
}

export const useAuthorizeOAuth2App = ({
  redirectUri,
  onWindowOpen,
}: IUseAuthorizeOAuth2AppProps) => {
  const handleAuthorizeClick = useCallback(
    async (connectionName, needsAuthentication) => {
      if (!connectionName || !needsAuthentication) {
        return undefined;
      }

      const data = await fetchData(`/connections/${connectionName}/oauth2AuthRequestUri`, 'PUT', {
        redirect_uri: redirectUri || window.location.href,
      });

      if (data.ok) {
        window.open(data.data, '_blank', 'noopener noreferrer width=700,height=1000');
        onWindowOpen?.();
        return data.data;
      }

      return undefined;
    },
    [redirectUri]
  );

  return {
    authorizeConnection: handleAuthorizeClick,
  };
};
