// @flow
import {
  ReqoreControlGroup,
  ReqoreDropdown,
  ReqoreInput,
  ReqoreMessage,
  ReqorePanel,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreTag,
  ReqoreTagGroup,
  ReqoreTree,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import jsyaml from 'js-yaml';
import map from 'lodash/map';
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import CustomDialog from '../../components/CustomDialog';
import AutoField from '../../components/Field/auto';
import { NegativeColorEffect, SaveColorEffect } from '../../components/Field/multiPair';
import { validateField } from '../../helpers/validations';
import withTextContext from '../../hocomponents/withTextContext';

export const templatesList = [
  'local',
  'timestamp',
  'rest',
  'qore-expr',
  'static',
  'dynamic',
  'sensitive',
  'sensitive-alias',
  'temp',
  'step',
  'keys',
  'transient',
  'config',
  'info',
  'parse-value',
  'pstate',
  'state',
  'qore-expr-value',
];

@withTextContext()
export default class ConfigItemsModal extends Component {
  getTemplateType = (value) => {
    const [type] = value.replace(/'/g, '').split(':');

    return type.replace('$', '');
  };

  getTemplateKey = (value) => {
    const [_type, ...rest] = value.replace(/'/g, '').split(':');

    return rest.join(':');
  };

  state: {
    value: any;
    item: Object;
    error: boolean;
    yamlData?: string;
    type: string;
    currentType?: string;
    selectedConfigItem?: string;
    useTemplate?: boolean;
    templateType?: string;
    templateKey?: string;
    tab: string;
  } = {
    value: this.props.item && this.props.item.value,
    origValue: this.props.item && this.props.item.value,
    item: this.props.item,
    error: false,
    yamlData: this.props.item && this.props.item.yamlData,
    type: this.props.item
      ? this.props.item.type === 'any'
        ? this.props.item.currentType || null
        : this.props.item.type
      : null,
    currentType: this.props.item
      ? this.props.item.type === 'any'
        ? this.props.item.currentType || null
        : this.props.item.type
      : null,
    useTemplate: this.props.item ? this.props.item.is_templated_string : false,
    templateType:
      this.props.item?.is_templated_string && this.getTemplateType(this.props.item.value),
    templateKey: this.props.item?.is_templated_string && this.getTemplateKey(this.props.item.value),
    tab: this.props.item?.is_templated_string ? 'template' : 'custom',
    isTemplatedString: this.props.item?.is_templated_string,
  };

  handleObjectChange: Function = (value, type, canBeNull): void => {
    this.setState({
      value,
      error: !validateField(type, value, null, canBeNull),
      currentType: type,
    });
  };

  handleDefaultClick = () => {
    this.setState({
      value: this.state.item.default_value,
    });
  };

  handleSaveClick = (): void => {
    const value: any = this.state.value;

    let newValue = value;

    if (this.state.type === 'string' && value === '') {
      newValue = jsyaml.safeDump(value);
    }

    if (this.state.tab === 'template') {
      newValue = `$${this.state.templateType}:${this.state.templateKey}`;
    }

    this.props.onSubmit(
      this.state.item.name,
      newValue,
      this.state.item.parent_class,
      this.state.isTemplatedString,
      false,
      this.state.currentType
    );
  };

  handleRemoveClick = (): void => {
    this.props.onSubmit(this.state.item.name, null, this.state.item.parent_class, false, true);
  };

  renderAllowedItems: Function = (item) => {
    if (this.state.type === 'hash' || this.state.type === '*hash') {
      return (
        <React.Fragment>
          {item.allowed_values.map((value) => (
            <ReqoreTree data={value} showControls expanded />
          ))}
        </React.Fragment>
      );
    }

    return (
      <ReqoreDropdown
        label={this.props.t('ConfigSelectFromPredefined')}
        items={item.allowed_values
          .filter((item) => item)
          .map((value) => ({
            value,
            onClick: () => this.handleObjectChange(value, item.type, item.can_be_undefined),
          }))}
      />
    );
  };

  isDisabled = () => {
    const { tab, templateType, templateKey, value, error } = this.state;

    if (tab === 'template') {
      return templateKey && templateKey !== '' && templateType && templateType !== '';
    } else {
      return !error;
    }
  };

  // log the item
  render() {
    const { onClose, isGlobal, globalConfig, t } = this.props;
    const { error, yamlData, value, item } = this.state;

    return (
      <CustomDialog
        isOpen
        label={!item ? t('AssignNewConfig') : `${t('Editing')} ${item.name}`}
        onClose={onClose}
        bottomActions={[
          {
            icon: 'CloseLine',
            label: t('Close'),
            onClick: onClose,
          },
          {
            icon: 'DeleteBinLine',
            label: t('RemoveValue'),
            effect: NegativeColorEffect,
            onClick: this.handleRemoveClick,
          },
          {
            label: t('Submit'),
            onClick: this.handleSaveClick,
            icon: 'CheckDoubleLine',
            position: 'right',
            effect: SaveColorEffect,
            disabled: !this.isDisabled(),
          },
        ]}
      >
        {item && (
          <ReqoreMessage
            title={t('Config item info')}
            size="small"
            minimal
            icon="InformationFill"
            flat
          >
            {item.description && (
              <>
                <ReactMarkdown>{item.description}</ReactMarkdown>
                <ReqoreVerticalSpacer height={10} />
              </>
            )}

            <ReqoreTagGroup size="small">
              <ReqoreTag
                icon="CodeLine"
                labelKey={t('Type')}
                label={`${item.can_be_undefined ? '*' : ''}${item.type}`}
              />
              {item.parent_class ? <ReqoreTag labelKey="Parent" label={item.parent_class} /> : null}
              <ReqoreTag size="small" icon="NodeTree" labelKey="level" label={item.level} />
              <ReqoreTag labelKey="Local" label={item.strictly_local ? 'Yes' : 'No'} size="small" />
            </ReqoreTagGroup>
          </ReqoreMessage>
        )}

        {isGlobal && (
          <>
            <ReqoreMessage intent="warning">
              {!item ? t('Creating') : t('Editing')} {t('GlobalConfigAffectsAll')}
            </ReqoreMessage>
            <ReqoreVerticalSpacer height={10} />
            {!item && (
              <>
                <ReqoreDropdown
                  label={t('PleaseSelect')}
                  items={map(globalConfig, (data) => ({
                    value: data.name,
                    onClick: ({ value }) => {
                      // GET THE DATA OF THE CONFIG ITEM HERE
                      this.setState({
                        value: null,
                        item: { ...data, name: value },
                        type: data.type === 'any' ? null : data.type,
                        yamlData: data.yamlData,
                      });
                    },
                  }))}
                />
                <ReqoreVerticalSpacer height={10} />
              </>
            )}
          </>
        )}

        {!yamlData && <ReqoreMessage>{t('PleaseSelectConfigItem')}</ReqoreMessage>}
        <ReqoreVerticalSpacer height={10} />
        {yamlData ? (
          <ReqoreTabs
            padded={false}
            tabsPadding="vertical"
            activeTab="custom"
            activeTabIntent="info"
            onTabChange={(newTabId: string): void => {
              this.setState({
                value: null,
                tab: newTabId,
                isTemplatedString: newTabId === 'template',
              });
            }}
            tabs={[
              {
                id: 'custom',
                label: t('Custom'),
              },
              {
                id: 'template',
                label: t('Template'),
              },
            ]}
          >
            <ReqoreTabsContent tabId={'custom'}>
              <ReqorePanel
                label={isGlobal ? t('SetItemValue') : t('SetCustomValue')}
                actions={[
                  {
                    show: !isGlobal,
                    label: t('SetDefaultValue'),
                    disabled: !item.default_value,
                    onClick: this.handleDefaultClick,
                  },
                ]}
              >
                {item.allowed_values && (
                  <>
                    <ReqoreMessage intent="info">
                      {t('ConfigPredefinedValues')}
                      <ReqoreVerticalSpacer height={10} />
                      {this.renderAllowedItems(item)}
                    </ReqoreMessage>
                    <ReqoreVerticalSpacer height={10} />
                  </>
                )}
                {error && (
                  <>
                    <ReqoreMessage intent="danger">{t('ConfigFormatIncorrect')}</ReqoreMessage>
                    <ReqoreVerticalSpacer height={10} />
                  </>
                )}
                <AutoField
                  name="configItem"
                  value={this.state.value}
                  default_value={this.state.origValue}
                  t={t}
                  type="auto"
                  noSoft
                  defaultType={item.type}
                  defaultInternalType={item.value_true_type || item.type}
                  disabled={!!item.allowed_values}
                  requestFieldData={(field) =>
                    field === 'can_be_undefined' ? item.can_be_undefined : item.type
                  }
                  onChange={(name, value, type, canBeNull) => {
                    this.handleObjectChange(value, type, canBeNull);
                  }}
                />
              </ReqorePanel>
            </ReqoreTabsContent>
            <ReqoreTabsContent tabId={'template'}>
              <ReqorePanel label={t('ConfigCustomTemplate')}>
                <ReqoreMessage intent="info" size="small">
                  {`${t('ConfigTemplatesFormat')} $<type>:<key>`}
                </ReqoreMessage>
                <ReqoreVerticalSpacer height={10} />
                <ReqoreControlGroup fluid>
                  <ReqoreDropdown
                    fixed
                    filterable
                    label={this.state.templateType}
                    items={templatesList.map((template) => ({
                      value: template,
                      onClick: () => {
                        this.setState({ templateType: template });
                      },
                    }))}
                  />

                  <ReqoreTag label=":" fixed />
                  <ReqoreInput
                    value={this.state.templateKey}
                    onChange={(event: any) => {
                      this.setState({
                        templateKey: event.target.value,
                        value: `$${this.state.templateType}:${event.target.value}`,
                      });
                    }}
                  />
                </ReqoreControlGroup>
              </ReqorePanel>
            </ReqoreTabsContent>
          </ReqoreTabs>
        ) : null}
      </CustomDialog>
    );
  }
}
