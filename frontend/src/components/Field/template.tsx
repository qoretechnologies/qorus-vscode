import {
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { useContext, useState } from 'react';
import { useAsyncRetry, useUpdateEffect } from 'react-use';
import { templatesList } from '../../containers/ConfigItemManager/modal';
import { TextContext } from '../../context/text';
import { fetchData } from '../../helpers/functions';
import Loader from '../Loader';
import Select from './select';
import String from './string';

/**
 * It checks if a string starts with a dollar sign, contains a colon, and if the text between the
 * dollar sign and the colon matches a template from the list
 * @param {string} value - The string to check if it's a template
 * @returns A function that takes a string and returns a boolean.
 */
export const isValueTemplate = (value?: any) => {
  if (typeof value !== 'string' || !value?.startsWith('$') || !value?.includes(':')) {
    return false;
  }
  // Get everything between first $ and first colon
  const template = value.substring(value.indexOf('$') + 1, value.indexOf(':'));
  // Check if the template matches a template from the list
  return templatesList.includes(template);
};

/**
 * It returns the key of a template string, or null if the string is not a template
 * @param {string} [value] - The value to check.
 * @returns The key of the template.
 */
export const getTemplateKey = (value?: string) => {
  if (value && isValueTemplate(value)) {
    return value.substring(value.indexOf('$') + 1, value.indexOf(':'));
  }

  return null;
};

/**
 * It returns the value of a template string, or null if the value is not a template string
 * @param {string} [value] - The value to check.
 * @returns The value of the template.
 */
export const getTemplateValue = (value?: string) => {
  if (value && isValueTemplate(value)) {
    return value.substring(value.indexOf(':') + 1);
  }
  return null;
};

export interface ITemplateFieldProps {
  value?: any;
  name?: string;
  onChange?: (name: string, value: any) => void;
  // React element
  component: React.FC<any>;
  [key: string]: any;
  templateContext?: 1 | 2 | 4 | 7 | 8 | 15;
}

export const TemplateField = ({
  value,
  name,
  onChange,
  component: Comp,
  templateContext = 15,
  ...rest
}: ITemplateFieldProps) => {
  const [isTemplate, setIsTemplate] = useState<boolean>(isValueTemplate(value));
  const [templateKey, setTemplateKey] = useState<string | null>(getTemplateKey(value));
  const [templateValue, setTemplateValue] = useState<string | null>(getTemplateValue(value));

  const templates = useAsyncRetry(async () => {
    const serverTemplates = await fetchData(`/system/templates?filter=${templateContext}`);

    if (serverTemplates.ok) {
      return serverTemplates.data;
    }

    throw new Error(serverTemplates.error);
  }, []);

  // When template key or template value change run the onChange function
  useUpdateEffect(() => {
    if (templateKey && templateValue) {
      onChange?.(name, `$${templateKey}:${templateValue}`);
    }
  }, [templateKey, templateValue]);

  const t = useContext(TextContext);

  if (rest.disabled) {
    if (isTemplate) {
      return (
        <ReqoreTagGroup>
          <ReqoreTag labelKey={`$${templateKey}:`} label={templateValue} />
        </ReqoreTagGroup>
      );
    }

    return <Comp value={value} onChange={onChange} name={name} {...rest} />;
  }

  return (
    <ReqoreTabs
      activeTab={isTemplate ? 'template' : 'custom'}
      activeTabIntent="info"
      fill
      size="small"
      flat
      padded={false}
      tabsPadding="vertical"
      tabs={[
        {
          id: 'custom',
          label: t('Custom'),
          icon: 'EditLine',
          minimal: true,
          flat: false,
        },
        {
          id: 'template',
          label: t('Template'),
          icon: 'ExchangeDollarLine',
          minimal: true,
          flat: false,
        },
      ]}
      onTabChange={(newTabId: string): void => {
        if (newTabId === 'custom') {
          setIsTemplate(false);
          setTemplateKey(null);
          setTemplateValue(null);
          onChange(name, null);
        } else {
          setIsTemplate(true);
          onChange(name, null);
        }
      }}
    >
      <ReqoreTabsContent tabId={'custom'}>
        <Comp value={value} onChange={onChange} name={name} {...rest} />
      </ReqoreTabsContent>
      <ReqoreTabsContent tabId={'template'}>
        {templates.loading && <Loader />}
        {templates.value ? (
          <>
            <ReqoreMessage intent="info" size="small">
              {`${t('ConfigTemplatesFormat')} $<type>:<key>`}
            </ReqoreMessage>
            <ReqoreVerticalSpacer height={10} />
            <ReqoreControlGroup fluid stack fill>
              <Select
                defaultItems={templates.value.map((template) => template)}
                onChange={(_n, val) => setTemplateKey(val)}
                value={templateKey}
                name="templateKey"
                icon="ExchangeDollarLine"
                className="template-selector"
              />
              <ReqoreTag label=":" />
              <String
                fill
                fillVertically
                type="string"
                name="templateVal"
                value={templateValue}
                onChange={(_n, val) => setTemplateValue(val)}
              />
            </ReqoreControlGroup>
          </>
        ) : null}
      </ReqoreTabsContent>
    </ReqoreTabs>
  );
};
