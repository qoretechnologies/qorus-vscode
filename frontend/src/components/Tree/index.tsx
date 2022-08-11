// @flow
import React, { Component } from 'react';
import classNames from 'classnames';
import { Intent, Icon, ButtonGroup, Button } from '@blueprintjs/core';
import size from 'lodash/size';

import Pull from '../Pull';
import Flex from '../Flex';
import ContentByType from '../ContentByType';
import { getType } from '../../helpers/functions';
import withTextContext from '../../hocomponents/withTextContext';

export const getLineCount: Function = (value: string): number => {
    try {
        return value.match(/[^\n]*\n[^\n]*/gi).length;
    } catch (e) {
        return 0;
    }
};

const qorusTypeMapper = {
    array: 'list',
    object: 'hash',
    string: 'string',
    number: 'number',
    boolean: 'boolean',
    null: 'null',
};

@withTextContext()
export default class Tree extends Component {
    props: {
        data: Object | Array<any>;
        withEdit: boolean;
        onUpdateClick: Function;
        noControls: boolean;
        noButtons: boolean;
        forceEdit: boolean;
        customEditData: string;
        customEdit: boolean;
        onEditClick: Function;
        onKeyEditClick: Function;
        openModal: Function;
        closeModal: Function;
        id: number;
        editableKeys: boolean;
        expanded: boolean;
        compact: boolean;
        caseSensitive: boolean;
    } = this.props;

    state = {
        mode: 'normal',
        items: {},
        allExpanded: this.props.expanded,
        showTypes: false,
    };

    componentWillReceiveProps(nextProps: Object) {
        if (nextProps.forceEdit) {
            this.setState({
                mode: 'edit',
            });
        }
    }

    componentDidUpdate() {
        if (this.state.mode === 'copy' && document.getElementById('tree-content')) {
            document.getElementById('tree-content').select();
        }
    }

    handleCopyClick = () => {
        this.setState({
            mode: 'copy',
        });
    };

    handleTypesClick = () => {
        this.setState({
            showTypes: !this.state.showTypes,
        });
    };

    handleEditClick = () => {
        if (this.props.onEditClick) {
            this.props.onEditClick();
        }

        this.setState({
            mode: 'edit',
        });
    };

    handleTreeClick = () => {
        this.setState({
            mode: 'normal',
        });
    };

    handleExpandClick = () => {
        this.setState({ items: {}, allExpanded: true });
    };

    handleCollapseClick = () => {
        this.setState({ items: {}, allExpanded: false });
    };

    renderTree(data, top, k, topKey, level = 1) {
        return Object.keys(data).map((key, index) => {
            const wrapperClass = classNames({
                'tree-component': true,
                'tree-top': top,
                last: typeof data[key] !== 'object' || data[key] === null,
                nopad: !this.isDeep(),
                [`level-${level}`]: true,
            });

            const dataType: string = getType(data[key]);
            const displayKey: string = key;
            const stateKey = k ? `${k}_${key}` : key;
            let isObject = typeof data[key] === 'object' && data[key] !== null;
            let isExpandable =
                typeof data[key] !== 'object' ||
                this.state.items[stateKey] ||
                (this.state.allExpanded && this.state.items[stateKey] !== false);

            if (isObject && size(data[key]) === 0) {
                isObject = false;
                isExpandable = false;
            }

            const handleClick = () => {
                const { items } = this.state;

                items[stateKey] = !isExpandable;

                this.setState({
                    items,
                });
            };

            return (
                <div key={index} className={wrapperClass}>
                    <div
                        className={`${isObject ? 'object' : ''} ${isExpandable ? 'expanded' : ''} tree-key`}
                        onClick={handleClick}
                    >
                        {isObject && <Icon icon={isExpandable ? 'small-minus' : 'small-plus'} />}{' '}
                        <span
                            className={classNames({
                                'data-control': isObject,
                                expand: isObject && !isExpandable,
                                clps: isObject && isExpandable,
                                [`level-${level}`]: true,
                            })}
                        >
                            {isObject ? displayKey : `${displayKey}:`}{' '}
                            {this.state.showTypes && <code>{qorusTypeMapper[dataType]}</code>}
                        </span>
                    </div>
                    {isExpandable && isObject
                        ? this.renderTree(data[key], false, stateKey, top ? key : null, level + 1)
                        : null}
                    {!isObject && <ContentByType content={data[key]} />}
                </div>
            );
        });
    }

    renderText(data, tabs = '') {
        let text = '';

        Object.keys(data).forEach(key => {
            if (typeof data[key] !== 'object' || !data[key]) {
                text += `${tabs}${key}: ${data[key]}\r\n`;
            } else {
                text += `${tabs}${key}:\r\n`;
                text += this.renderText(data[key], `${tabs}\t`);
            }
        });

        return text;
    }

    isDeep = () =>
        Object.keys(this.props.data).some((key: string): boolean => typeof this.props.data[key] === 'object');

    render() {
        const { data, compact, noButtons, t } = this.props;
        const { mode, showTypes, allExpanded, items } = this.state;

        if (!data || !Object.keys(data).length) {
            return compact ? <ContentByType content={data} /> : <p> No Data </p>;
        }

        const textData: string = this.renderText(data);
        const lineCount: number = getLineCount(textData);

        return (
            <Flex>
                {!noButtons && (
                    <div>
                        <Pull>
                            <ButtonGroup>
                                {this.isDeep() && [
                                    <Button
                                        icon="expand-all"
                                        text={!compact && t('tree.expand-all')}
                                        onClick={this.handleExpandClick}
                                        key="expand-button"
                                    />,
                                    allExpanded || size(items) > 0 ? (
                                        <Button
                                            icon="collapse-all"
                                            text={!compact && t('tree.collapse-all')}
                                            onClick={this.handleCollapseClick}
                                            key="collapse-button"
                                        />
                                    ) : null,
                                ]}
                                {!this.props.noControls && (
                                    <Button
                                        icon="code"
                                        text={!compact && t('tree.show-types')}
                                        onClick={this.handleTypesClick}
                                    />
                                )}
                            </ButtonGroup>
                        </Pull>
                        {!this.props.noControls && (
                            <Pull right>
                                <ButtonGroup>
                                    <Button
                                        text={!compact && t('tree.tree-view')}
                                        onClick={this.handleTreeClick}
                                        icon="diagram-tree"
                                    />
                                    <Button
                                        text={!compact && t('tree.copy-view')}
                                        onClick={this.handleCopyClick}
                                        icon="clipboard"
                                    />
                                </ButtonGroup>
                            </Pull>
                        )}
                    </div>
                )}
                {this.state.mode === 'normal' && (
                    <Flex scrollY className="tree-wrapper">
                        {this.renderTree(this.props.data, true)}
                    </Flex>
                )}
                {this.state.mode === 'copy' && (
                    <textarea
                        id="tree-content"
                        className="pt-input pt-fill"
                        defaultValue={textData}
                        rows={lineCount > 20 ? 20 : lineCount}
                        cols={50}
                        readOnly
                    />
                )}
            </Flex>
        );
    }
}
