import { combineReducers } from 'redux';

function simpleReducer(state, action, type) {
    return action.type == type ? action[type] : state;
}

function activeTab(state = 'ProjectConfig', action) {
    return simpleReducer(state, action, 'active_tab');
}

function deleteIfacesKind(state = 'workflows', action) {
    return simpleReducer(state, action, 'delete_ifaces_kind');
}

function deleteIfacesAll(state = {}, action) {
    return simpleReducer(state, action, 'delete_ifaces_all');
}

function deleteIfacesChecked(state = {}, action) {
    return simpleReducer(state, action, 'delete_ifaces_checked');
}

function configSelectedEnv(state = null, action) {
    return simpleReducer(state, action, 'config_selected_env');
}

function configSelectedQorus(state = null, action) {
    return simpleReducer(state, action, 'config_selected_qorus');
}

function configType(state = 'qoruses', action) {
    return simpleReducer(state, action, 'config_type');
}

function configData(state = null, action) {
    return simpleReducer(state, action, 'config_data');
}

function configEditPopoverOpen(state = {}, action) {
    if (action.type == 'config_edit_popover_open') {
        return Object.assign({}, state, {[action.id]: action.open});
    }
    return state;
}

function msgOpen(state = {config_changed: false, release_not_up_to_date: false}, action) {
    switch (action.type) {
        case 'config_changed_msg_open':
            return Object.assign({}, state, {config_changed: action.open});
        case 'release_not_up_to_date_msg_open':
            return Object.assign({}, state, {release_not_up_to_date: action.open});
        default:
            return state;
    }
}

export default function reducer(state = {}, action) {
    if (action.type === 'all') {
        return action.all;
    }

    return combineReducers({
        active_tab: activeTab,
        delete_ifaces_kind: deleteIfacesKind,
        delete_ifaces_all: deleteIfacesAll,
        delete_ifaces_checked: deleteIfacesChecked,
        msg_open: msgOpen,
        config_type: configType,
        config_data: configData,
        config_selected_env: configSelectedEnv,
        config_selected_qorus: configSelectedQorus,
        config_edit_popover_open: configEditPopoverOpen,
    })(state, action);
}
