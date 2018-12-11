const vscode = acquireVsCodeApi();

let texts = null;

class Root extends React.Component {
    constructor() {
        super();
        this.state = {
            data: null,
            selected_env_id: null,
            selected_qorus_id: null
        };

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'set-data':
                    texts = event.data.texts;
                    this.setState({data: event.data.data});
                    break;
            }
        });
    }

    componentWillMount() {
        vscode.postMessage({
            action: 'get-data'
        });
    }

    componentDidMount() {
        let me = this;
        $('form.change_config').submit(function(event) {
            event.preventDefault();
            me.updateData(
                $('#action').val(),
                {
                    env_id: $('#env_id').val(),
                    qorus_id: $('#qorus_id').val(),
                    url_id: $('#url_id').val(),
                    name: $('#name').val(),
                    url: $('#url').val()
                }
            );
        });
    }

    selectEnv(env_id) {
        this.setState({
            selected_env_id: env_id,
            selected_qorus_id: null
        });
        $('#label_qoruses').html(
            texts.qorusInstancesIn + '&nbsp;' +
            '<span class="text-info font-weight-bold text-center">' +
                this.state.data[env_id].name +
            '</span>'
        );
        $('#label_urls').html(texts.urls);
    }

    selectQorus(qorus_id) {
        this.setState({selected_qorus_id: qorus_id});
        $('#label_urls').html(
            texts.urlsOf + '&nbsp;' +
            '<span class="text-warning font-weight-bold text-center">' +
                this.state.data[this.state.selected_env_id].qoruses[qorus_id].name +
            '</span>'
        );
    }

    moveEnvUp(env_id) {
        this.updateData('move-env-up', {env_id: env_id});
    }

    moveQorusUp(env_id, qorus_id) {
        this.updateData('move-qorus-up', {env_id: env_id, qorus_id: qorus_id});
    }

    moveUrlUp(env_id, qorus_id, url_id) {
        this.updateData('move-url-up', {env_id: env_id, qorus_id: qorus_id, url_id: url_id});
    }

    render() {
        if (!this.state.data) {
            return null;
        }

        let selected_env = (this.state.selected_env_id !== null)
            ? this.state.data[this.state.selected_env_id]
            : null;
        let selected_qorus = (this.state.selected_qorus_id !== null)
            ? this.state.data[this.state.selected_env_id].qoruses[this.state.selected_qorus_id]
            : null;

        return (
            <div className='row'>
                <Envs data={this.state.data}
                      selected_env_id={this.state.selected_env_id}
                      onSelect={this.selectEnv.bind(this)}
                      onMoveUp={this.moveEnvUp.bind(this)} />
                <Qoruses env={selected_env}
                         selected_qorus_id={this.state.selected_qorus_id}
                         onSelect={this.selectQorus.bind(this)}
                         onMoveUp={this.moveQorusUp.bind(this)} />
                <Urls env_id={this.state.selected_env_id}
                      qorus={selected_qorus}
                      onMoveUp={this.moveUrlUp.bind(this)} />
            </div>
        );
    }

    updateData(action, values) {
        let data = JSON.parse(JSON.stringify(this.state.data));
        let index, env, qorus, qoruses, url, urls;

        let resetIds = ((array, index) => {
            for (let i = index; i < array.length; i++) {
                array[i].id = i;
            }
        });

        switch (action) {
            case 'edit-env':
                env = data[values.env_id];
                env.name = values.name;
                break;
            case 'add-env':
                data.push({
                    id: data.length,
                    name: values.name,
                    qoruses: []
                });
                break;
            case 'remove-env':
                index = values.env_id;
                data.splice(index, 1);
                if (this.state.selected_env_id == index) {
                    this.setState({selected_env_id: null});
                }
                else if (this.state.selected_env_id > index) {
                    this.setState({selected_env_id: this.state.selected_env_id - 1});
                }
                resetIds(data, index);
                break;
            case 'move-env-up':
                index = values.env_id;
                data[index-1] = data.splice(index, 1, data[index-1])[0]
                if (this.state.selected_env_id == index) {
                    this.setState({selected_env_id: index - 1})
                }
                else if (this.state.selected_env_id == index - 1) {
                    this.setState({selected_env_id: index})
                }
                resetIds(data, index - 1);
                break;
            case 'edit-qorus':
                qorus = data[values.env_id].qoruses[values.qorus_id];
                qorus.name = values.name;
                break;
            case 'add-qorus':
                qoruses = data[values.env_id].qoruses;
                qoruses.push({
                    id: qoruses.length,
                    name: values.name,
                    url: values.url,
                    urls: []
                });
                break;
            case 'remove-qorus':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses.splice(index, 1);
                if (this.state.selected_qorus_id == index) {
                    this.setState({selected_qorus_id: null});
                }
                else if (this.state.selected_qorus_id > index) {
                    this.setState({selected_qorus_id: this.state.selected_qorus_id - 1});
                }
                resetIds(qoruses, index);
                break;
            case 'move-qorus-up':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses[index-1] = qoruses.splice(index, 1, qoruses[index-1])[0]
                if (this.state.selected_qorus_id == index) {
                    this.setState({selected_qorus_id: index - 1})
                }
                else if (this.state.selected_qorus_id == index - 1) {
                    this.setState({selected_qorus_id: index})
                }
                resetIds(qoruses, index - 1);
                break;
            case 'edit-main-url':
                qorus = data[values.env_id].qoruses[values.qorus_id];
                qorus.url = values.url;
                break;
            case 'edit-url':
                url = data[values.env_id].qoruses[values.qorus_id].urls[values.url_id];
                url.name = values.name;
                url.url = values.url;
                break;
            case 'add-url':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                urls.push({
                    id: urls.length,
                    name: values.name,
                    url: values.url
                });
                break;
            case 'remove-url':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                index = values.url_id;
                urls.splice(index, 1);
                resetIds(urls, index);
                break;
            case 'move-url-up':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                index = values.url_id;
                urls[index-1] = urls.splice(index, 1, urls[index-1])[0]
                resetIds(urls, index - 1);
                break;
        }

        $('.config_modal').modal('hide');

        this.setState({data: data});

        vscode.postMessage({
            action: 'update-data',
            data: data
        });
    }
}

