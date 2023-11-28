import { useCallback, useContext } from 'react';
import { InitialContext } from '../context/init';
import { fetchData } from '../helpers/functions';
import { postMessage } from '../hocomponents/withMessageHandler';

export interface IUseAuthorizeOAuth2AppProps {
  redirectUri?: string;
  onWindowOpen?: () => void;
}

export const useAuthorizeOAuth2App = ({
  redirectUri,
  onWindowOpen,
}: IUseAuthorizeOAuth2AppProps) => {
  const { qorus_instance } = useContext(InitialContext);
  const handleAuthorizeClick = useCallback(
    async (connectionName, needsAuthentication) => {
      if (!connectionName || !needsAuthentication) {
        return undefined;
      }

      const data = await fetchData(
        `/connections/${connectionName}/oauth2AuthRequestUri?qorus_url=${qorus_instance.url}`,
        'PUT',
        {
          redirect_uri: redirectUri || window.location.href,
        }
      );

      if (data.ok) {
        postMessage?.('open-window', {
          url: data.data,
        });
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
