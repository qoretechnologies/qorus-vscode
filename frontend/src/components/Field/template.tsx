import {
  ReqoreControlGroup,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTag,
  ReqoreTagGroup,
} from '@qoretechnologies/reqore';
import { IReqoreTextareaProps } from '@qoretechnologies/reqore/dist/components/Textarea';
import { useContext, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import { TextContext } from '../../context/text';
import { filterTemplatesByType } from '../../helpers/functions';
import Auto from './auto';
import LongStringField from './longString';

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

  return true;
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
  interfaceContext?: string;
  allowTemplates?: boolean;
  templates?: IReqoreTextareaProps['templates'];
  [key: string]: any;
}

export const TemplateField = ({
  value,
  name,
  onChange,
  component: Comp = Auto,
  templates,
  interfaceContext,
  allowTemplates = true,
  ...rest
}: ITemplateFieldProps) => {
  const [isTemplate, setIsTemplate] = useState<boolean>(isValueTemplate(value));
  const [templateValue, setTemplateValue] = useState<string | null>(value);
  const t = useContext(TextContext);

  // When template key or template value change run the onChange function
  useUpdateEffect(() => {
    if (templateValue) {
      onChange?.(name, templateValue);
    }
  }, [templateValue]);

  const disableTemplateTab =
    !allowTemplates ||
    (rest.type !== 'number' &&
      rest.type !== 'boolean' &&
      rest.type !== 'date' &&
      rest.type !== 'bool' &&
      rest.type !== 'int');

  if (disableTemplateTab) {
    return (
      <Comp
        value={value}
        onChange={onChange}
        name={name}
        {...rest}
        className={`${rest.className} template-selector`}
        templates={allowTemplates ? filterTemplatesByType(templates, rest.type) : undefined}
      />
    );
  }

  if (rest.disabled) {
    if (isTemplate) {
      return (
        <ReqoreTagGroup>
          <ReqoreTag label={templateValue} />
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
      tabsPadding="top"
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
          fixed: true,
        },
      ]}
      onTabChange={(newTabId: string): void => {
        if (newTabId === 'custom') {
          setIsTemplate(false);
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
        <ReqoreControlGroup fluid stack fill>
          <LongStringField
            className="template-selector"
            type="string"
            name="templateVal"
            value={templateValue}
            templates={allowTemplates ? filterTemplatesByType(templates, rest.type) : undefined}
            onChange={(_n, val) => setTemplateValue(val)}
          />
        </ReqoreControlGroup>
      </ReqoreTabsContent>
    </ReqoreTabs>
  );
};
