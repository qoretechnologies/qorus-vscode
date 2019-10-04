// @flow
import React, { Component } from 'react';

import ContentByType from '../../components/ContentByType';
import {
  Icon,
  TextArea,
  Popover,
  Button,
  ButtonGroup,
  Intent,
  Position,
  Tooltip,
  ControlGroup,
  InputGroup,
  Dialog,
  Callout,
  Classes,
  Tabs, Tab,
} from '@blueprintjs/core';
import DatePicker from '../../components/Datepicker';
import Dropdown, { Item, Control as DControl } from '../../components/Dropdown';
import Tree from '../../components/Tree';
import jsyaml from 'js-yaml';
import moment from 'moment';
import { DATE_FORMATS } from '../../constants/dates';
import Pull from '../../components/Pull';
import map from 'lodash/map';
import pickBy from 'lodash/pickBy';
import isNull from 'lodash/isNull';
import { getLineCount } from '../../components/Tree';
import Box from '../../components/ResponsiveBox';
import withTextContext from '../../hocomponents/withTextContext';

@withTextContext()
export default class ConfigItemsModal extends Component {
  getTemplateType = value => {
    if (value && value.toString().startsWith('$')) {
      const [type] = value.split(':');

      return type.replace('$', '');
    }

    return 'config';
  };

  getTemplateKey = value => {
    if (value && value.toString().startsWith('$')) {
      const [_type, key] = value.split(':');

      return key;
    }

    return null;
  };

  state: {
    value: any,
    item: Object,
    error: boolean,
    yamlData?: string,
    type: string,
    selectedConfigItem?: string,
    useTemplate?: boolean,
    templateType?: string,
    templateKey?: string,
    tab: string,
  } = {
    value: this.props.item && this.props.item.yamlData.value,
    item: this.props.item,
    error: false,
    yamlData: this.props.item && this.props.item.yamlData,
    type:
      this.props.item ? this.props.item.type === 'any'
        ? this.props.item.currentType || null
        : this.props.item.type : null,
    useTemplate:
      this.props.item ? typeof this.props.item.value === 'string' &&
      this.props.item.value.startsWith('$') : false,
    templateType: this.props.item && this.getTemplateType(this.props.item.value),
    templateKey: this.props.item && this.getTemplateKey(this.props.item.value),
    tab: 'custom',
  };

  handleValueChange: Function = (value): void => {
    this.setState({ value });
  };

  handleDateChange: Function = (value): void => {
    let newValue: any = moment(value, DATE_FORMATS.URL_FORMAT);
    newValue = newValue.format(DATE_FORMATS.DISPLAY);

    this.setState({ value: newValue });
  };

  handleObjectChange: Function = (value): void => {
    this.setState({ value, error: false });

    try {
      jsyaml.safeDump(value);
    } catch (e) {
      this.setState({ error: true });
    }
  };

  handleDefaultClick = () => {
    this.setState({
      value: this.state.yamlData.default_value,
    });
  };

  handleSaveClick: Function = (): void => {
    const value: any = this.state.value;

    let newValue = value;

    if (this.state.type === 'string' && value === '') {
      newValue = jsyaml.safeDump(value);
    }

    this.props.onSubmit(
      this.state.item.name,
      newValue,
      this.state.item.parent_class,
    );
  };

  renderAllowedItems: Function = item => {
    if (this.state.type === 'hash' || this.state.type === '*hash') {
      return (
        <React.Fragment>
          {item.yamlData.allowed_values.map(value => (
            <Tree data={value} compact noControls expanded />
          ))}
        </React.Fragment>
      );
    }

    return (
      <Dropdown>
        <DControl icon="list" small>
          {this.props.t('ConfigSelectFromPredefined')}
        </DControl>
        {item.yamlData.allowed_values
          .filter(item => item)
          .map(value => (
            <Item
              title={value}
              onClick={() => {
                this.handleValueChange(value);
              }}
            />
          ))}
      </Dropdown>
    );
  };

  renderTypeSelector: Function = () => {
    const { t } = this.props;

    return (
      <Dropdown>
        <DControl icon="list" small>
          {this.state.type || t('SelectConfigItemType')}
        </DControl>
        <Item
          title={t('Integer')}
          onClick={() => {
            this.setState({ type: '*int', value: null });
          }}
        />
        <Item
          title={t('Float')}
          onClick={() => {
            this.setState({ type: '*float', value: null });
          }}
        />

        <Item
          title={t('Boolean')}
          onClick={() => {
            this.setState({ type: 'bool', value: null });
          }}
        />
        <Item
          title={t('String')}
          onClick={() => {
            this.setState({ type: '*string', value: null });
          }}
        />
        <Item
          title={t('Date')}
          onClick={() => {
            this.setState({ type: '*date', value: null });
          }}
        />
        <Item
          title={t('Other')}
          onClick={() => {
            this.setState({ type: 'Other', value: null });
          }}
        />
      </Dropdown>
    );
  };

