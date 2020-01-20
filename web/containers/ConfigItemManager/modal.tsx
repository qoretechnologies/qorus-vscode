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
    Tabs,
    Tab,
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
import ReactMarkdown from 'react-markdown';
import AutoField from '../../components/Field/auto';
import { StyledDialogBody } from '../ClassConnectionsManager';
import { validateField } from '../../helpers/validations';

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
        value: any;
        item: Object;
        error: boolean;
        yamlData?: string;
        type: string;
        selectedConfigItem?: string;
        useTemplate?: boolean;
        templateType?: string;
        templateKey?: string;
        tab: string;
    } = {
        value: this.props.item && this.props.item.value,
        item: this.props.item,
        error: false,
        yamlData: this.props.item && this.props.item.yamlData,
        type: this.props.item
            ? this.props.item.type === 'any'
                ? this.props.item.currentType || null
                : this.props.item.type
            : null,
        useTemplate: this.props.item
            ? typeof this.props.item.value === 'string' && this.props.item.value.startsWith('$')
            : false,
        templateType: this.props.item && this.getTemplateType(this.props.item.value),
        templateKey: this.props.item && this.getTemplateKey(this.props.item.value),
        tab: 'custom',
    };

    handleObjectChange: Function = (value, type, canBeNull): void => {
        this.setState({ value, error: false });

        // Validate the value
        const isValid = validateField(type, value, null, canBeNull);

        this.setState({ error: !isValid });
    };

    handleDefaultClick = () => {
        this.setState({
            value: this.state.item.default_value,
        });
    };

    handleSaveClick: Function = (): void => {
        const value: any = this.state.value;

        let newValue = value;

        if (this.state.type === 'string' && value === '') {
            newValue = jsyaml.safeDump(value);
        }

        this.props.onSubmit(this.state.item.name, newValue, this.state.item.parent_class);
    };

    renderAllowedItems: Function = item => {
        if (this.state.type === 'hash' || this.state.type === '*hash') {
            return (
                <React.Fragment>
                    {item.allowed_values.map(value => (
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
                {item.allowed_values
                    .filter(item => item)
                    .map(value => (
                        <Item
                            title={value}
                            onClick={() => {
                                this.handleObjectChange(value, item.type, item.can_be_undefined);
                            }}
                        />
                    ))}
            </Dropdown>
        );
    };

    render() {
        const { onClose, isGlobal, globalConfig, t } = this.props;
        const { error, yamlData, value, item } = this.state;

        return (
            <Dialog
                isOpen
                title={!item ? t('AssignNewConfig') : `${t('Editing')} ${item.name}`}
                onClose={onClose}
                style={{ backgroundColor: '#fff' }}
            >
                <StyledDialogBody style={{ flexFlow: 'column' }}>
                    {item && item.description && (
                        <Callout icon="info-sign">
                            <ReactMarkdown source={item.description} />
                        </Callout>
                    )}
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
                                panel={
                                    <React.Fragment>
                                        <div className="configItemsEditor">
                                            <div className="header">
                                                {item.allowed_values
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
                                                {item.allowed_values && (
                                                    <Callout intent="warning" icon="warning-sign">
                                                        {t('ConfigPredefinedValues')}
                                                    </Callout>
                                                )}
                                                {error && (
                                                    <Callout icon="warning-sign" intent="danger">
                                                        {t('ConfigFormatIncorrect')}
                                                    </Callout>
                                                )}
                                                <AutoField
                                                    name="configItem"
                                                    {...{ 'type-depends-on': true }}
                                                    value={this.state.value}
                                                    t={t}
                                                    type="auto"
                                                    disabled={!!item.allowed_values}
                                                    requestFieldData={field =>
                                                        field === 'can_be_undefined' ? item.can_be_undefined : item.type
                                                    }
                                                    onChange={(name, value, type, canBeNull) => {
                                                        this.handleObjectChange(value, type, canBeNull);
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </React.Fragment>
                                }
                            />
                            {!item.allowed_values && (
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
                                                        <DControl icon="dollar">{this.state.templateType}</DControl>
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
                                <Button text={t('Cancel')} onClick={onClose} />
                                {!isGlobal && value === item.default_value ? (
                                    <Popover
                                        position={Position.TOP}
                                        content={
                                            <Box fill top style={{ width: '300px' }}>
                                                <p>{t('ConfigValueSameAsDefault')}</p>
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
                                        <Button text={t('Save')} icon="warning-sign" intent={Intent.WARNING} />
                                    </Popover>
                                ) : (
                                    <Button
                                        text={t('Save')}
                                        intent="success"
                                        disabled={error}
                                        onClick={this.handleSaveClick}
                                    />
                                )}
                            </ButtonGroup>
                        </div>
                    ) : null}
                </StyledDialogBody>
            </Dialog>
        );
    }
}