class SelectButton extends React.Component {
    render() {
        return (
            <button className={'btn btn-lg btn-block ' + this.props.selectBtnClass
                                                + (this.props.active ? ' active' : '')}
                    onClick={this.props.onSelect.bind(this, this.props.data.id)} >
                {this.props.data.name}
            </button>
        );
    }
}

class AddButton extends React.Component {
    render () {
        return (
            <div className='row'>
                <div className={this.props.positionClass}>
                    <div className='btn-group btn-group-sm' role='group' style={{margin: '18px 0'}}>
                        <button className='btn btn-success' title={this.props.label} role='button'
                                href='#edit_config_modal' data-toggle='modal' data-target='#edit_config_modal'
                                data-text={this.props.label} data-action={this.props.action}
                                data-env-id={this.props.env_id} data-qorus-id={this.props.qorus_id}>
                            <i className='fas fa-plus'></i>
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

class ButtonRow extends React.Component {
    render() {
        return (
            <div className='row'>
                <div className='col-sm-7'>
                    <SelectButton data={this.props.data}
                                  selectBtnClass={this.props.selectBtnClass}
                                  active={this.props.active}
                                  onSelect={this.props.onSelect.bind(this)} />
                </div>
                <div className='col-sm-5 text-left'>
                    {this.props.env_id
                        ?   <QorusEdit env_id={this.props.env_id}
                                       qorus={this.props.data}
                                       onMoveUp={this.props.onMoveUp ? this.props.onMoveUp.bind(this) : null} />
                        :   <EnvEdit env={this.props.data}
                                     onMoveUp={this.props.onMoveUp ? this.props.onMoveUp.bind(this) : null} />
                    }
                </div>
            </div>
        );
    }
}

class Envs extends React.Component {
    render() {
        let buttonRows = [];
        let is_first = true;
        for (let env_id in this.props.data) {
            let env = this.props.data[env_id];
            buttonRows.push(<ButtonRow kind={'env'}
                                       data={env}
                                       selectBtnClass={'btn-outline-info'}
                                       active={env_id == this.props.selected_env_id}
                                       onSelect={this.props.onSelect.bind(this)}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='col-sm-3'>
                {buttonRows}
                <AddButton label={texts.addEnvironment} action={'add-env'}
                           positionClass={'offset-sm-7 col-sm-5 text-left'} />
            </div>
        );
    }
}

class EnvEdit extends React.Component {
    render() {
        let env = this.props.env;
        return (
            <div className='btn-group btn-group-sm' role='group' style={{margin: '8px 0'}}>
                <button className='btn btn-primary' title={texts.edit} role='button'
                            data-target='#edit_config_modal' data-toggle='modal'
                            data-text={texts.editEnvironment} data-action='edit-env'
                            data-env-id={env.id} data-name={env.name}>
                    <i className='fas fa-pencil-alt'></i>
                </button>
                <button className='btn btn-danger' title={texts.remove}
                            role='button' data-target='#remove_config_modal'
                            data-toggle='modal' data-text={texts.confirmRemoveEnv}
                            data-action='remove-env' data-env-id={env.id}>
                    <i className='fas fa-times'></i>
                </button>
                {this.props.onMoveUp ?
                    <button className='btn btn-warning' title={texts.moveUp}
                                role='button' onClick={this.props.onMoveUp.bind(this, env.id)}>
                        <i className='fas fa-arrow-up'></i>
                    </button> : null}
            </div>
        );
    }
}

class Qoruses extends React.Component {
    render() {
        if (!this.props.env) {
            return null;
        }

        let buttonRows = [];
        let env = this.props.env;
        let is_first = true;
        for (let qorus_id in env.qoruses) {
            let qorus = env.qoruses[qorus_id];
            buttonRows.push(<ButtonRow env_id={env.id}
                                       kind={'qorus'}
                                       data={qorus}
                                       selectBtnClass={'btn-outline-warning'}
                                       active={qorus_id == this.props.selected_qorus_id}
                                       onSelect={this.props.onSelect.bind(this)}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='col-sm-3'>
                {buttonRows}
                <AddButton label={texts.addQorus} action={'add-qorus'} env_id={env.id}
                           positionClass={'offset-sm-7 col-sm-5 text-left'} />
            </div>
        );
    }
}

class QorusEdit extends React.Component {
    render() {
        let qorus = this.props.qorus;
        return (
            <div className='btn-group btn-group-sm' role='group' style={{margin: '8px 0'}}>
                <button className='btn btn-primary' title={texts.edit} role='button'
                            data-target='#edit_config_modal' data-toggle='modal'
                            data-text={texts.editQorus} data-action='edit-qorus'
                            data-env-id={this.props.env_id} data-qorus-id={qorus.id}
                            data-name={qorus.name}>
                    <i className='fas fa-pencil-alt'></i>
                </button>
                <button className='btn btn-danger' title={texts.remove}
                            role='button' data-target='#remove_config_modal'
                            data-toggle='modal' data-text={texts.confirmRemoveQorus}
                            data-action='remove-qorus' data-env-id={this.props.env_id}
                            data-qorus-id={qorus.id}>
                    <i className='fas fa-times'></i>
                </button>
                {this.props.onMoveUp ?
                    <button className='btn btn-warning' title={texts.moveUp}
                            role='button' onClick={this.props.onMoveUp.bind(this, this.props.env_id, qorus.id)}>
                        <i className='fas fa-arrow-up'></i>
                    </button> : null}
            </div>
        );
    }
}

class Urls extends React.Component {
    render() {
        if (!this.props.qorus) {
            return null;
        }

        let customUrls = [];
        let env_id = this.props.env_id;
        let qorus = this.props.qorus;
        let is_first = true;
        for (let url_id in qorus.urls) {
            customUrls.push(<CustomUrl env_id={env_id} qorus_id={qorus.id} url={qorus.urls[url_id]}
                                       onMoveUp={is_first ? null : this.props.onMoveUp.bind(this)} />);
            is_first = false;
        }

        return (
            <div className='offset-sm-1 col-sm-5'>
                <h4>{texts.mainUrl}</h4>
                <div className='row'>
                    <div className='col-sm-9'>{qorus.url}</div>
                    <div className='col-sm-3'>
                        <div className='btn-group btn-group-sm' role='group'>
                            <button className='btn btn-primary' title={texts.edit} role='button'
                                    data-target='#edit_config_modal' data-toggle='modal'
                                    data-text={texts.editMainUrl} data-action='edit-main-url'
                                    data-env-id={env_id} data-qorus-id={qorus.id} data-url={qorus.url}>
                               <i className='fas fa-pencil-alt'></i>
                            </button>
                        </div>
                    </div>
                </div>
                <br />
                <h4>{texts.customUrls}</h4>
                {customUrls}
                <AddButton label={texts.addUrl} action={'add-url'} env_id={env_id} qorus_id={qorus.id}
                           positionClass={'offset-sm-9 col-sm-3 text-left'} />
            </div>
        );
    }
}

class CustomUrl extends React.Component {
    render () {
        let url = this.props.url;
        return (
            <div style={{paddingBottom: '12px'}}>
                <div className='row'>
                    <div className='font-weight-bold col-sm-9'>{url.name}</div>
                    <div className='col-sm-3'>
                        <div className='btn-group btn-group-sm' role='group'>
                            <button className='btn btn-primary' title={texts.edit} role='button'
                                    data-target='#edit_config_modal' data-toggle='modal' data-text={texts.editUrl}
                                    data-action='edit-url' data-env-id={this.props.env_id}
                                    data-qorus-id={this.props.qorus_id} data-url-id={url.id}
                                    data-name={url.name} data-url={url.url} >
                                <i className='fas fa-pencil-alt'></i>
                            </button>
                            <button className='btn btn-danger' title={texts.remove} role='button'
                                    data-target='#remove_config_modal' data-toggle='modal'
                                    data-text={texts.confirmRemoveUrl} data-action='remove-url'
                                    data-env-id={this.props.env_id} data-qorus-id={this.props.qorus_id}
                                    data-url-id={url.id} >
                                <i className='fas fa-times'></i>
                            </button>
                            {this.props.onMoveUp ?
                                <button className='btn btn-warning' title={texts.moveUp} role='button'
                                        onClick={this.props.onMoveUp.bind(this, this.props.env_id,
                                                                                this.props.qorus_id,
                                                                                url.id)}>
                                    <i className='fas fa-arrow-up'></i>
                                </button> : null}
                        </div>
                    </div>
                </div>
                <div className='row'>
                    <div className='col-sm-12'>{url.url}</div>
                </div>
            </div>
        );
    }
}

$('#edit_config_modal').on('shown.bs.modal', function(event) {
    var caller = $(event.relatedTarget);
    var action = caller.data('action');
    if (['add-env', 'edit-env', 'edit-qorus'].includes(action)) {
        $('#form_group_url').hide();
    }
    else {
        $('#form_group_url').show();
    }
    if (['edit-main-url'].includes(action)) {
        $('#form_group_name').hide();
    }
    else {
        $('#form_group_name').show();
    }
    $('#action').val(action);
    $('#edit_config_text').html(caller.data('text'));
    $('#env_id').val(caller.data('env-id'));
    $('#qorus_id').val(caller.data('qorus-id'));
    $('#url_id').val(caller.data('url-id'));
    $('#name').val(caller.data('name'));
    $('#url').val(caller.data('url'));
    $('#name').trigger('focus');
});

$('#remove_config_modal').on('shown.bs.modal', function(event) {
    var caller = $(event.relatedTarget);
    $('#confirm_remove').html(caller.data('text'));
    $('#action').val(caller.data('action'));
    $('#env_id').val(caller.data('env-id'));
    $('#qorus_id').val(caller.data('qorus-id'));
    $('#url_id').val(caller.data('url-id'));
});

ReactDOM.render(
    <Root />,
    document.querySelector('#react_root')
);