  renderValueContent: Function = () => {
    const { t } = this.props;
    const { item } = this.state;

    if (item.yamlData.allowed_values) {
      return (
        <TextArea
          className={Classes.FILL}
          rows={getLineCount(this.state.value, null, 4)}
          value={this.state.value}
          readOnly
          style={{ marginTop: '5px' }}
          title={t('ConfigPredefinedOnlyInfo')}
          onChange={(event: any) => {
            this.handleObjectChange(event.target.value);
          }}
        />
      );
    }

    if (this.state.type) {
      switch (this.state.type) {
        case 'bool':
        case '*bool':
          return (
            <Dropdown>
              <DControl small>
                {this.state.value === 'true'
                  ? 'True'
                  : this.state.value === 'false'
                    ? 'False'
                    : 'Please select'}
              </DControl>
              <Item
                title="True"
                onClick={() => {
                  this.handleValueChange('true');
                }}
              />
              <Item
                title="False"
                onClick={() => {
                  this.handleValueChange('false');
                }}
              />
            </Dropdown>
          );
        case 'date':
        case '*date':
          return (
            <DatePicker
              date={this.state.value}
              onApplyDate={(newValue: any) => {
                this.handleDateChange(newValue);
              }}
              className="pt-fill"
              noButtons
              small
            />
          );
        case 'hash':
        case '*hash':
        case 'list':
        case '*list':
          return (
            <TextArea
              className="pt-fill"
              rows={getLineCount(this.state.value, null, 4)}
              value={this.state.value}
              onChange={(event: any) => {
                this.handleObjectChange(event.target.value);
              }}
            />
          );
        case 'int':
        case '*int':
          return (
            <InputGroup
              type="number"
              onKeyDown={(event: KeyboardEvent) => {
                if (
                  event.key === '.' ||
                  event.key === ',' ||
                  event.key === '-'
                ) {
                  event.preventDefault();
                }
              }}
              onChange={(event: any) => {
                this.handleObjectChange(event.target.value);
              }}
              value={this.state.value}
            />
          );
        case 'float':
        case '*float':
          return (
            <InputGroup
              type="number"
              onChange={(event: any) => {
                this.handleObjectChange(event.target.value);
              }}
              value={this.state.value}
            />
          );
        default:
          return (
            <TextArea
              className={Classes.FILL}
              rows={getLineCount(this.state.value, null, 4)}
              value={this.state.value}
              onChange={(event: any) => {
                this.handleObjectChange(event.target.value);
              }}
            />
          );
      }
    }

    return null;
  };

