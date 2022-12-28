import { ReqoreButton, ReqoreControlGroup, ReqoreInput } from '@qoretechnologies/reqore';
import React, { FunctionComponent, useState } from 'react';
import urlParse from 'url-parse';
import { TTranslator } from '../App';
import withTextContext from '../hocomponents/withTextContext';

const getUrlWithoutCredentials = (url) => {
  const { protocol, slashes, host, query, pathname, hash } = urlParse(url);

  url = `${protocol}${slashes ? '//' : ''}`;
  url += `${host}${pathname}${query}${hash}`;

  return url;
};

export interface IAddProjectData {
  withUrl?: boolean;
  t?: TTranslator;
  onSubmit: (name: string, url?: string) => void;
  fill?: boolean;
  text?: string;
  defaultAdding?: boolean;
  name?: string;
  url?: string;
  onCancel?: () => void;
  minimal?: boolean;
  big?: boolean;
  id?: string;
}

export default withTextContext()(
  ({
    withUrl,
    big,
    t,
    onCancel,
    name,
    url,
    onSubmit,
    fill,
    text,
    defaultAdding = false,
    minimal = true,
    id,
  }) => {
    const [isAdding, setIsAdding] = useState<boolean>(defaultAdding);
    const [newName, setName] = useState<string>(name);
    const [newUrl, setUrl] = useState<string>(getUrlWithoutCredentials(url));
    const [newUser, setUser] = useState<string>(urlParse(url)?.username || '');
    const [newPassword, setPassword] = useState<string>(
      decodeURIComponent(urlParse(url)?.password || '')
    );

    const handleAddClick = () => {
      setIsAdding(true);
      // Set the name to blank
      setName(name);
      // Set the url to blank
      setUrl(url);
    };

    const handleCancelClick = () => {
      // If custom on cancel function exists
      if (onCancel) {
        onCancel();
      } else {
        // Turn adding off
        setIsAdding(false);
      }
    };

    const handleNameChange: (event: React.FormEvent<HTMLElement>) => void = (event) => {
      setName(event.target.value);
    };

    const handleUrlChange: (event: React.FormEvent<HTMLElement>) => void = (event) => {
      setUrl(event.target.value);
    };

    const handleUSerChange: (event: React.FormEvent<HTMLElement>) => void = (event) => {
      setUser(event.target.value);
    };

    const handlePasswordChange: (event: React.FormEvent<HTMLElement>) => void = (event) => {
      setPassword(event.target.value);
    };

    const handleCreateClick = () => {
      let submit = true;
      // Should we submit url as well
      if (withUrl) {
        // Check if url is not empty
        if (!newUrl || newUrl === '') {
          // Do not submit
          submit = false;
        }
      }
      // Check if the name is not empty
      if (!newName || newName === '') {
        // Do not submit
        submit = false;
      }
      // if username or password is set, the other one has to also be set
      if (newUser && newUser !== '' && (!newPassword || newPassword === '')) {
        submit = false;
      }

      if (newPassword && newPassword !== '' && (!newUser || newUser === '')) {
        submit = false;
      }

      // Submit the new data if all conditions
      // are met
      if (submit) {
        // Build the URL
        const { protocol, slashes, host, query, pathname, hash } = urlParse(newUrl);
        const credentials =
          newUser && newPassword && newUser !== '' && newPassword !== ''
            ? `${newUser}:${encodeURIComponent(newPassword)}@`
            : '';
        let url = `${protocol}${slashes ? '//' : ''}${credentials}`;
        url += `${host}${pathname}${query}${hash}`;

        // Pass the data
        onSubmit(newName, url);
        // Remove editing
        setIsAdding(false);
      }
    };

    const handleEnterPress = (event: React.KeyboardEvent<HTMLInputElement>): void => {
      if (event.key === 'Enter') {
        handleCreateClick();
      }
    };

    return (
      <>
        {isAdding ? (
          <ReqoreControlGroup stack fluid vertical={withUrl}>
            <ReqoreInput
              value={newName}
              placeholder={t('Name')}
              onChange={handleNameChange}
              onKeyUp={handleEnterPress}
              width={!minimal ? 250 : undefined}
            />
            {withUrl && (
              <>
                <ReqoreInput
                  value={newUrl}
                  placeholder={t('Url')}
                  onChange={handleUrlChange}
                  onKeyUp={handleEnterPress}
                  // @ts-expect-error
                  name={`${id}-url`}
                />
                <ReqoreInput
                  value={newUser}
                  placeholder={t('Username')}
                  onChange={handleUSerChange}
                  onKeyUp={handleEnterPress}
                  // @ts-expect-error
                  name={`${id}-username`}
                />
                <ReqoreInput
                  value={newPassword}
                  placeholder={t('Password')}
                  onChange={handlePasswordChange}
                  onKeyUp={handleEnterPress}
                  // @ts-expect-error
                  name={`${id}-password`}
                />
              </>
            )}
            <ReqoreControlGroup fluid stack>
              <ReqoreButton icon="CloseLine" onClick={handleCancelClick}>
                {t('Cancel')}
              </ReqoreButton>
              <ReqoreButton
                icon="CheckLine"
                intent="success"
                onClick={handleCreateClick}
                // @ts-expect-error
                name={`${id}-submit`}
              >
                {t('Save')}
              </ReqoreButton>
            </ReqoreControlGroup>
          </ReqoreControlGroup>
        ) : (
          <ReqoreControlGroup fluid>
            <ReqoreButton
              icon="AddLine"
              onClick={handleAddClick}
              intent="success"
              // @ts-expect-error
              name={`${id}-add`}
            >
              {text}
            </ReqoreButton>
          </ReqoreControlGroup>
        )}
      </>
    );
  }
) as FunctionComponent<IAddProjectData>;
