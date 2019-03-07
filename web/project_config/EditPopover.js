import React, { Component } from 'react';
import { Button, Classes, Colors, H5, InputGroup,
         Intent, Popover, PopoverInteractionKind, FormGroup } from '@blueprintjs/core';


export class EditPopover extends Component {

    componentDidMount() {
        this.name = this.props.data ? this.props.data.name : null;
        this.url = this.props.data ? this.props.data.url : null;
        this.action = this.props.action || this.props.kind + '-' + this.props.entity.toLowerCase();
        this.name_hidden = ['edit-main-url'].includes(this.action);
        this.url_hidden = ['add-env', 'edit-env'].includes(this.action);
        this.name_input = null;
        this.url_input = null;
        this.setState({is_open: false});
    }

    inputRefName = input => {
        this.name_input = input;
        if (input && !this.name_hidden) {
            input.focus();
        }
    }

    inputRefUrl = input => {
        this.url_input = input;
        if (input && this.name_hidden) {
            input.focus();
        }
    }

    onChange = (field, ev) => {
        this[field] = ev.target.value.trim();
        this[field + '_input'].setAttribute('style', null);
    }

    submit = (ev) => {
        ev.preventDefault();
        let can_close = true;
        if (!this.name_hidden && !this.name) {
            this.name_input.setAttribute('style', 'background-color: ' + Colors.ORANGE5)
            this.name_input.setAttribute('placeholder', this.props.t('MandatoryInput'));
            can_close = false;
        }
        if (!this.url_hidden && !this.url) {
            this.url_input.setAttribute('style', 'background-color: ' + Colors.ORANGE5)
            this.url_input.setAttribute('placeholder', this.props.t('MandatoryInput'));
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
        this.setState({is_open: false});
    }

    render () {
        if (!this.state) {
            return null;
        }

        const t = this.props.t;

        const kind = this.props.kind;      //  'edit' or 'add'
        const entity = this.props.entity;  //  'Env' or 'Qorus' or 'Url'
        const UrlLabel = ['edit-main-url', 'edit-qorus'].includes(this.action)
                                ? t('MainUrl')
                                : t('Url');
        const Header = ['edit-main-url'].includes(this.action)
                                ? t('EditMainUrl')
                                : t(kind[0].toUpperCase() + kind.substr(1) + entity);
        return (
            <Popover popoverClassName={Classes.POPOVER_CONTENT_SIZING}
                     interactionKind={PopoverInteractionKind.CLICK}
                     onInteraction={nextOpenState => {this.setState({is_open: nextOpenState});}}
                     isOpen={this.state.is_open}>
                <Button icon={kind == 'edit' ? 'edit' : 'plus'}
                        title={kind == 'edit' ? t('Edit') : t('AddNew')} />
                <form onSubmit={this.submit} style={this.url_hidden ? {} : { minWidth: '310px' }}>
                    <H5>{Header}</H5>
                    {this.name_hidden ||
                        <FormGroup label={t('Name')} labelFor='name'>
                            <InputGroup id='name' type='text'
                                        defaultValue={this.props.data ? this.props.data.name : null}
                                        onChange={this.onChange.bind(null, 'name')}
                                        inputRef={this.inputRefName} />
                        </FormGroup>
                    }
                    {this.url_hidden ||
                        <FormGroup label={UrlLabel} labelFor='url'>
                            <InputGroup id='url' type='text'
                                        defaultValue={this.props.data ? this.props.data.url : null}
                                        onChange={this.onChange.bind(null, 'url')}
                                        inputRef={this.inputRefUrl} />
                        </FormGroup>
                    }
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 25 }}>
                        <Button className={Classes.POPOVER_DISMISS} style={{ marginRight: 10 }}>
                            {t('ButtonCancel')}
                        </Button>
                        <Button type='submit' intent={Intent.SUCCESS}>
                            {t('ButtonSave')}
                        </Button>
                    </div>
                </form>
            </Popover>
        );
    }
}