  render () {
    const { onClose, isGlobal, globalConfig, t } = this.props;
    const { error, yamlData, value, item, useTemplate, tab } = this.state;
    const globalConfigItems = pickBy(globalConfig, (data, name) =>
      isNull(data.value)
    );

    return (
      <Dialog
        isOpen
        title={
          !item
            ? t('AssignNewConfig')
            : `${t('Editing')} ${item.name}`
        }
        onClose={onClose}
      >
        <Box top fill scrollY>
            {item && item.desc && <Callout icon="info-sign">{item.desc}</Callout>}
            {isGlobal && (
              <>
                <Callout icon="warning-sign" intent="warning">
                  {!item ? t('CreatingNew') : t('Editing')} {t('GlobalConfigAffectsAll')}
                </Callout>
                {!item && (
                  <>
                    <Dropdown>
                      <DControl>{t('PleaseSelect')}</DControl>
                      {map(globalConfig, data => (
                        <Item
                          title={data.name}
                          onClick={(event, name) => {
                            // GET THE DATA OF THE CONFIG ITEM HERE
                            this.setState({
                              value: null,
                              item: { ...data, name },
                              type: data.type === 'any' ? null : data.type,
                              yamlData: data.yamlData,
                            });
                          }}
                        />
                      ))}
                    </Dropdown>
                    <br />
                  </>
                )}
              </>
            )}

            {!yamlData && <p>{t('PleaseSelectConfigItem')}</p>}
            {yamlData ? (
              <Tabs
              defaultSelectedTabId={'custom'}
              id={'ConfigItemsTabs'}
              renderActiveTabPanelOnly
              className={'fullHeightTabs'}
              onChange={(newTabId: string): void => {
                  this.setState({ value: null, tab: newTabId });
              }}
              selectedTabId={this.state.tab}
          >
                <Tab 
                  id={'custom'}
                  title={t('Custom')}
                  className={'flex-column flex-auto'}
                  panel= {
                    <React.Fragment>
                      <div className="configItemsEditor">
                        <div className="header">
                          {yamlData.allowed_values
                            ? this.renderAllowedItems(item)
                            : isGlobal
                              ? t('SetItemValue')
                              : t('SetCustomValue')}
                          {!isGlobal && (
                            <Pull right>
                              <ButtonGroup>
                                <Tooltip
                                  content={
                                    this.state.type === 'hash' ||
                                    this.state.type === 'list' ? (
                                        <Tree
                                          data={item.default_value}
                                          noButtons
                                          expanded
                                          compact
                                        />
                                      ) : (
                                        <ContentByType
                                          inTable
                                          noControls
                                          content={item.default_value}
                                        />
                                      )
                                  }
                                >
                                  <Button
                                    text={t('SetDefaultValue')}
                                    disabled={!item.default_value}
                                    onClick={this.handleDefaultClick}
                                    small
                                  />
                                </Tooltip>
                              </ButtonGroup>
                            </Pull>
                          )}
                        </div>
                        <div className="body">
                          {yamlData.allowed_values && (
                            <Callout intent="warning" icon="warning-sign">
                              {t('ConfigPredefinedValues')}
                            </Callout>
                          )}
                          {item.type === 'any' && (
                            <>
                              <Callout icon="info-sign" intent="primary">
                              {t('ConfigAnyType')}
                              </Callout>
                              {this.renderTypeSelector()}
                              <br />
                              <br />
                            </>
                          )}
                          {error && (
                            <Callout icon="warning-sign" intent="danger">
                              {t('ConfigFormatIncorrect')}
                            </Callout>
                          )}
                          {this.renderValueContent()}
                        </div>
                      </div>
                    </React.Fragment>
                  }
                />
                {!yamlData.allowed_values && (
                  <Tab
                    id={'template'}
                    title={t('Template')}
                    className={'flex-column flex-auto'}
                    panel={
                      <div className="configItemsEditor">
                      <div className="header">{t('ConfigCustomTemplate')}</div>
                      <div className="body">
                        <Callout intent="primary" icon="info-sign">
                          {`${t('ConfiTemplatesFormat')} $<type>:<key>`}
                        </Callout>
                        <ControlGroup className="pt-fill">
                          <Dropdown className="pt-fixed">
                            <DControl icon="dollar">
                              {this.state.templateType}
                            </DControl>
                            <Item
                              title="config"
                              onClick={() => {
                                this.setState({ templateType: 'config' });
                              }}
                            />
                            <Item
                              title="local"
                              onClick={() => {
                                this.setState({ templateType: 'local' });
                              }}
                            />
                            <Item
                              title="dynamic"
                              onClick={() => {
                                this.setState({ templateType: 'dynamic' });
                              }}
                            />
                            <Item
                              title="keys"
                              onClick={() => {
                                this.setState({ templateType: 'keys' });
                              }}
                            />
                            <Item
                              title="sensitive"
                              onClick={() => {
                                this.setState({ templateType: 'sensitive' });
                              }}
                            />
                            <Item
                              title="sensitive-alias"
                              onClick={() => {
                                this.setState({
                                  templateType: 'sensitive-alias',
                                });
                              }}
                            />
                            <Item
                              title="static"
                              onClick={() => {
                                this.setState({ templateType: 'static' });
                              }}
                            />
                            <Item
                              title="step"
                              onClick={() => {
                                this.setState({ templateType: 'step' });
                              }}
                            />
                          </Dropdown>
                          <Button text=":" className={Classes.FIXED} />
                          <InputGroup
                            value={this.state.templateKey}
                            onChange={(event: any) => {
                              this.setState({
                                templateKey: event.target.value,
                                value: `$${this.state.templateType}:${event.target.value}`,
                              });
                            }}
                          />
                        </ControlGroup>
                      </div>
                    </div>
                    }
                  />
                )}
              </Tabs>
            ) : null}
            {yamlData ? (
            <div>
              <ButtonGroup className="pull-right">
                <Button
                  text={t('Cancel')}
                  onClick={onClose}
                />
                {!isGlobal && value === yamlData.default_value ? (
                  <Popover
                    position={Position.TOP}
                    content={
                      <Box fill top style={{ width: '300px' }}>
                        <p>
                          {t('ConfigValueSameAsDefault')}
                        </p>
                        <ButtonGroup>
                          <Button
                            fill
                            text={t('SubmitAnyway')}
                            intent={Intent.SUCCESS}
                            onClick={this.handleSaveClick}
                          />
                        </ButtonGroup>
                      </Box>
                    }
                  >
                    <Button
                      text={t('Save')}
                      icon="warning-sign"
                      intent={Intent.WARNING}
                    />
                  </Popover>
                ) : (
                  <Button
                  text={t('Save')}
                    intent="success"
                    disabled={
                      error || (!item.type.startsWith('*') && !this.state.value)
                    }
                    onClick={this.handleSaveClick}
                  />
                )}
              </ButtonGroup>
            </div>
          ) : null}
            </Box>
        </Dialog>
    );
  }
}
