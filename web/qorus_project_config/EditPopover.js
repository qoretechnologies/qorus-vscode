import React, { Component } from 'react';
import { Button, Classes, Colors, H5, InputGroup,
         Intent, Popover, PopoverInteractionKind, FormGroup } from '@blueprintjs/core';
import { texts } from './global';


export class EditPopover extends Component {

    componentWillMount() {
        this.name = this.props.data ? this.props.data.name : null;
        this.url = this.props.data ? this.props.data.url : null;
        this.action = this.props.action || this.props.kind + '-' + this.props.entity.toLowerCase();
        this.name_hidden = ['edit-main-url'].includes(this.action);
        this.url_hidden = ['add-env', 'edit-env'].includes(this.action);
        this.name_input = null;
        this.url_input = null;
        this.setState({isOpen: false});
    }

    inputRefName = (input) => {
        this.name_input = input;
        if (input && !this.name_hidden) {
            input.focus();
        }
    }

    inputRefUrl = (input) => {
        this.url_input = input;
        if (input && this.name_hidden) {
            input.focus();
        }
    }

    onNameChange = (ev) => {
        this.name_input.setAttribute('style', null);
        this.name = ev.target.value.trim();
    }

    onUrlChange = (ev) => {
        this.url_input.setAttribute('style', null);
        this.url = ev.target.value.trim();
    }

    submit = (ev) => {
        ev.preventDefault();
        let can_close = true;
        if (!this.name_hidden && !this.name) {
            this.name_input.setAttribute('style', 'background-color: ' + Colors.ORANGE5)
            this.name_input.setAttribute('placeholder', global.texts.mandatoryInput);
            can_close = false;
        }
        if (!this.url_hidden && !this.url) {
            this.url_input.setAttribute('style', 'background-color: ' + Colors.ORANGE5)
            this.url_input.setAttribute('placeholder', global.texts.mandatoryInput);
            can_close = false;
        }
        if (!can_close) {
            return;
        }

        this.props.onEdit(this.action, {env_id: this.props.env_id,
                                        qorus_id: this.props.qorus_id,
                                        url_id: this.props.url_id,
                                        name: this.name,
                                        url: this.url});
        this.setState({isOpen: false});
    }

    render () {
        const kind = this.props.kind;      //  'edit' or 'add'
        const entity = this.props.entity;  //  'Env' or 'Qorus' or 'Url'
        const url_label = ['edit-main-url', 'edit-qorus'].includes(this.action)
                                ? global.texts.mainUrl
                                : global.texts.url;
        const header = ['edit-main-url'].includes(this.action)
                                ? global.texts.editMainUrl
                                : global.texts[kind + entity];

        return (
            <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                     interactionKind={PopoverInteractionKind.CLICK}
                     onInteraction={nextOpenState => {this.setState({isOpen: nextOpenState});}}
                     isOpen={this.state.isOpen}>
                <Button icon={kind == 'edit' ? 'edit' : 'plus'} title={global.texts[kind]} />
                <form onSubmit={this.submit} style={this.url_hidden ? {} : { minWidth: '310px' }}>
                    <H5>{header}</H5>
                    {this.name_hidden ||
                        <FormGroup label={global.texts.name} labelFor='name'>
                            <InputGroup id='name' type='text'
                                        defaultValue={this.props.data ? this.props.data.name : null}
                                        onChange={this.onNameChange}
                                        inputRef={this.inputRefName} />
                        </FormGroup>
                    }
                    {this.url_hidden ||
                        <FormGroup label={url_label} labelFor='url'>
                            <InputGroup id='url' type='text'
                                        defaultValue={this.props.data ? this.props.data.url : null}
                                        onChange={this.onUrlChange}
                                        inputRef={this.inputRefUrl} />
                        </FormGroup>
                    }
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 25 }}>
                        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                            {global.texts.buttonCancel}
                        </Button>
                        <Button type='submit' intent={Intent.SUCCESS}>
                            {global.texts.buttonSave}
                        </Button>
                    </div>
                </form>
            </Popover>
        );
    }
}
