import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTree,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import jsyaml from 'js-yaml';
import { useContext, useState } from 'react';
import { useAsyncRetry, useUpdateEffect } from 'react-use';
import { InitialContext } from '../../../context/init';
import { insertUrlPartBeforeQuery } from '../../../helpers/functions';
import { maybeParseYaml, validateField } from '../../../helpers/validations';
import Auto from '../auto';
import LongStringField from '../longString';
import { PositiveColorEffect, SaveColorEffect, SelectorColorEffect } from '../multiPair';
import { IQorusType, getTypeAndCanBeNull } from '../systemOptions';

export interface IProviderMessageDataProps {
  url: string;
  messageId: string;
  onChange: (value: unknown, type: IQorusType) => void;
  value?: unknown;
  type?: IQorusType;
  readOnly?: boolean;
  isFreeform?: boolean;
}

export const ProviderMessageData = ({
  url,
  messageId,
  onChange,
  value,
  type,
  readOnly,
  isFreeform,
}: IProviderMessageDataProps) => {
  const { fetchData, qorus_instance }: any = useContext(InitialContext);
  const [localValue, setLocalValue] = useState<string>(
    value && typeof value === 'object' ? jsyaml.dump(value) : undefined
  );
  const [isValueSubmitted, setIsValueSubmitted] = useState<boolean>(true);

  useUpdateEffect(() => {
    setIsValueSubmitted(false);
  }, [localValue]);

  const {
    value: messageData,
    loading,
    error,
  } = useAsyncRetry(async () => {
    if (qorus_instance && url) {
      const data = await fetchData(
        insertUrlPartBeforeQuery(url, `/messages/${messageId}`, `context=ui`)
      );

      if (data.error) {
        throw new Error(data.error.error.desc);
      }

      return data.data;
    }
    return null;
  }, [url, messageId]);

  if (!url || !messageId) {
    return (
      <ReqoreMessage intent="warning">
        No URL or message ID was provided, message data cannot be fetched
      </ReqoreMessage>
    );
  }

  if (loading) {
    return <ReqoreMessage intent="pending">Loading...</ReqoreMessage>;
  }

  if (error) {
    return <ReqoreMessage intent="danger">{error}</ReqoreMessage>;
  }

  if (messageData.arg_schema) {
    return (
      <ReqoreTabs
        activeTab={isFreeform ? 'text' : 'form'}
        tabsPadding="vertical"
        padded={false}
        tabs={[
          { label: 'Text', icon: 'Text', id: 'text' },
          { label: 'Form', icon: 'AlignCenter', id: 'form' },
        ]}
      >
        <ReqoreTabsContent tabId="text" style={{ flexFlow: 'column' }}>
          <ReqoreTree
            label="Type information"
            size="small"
            flat={false}
            intent="info"
            zoomable
            exportable
            collapsible
            isCollapsed
            data={messageData.arg_schema}
          />
          <ReqoreVerticalSpacer height={10} />
          <ReqoreControlGroup fluid fill stack>
            <LongStringField
              value={localValue}
              onChange={(_name, value) => setLocalValue(value)}
              name={`message`}
              intent={
                validateField(messageData.type, localValue, { arg_schema: messageData.arg_schema })
                  ? undefined
                  : 'danger'
              }
            />
            <ReqoreButton
              icon="CheckLine"
              fixed
              flat={false}
              id={`save-${type}-args`}
              effect={
                !validateField(messageData.type, localValue, {
                  arg_schema: messageData.arg_schema,
                })
                  ? SelectorColorEffect
                  : isValueSubmitted
                  ? SaveColorEffect
                  : PositiveColorEffect
              }
              onClick={() => {
                onChange(maybeParseYaml(localValue), messageData.type);
                setIsValueSubmitted(true);
              }}
              disabled={
                isValueSubmitted ||
                !validateField(messageData.type, localValue, {
                  arg_schema: messageData.arg_schema,
                })
              }
            />
          </ReqoreControlGroup>
        </ReqoreTabsContent>
        <ReqoreTabsContent tabId="form">
          <Auto
            {...getTypeAndCanBeNull(type || messageData.type)}
            arg_schema={messageData.arg_schema}
            defaultType={messageData.type}
            onChange={(_name, value, type) => {
              onChange(value, type);
              setLocalValue(value ? jsyaml.dump(value) : undefined);
            }}
            value={value}
            noSoft
            disabled={readOnly}
          />
        </ReqoreTabsContent>
      </ReqoreTabs>
    );
  }

  return (
    <Auto
      {...getTypeAndCanBeNull(type || messageData.type)}
      arg_schema={messageData.arg_schema}
      defaultType={messageData.type}
      onChange={(_name, value, type) => {
        onChange(value, type);
      }}
      value={value}
      noSoft
      disabled={readOnly}
    />
  );
};
