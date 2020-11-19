// @flow
import {
    Button,
    ButtonGroup,
    Callout,
    Classes,
    ControlGroup,
    InputGroup,
    Intent,
    Popover,
    Position,
    Tab,
    Tabs,
    Tooltip,
} from '@blueprintjs/core';
import jsyaml from 'js-yaml';
import map from 'lodash/map';
import React, { Component } from 'react';
import ReactMarkdown from 'react-markdown';
import CustomDialog from '../../components/CustomDialog';
import Dropdown, { Control as DControl, Item } from '../../components/Dropdown';
import AutoField from '../../components/Field/auto';
import Pull from '../../components/Pull';
import Box from '../../components/ResponsiveBox';
import Tree from '../../components/Tree';
import { validateField } from '../../helpers/validations';
import withTextContext from '../../hocomponents/withTextContext';
import { StyledDialogBody } from '../ClassConnectionsManager';
import { Value } from './table';

const templatesList = [
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
        const [_type, key] = value.replace(/'/g, '').split(':');

        return key;
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
        useTemplate: this.props.item ? this.props.item.is_templated_string : false,
        templateType: this.props.item?.is_templated_string && this.getTemplateType(this.props.item.value),
        templateKey: this.props.item?.is_templated_string && this.getTemplateKey(this.props.item.value),
        tab: this.props.item?.is_templated_string ? 'template' : 'custom',
        isTemplatedString: this.props.item?.is_templated_string,
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

        if (this.state.tab === 'template') {
            newValue = `$${this.state.templateType}:${this.state.templateKey}`;
        }

        this.props.onSubmit(this.state.item.name, newValue, this.state.item.parent_class, this.state.isTemplatedString);
    };

    renderAllowedItems: Function = (item) => {
        if (this.state.type === 'hash' || this.state.type === '*hash') {
            return (
                <React.Fragment>
                    {item.allowed_values.map((value) => (
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
                    .filter((item) => item)
                    .map((value) => (
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

    isDisabled = () => {
        const { tab, templateType, templateKey, value, error } = this.state;

        if (tab === 'template') {
            return templateKey && templateKey !== '' && templateType && templateType !== '';
        } else {
            return !error;
        }
    };

    render() {
        const { onClose, isGlobal, globalConfig, t } = this.props;
        const { error, yamlData, value, item } = this.state;

        return (
            <CustomDialog
                isOpen
                title={!item ? t('AssignNewConfig') : `${t('Editing')} ${item.name}`}
                onClose={onClose}
                style={{ backgroundColor: '#fff' }}
            >
                <StyledDialogBody style={{ flexFlow: 'column' }}>
                    {item && item.description && (
                        <Callout icon="info-sign" title={t('Description')}>
                            <ReactMarkdown source={item.description} />
                            --
                            <p>
                                {' '}
                                {t('ConfigItemIsType')}{' '}
                                <strong>
                                    {'<'}
                                    {item.can_be_undefined ? '*' : ''}
                                    {item.type} {'/>'}
                                </strong>
                            </p>
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
                                        {map(globalConfig, (data) => (
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
                                this.setState({
                                    value: null,
                                    tab: newTabId,
                                    isTemplatedString: newTabId === 'template',
                                });
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
                                                            <Tooltip content={<Value item={item} useDefault />}>
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
                                                    requestFieldData={(field) =>
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
                            <Tab
                                id={'template'}
                                title={t('Template')}
                                className={'flex-column flex-auto'}
                                panel={
                                    <div className="configItemsEditor">
                                        <div className="header">{t('ConfigCustomTemplate')}</div>
                                        <div className="body">
                                            <Callout intent="primary" icon="info-sign">
                                                {`${t('ConfigTemplatesFormat')} $<type>:<key>`}
                                            </Callout>
                                            <div style={{ marginTop: '10px' }} />
                                            <ControlGroup className="pt-fill">
                                                <Dropdown className="pt-fixed">
                                                    <DControl icon="dollar">{this.state.templateType}</DControl>
                                                    {templatesList.map((template) => (
                                                        <Item
                                                            title={template}
                                                            onClick={() => {
                                                                this.setState({ templateType: template });
                                                            }}
                                                        />
                                                    ))}
                                                </Dropdown>
                                                <Button text=":" className={Classes.FIXED} />
                                                <InputGroup
                                                    fill
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
                        </Tabs>
                    ) : null}
                    {yamlData ? (
                        <div>
                            <ButtonGroup className="pull-right">
                                <Button text={t('Cancel')} onClick={onClose} />
                                {!isGlobal && this.state.tab !== 'template' && value === item.default_value ? (
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
                                        disabled={!this.isDisabled()}
                                        onClick={this.handleSaveClick}
                                    />
                                )}
                            </ButtonGroup>
                        </div>
                    ) : null}
                </StyledDialogBody>
            </CustomDialog>
        );
    }
}
