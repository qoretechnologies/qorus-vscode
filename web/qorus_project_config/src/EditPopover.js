import React, { Component } from 'react';
import { Button, Classes, H5, InputGroup, Intent, Popover, FormGroup } from '@blueprintjs/core';
import { texts } from './global';


export class EditPopover extends Component {

    componentWillMount() {
        this.name = this.props.data ? this.props.data.name : null;
        this.url = this.props.data ? this.props.data.url : null;
        this.action = this.props.action || this.props.kind + '-' + this.props.entity.toLowerCase();
    }

    inputRefName = (input) => {
        if (input && !this.nameHidden()) {
            input.focus();
        }
    }

    inputRefUrl = (input) => {
        if (input && this.nameHidden()) {
            input.focus();
        }
    }

    nameHidden = () => {
        return ['edit-main-url'].includes(this.action);
    }

    urlHidden = () => {
        return ['add-env', 'edit-env'].includes(this.action);
    }

    onNameChange = (ev) => {
        this.name = ev.target.value;
    }

    onUrlChange = (ev) => {
        this.url = ev.target.value;
    }

    submit = (ev) => {
        ev.preventDefault();
        this.props.onEdit(this.action, {env_id: this.props.env_id,
                                        qorus_id: this.props.qorus_id,
                                        url_id: this.props.url_id,
                                        name: this.name,
                                        url: this.url});
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
            <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}>
                <Button icon={kind == 'edit' ? 'edit' : 'plus'} title={global.texts[kind]} />
                <form onSubmit={this.submit} style={this.urlHidden() ? {} : { minWidth: '310px' }}>
                    <H5>{header}</H5>
                    {this.nameHidden() ||
                        <FormGroup label={global.texts.name} labelFor='name'>
                            <InputGroup id='name' type='text'
                                        defaultValue={this.props.data ? this.props.data.name : null}
                                        onChange={this.onNameChange.bind(this)}
                                        inputRef={this.inputRefName.bind(this)} />
                        </FormGroup>
                    }
                    {this.urlHidden() ||
                        <FormGroup label={url_label} labelFor='url'>
                            <InputGroup id='url' type='text'
                                        defaultValue={this.props.data ? this.props.data.url : null}
                                        onChange={this.onUrlChange.bind(this)}
                                        inputRef={this.inputRefUrl.bind(this)} />
                        </FormGroup>
                    }
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 25 }}>
                        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                            {global.texts.buttonCancel}
                        </Button>
                        <Button type='submit' intent={Intent.SUCCESS} className={Classes.POPOVER_DISMISS}>
                            {global.texts.buttonSave}
                        </Button>
                    </div>
                </form>
            </Popover>
        );
    }
}
