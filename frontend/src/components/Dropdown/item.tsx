/* @flow */
import React, { Component } from 'react';
import classNames from 'classnames';
import { MenuItem, Intent, Icon } from '@blueprintjs/core';

export default class Item extends Component {
    componentDidMount() {
        this.setup();
    }

    componentDidUpdate() {
        this.setup();
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    handleClick = (event): void => {
        event.preventDefault();

        this.action(event);
    };

    handleKeyPress: Function = (event): void => {
        if (event.which === 13) {
            event.preventDefault();

            this.action(event);
        }
    };

    setup: Function = () => {
        document.removeEventListener('keypress', this.handleKeyPress);

        if (this.props.marked) {
            document.addEventListener('keypress', this.handleKeyPress);
        }
    };

    action: Function = (event): void => {
        const act = this.props.action || this.props.onClick;

        if (act && event) {
            act(event, this.props.title);
        }

        if (!this.props.multi) {
            if (this.props.hideDropdown) this.props.hideDropdown();
        } else {
            if (this.props.toggleItem) this.props.toggleItem(this.props.title);
        }
    };

    /**
     * Renders the icon for the dropdown item
     * @returns {ReactElement|Void}
     */
    renderIcon() {
        if (this.props.icon) {
            return <i className={classNames('fa', `fa-${this.props.icon}`)} />;
        }

        return null;
    }

    render() {
        const { selected, title, marked, multi, disabled, icon } = this.props;
        let intent = this.props.intent;

        if (marked) {
            intent = Intent.WARNING;
        } else if (selected) {
            intent = Intent.PRIMARY;
        }

        return (
            <MenuItem
                shouldDismissPopover={!multi}
                text={title}
                icon={icon}
                onClick={this.handleClick}
                intent={intent}
                disabled={disabled}
                labelElement={selected && <Icon icon="small-tick" />}
            />
        );
    }
}
