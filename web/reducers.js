import { combineReducers } from 'redux';

function simpleReducer(state, action, type) {
    return action.type == type ? action[type] : state;
}

function activeTab(state = 'ProjectConfig', action) {
    return simpleReducer(state, action, 'active_tab');
}

function ifaceKind(state = 'workflows', action) {
    return simpleReducer(state, action, 'iface_kind');
}

function interfaces(state = {}, action) {
    return simpleReducer(state, action, 'interfaces');
}

function checked(state = {}, action) {
    return simpleReducer(state, action, 'checked');
}

const qorusWebview = combineReducers({
    active_tab: activeTab,
    iface_kind: ifaceKind,
    interfaces,
    checked
});

export default qorusWebview;
