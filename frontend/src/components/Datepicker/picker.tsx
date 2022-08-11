/* @flow */
import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Intent, InputGroup, ControlGroup, Button, ButtonGroup, Classes } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';

@withTextContext()
export default class Picker extends Component {
    componentDidMount(): void {
        document.addEventListener('click', this.handleOutsideClick);
    }

    componentWillUnmount(): void {
        document.removeEventListener('click', this.handleOutsideClick);
    }

    handleOutsideClick: Function = (event: Object): void => {
        const el = ReactDOM.findDOMNode(this.refs.datepicker);

        if (!el.contains(event.target)) {
            this.props.onResetClick();
            this.props.hideDatepicker();
        }
    };

    renderControls() {
        const { t } = this.props;
        if (this.props.futureOnly) return undefined;

        return (
            <ButtonGroup>
                <Button text={t('datetime.24h')} onClick={this.props.on24hClick} />
                <Button text={t('datetime.all')} onClick={this.props.onAllClick} />
            </ButtonGroup>
        );
    }

    render() {
        const { t } = this.props;

        return (
            <div className="datepicker" ref="datepicker">
                {this.props.children}
                <ControlGroup fill className={Classes.SMALL}>
                    <Button icon="time" />
                    <InputGroup
                        type="number"
                        name="hours"
                        max="23"
                        min="0"
                        value={this.props.hours}
                        onChange={this.props.onHoursChange}
                    />
                    <Button text=":" />
                    <InputGroup
                        type="number"
                        name="minutes"
                        max="59"
                        min="0"
                        value={this.props.minutes}
                        onChange={this.props.onMinutesChange}
                    />
                    <Button icon="undo" title={t('datetime.reset')} onClick={this.props.onResetClick} />
                </ControlGroup>
                <div className="datepicker-submit">
                    {this.renderControls()}
                    <ButtonGroup>
                        <Button
                            className="pull-right"
                            intent={Intent.SUCCESS}
                            onClick={this.props.onApplyClick}
                            icon="small-tick"
                        >
                            {t('datetime.apply')}
                        </Button>
                    </ButtonGroup>
                </div>
            </div>
        );
    }
}
