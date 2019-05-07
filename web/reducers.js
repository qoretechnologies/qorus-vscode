import { combineReducers } from 'redux';
import { vscode } from './common/vscode';

function simpleReducer(state, action, type) {
    return action.type == type ? action[type] : state;
}

function activeTab(state = 'ProjectConfig', action) {
    return simpleReducer(state, action, 'active_tab');
}

function loginVisible(state = false, action) {
    return simpleReducer(state, action, 'login_visible');
}

function loginQorus(state = null, action) {
    return simpleReducer(state, action, 'login_qorus');
}

function loginUsername(state = '', action) {
    return simpleReducer(state, action, 'login_username');
}

function loginPassword(state = '', action) {
    return simpleReducer(state, action, 'login_password');
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

function releaseStep(state = 0, action) {
    return simpleReducer(state, action, 'release_step');
}

function releaseBranch(state = null, action) {
    return simpleReducer(state, action, 'release_branch');
}

function releaseCommitHash(state = null, action) {
    return simpleReducer(state, action, 'release_commit_hash');
}

function releaseCommit(state = null, action) {
    return simpleReducer(state, action, 'release_commit');
}

function releaseCommits(state = null, action) {
    return simpleReducer(state, action, 'release_commits');
}

function releaseFiles(state = [], action) {
    return simpleReducer(state, action, 'release_files');
}

function releasePending(state = false, action) {
    return simpleReducer(state, action, 'release_pending');
}

function releasePackagePath(state = null, action) {
    return simpleReducer(state, action, 'release_package_path');
}

function releaseSavedPath(state = null, action) {
    return simpleReducer(state, action, 'release_saved_path');
}

function releaseResult(state = null, action) {
    return simpleReducer(state, action, 'release_result');
}

function releaseType(state = 'full', action) {
    return simpleReducer(state, action, 'release_type');
}

function releaseFilter(state = {hash: '', branch: '', tag: ''}, action) {
    if (action.type === 'release_filter') {
        return Object.assign({}, state, {[action.filter]: action.value});
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

export default function reducer(state = vscode.getState(), action) {
    return combineReducers({
        active_tab: activeTab,
        login_visible: loginVisible,
        login_qorus: loginQorus,
        login_username: loginUsername,
        login_password: loginPassword,
        delete_ifaces_kind: deleteIfacesKind,
        delete_ifaces_all: deleteIfacesAll,
        delete_ifaces_checked: deleteIfacesChecked,
        msg_open: msgOpen,
        config_type: configType,
        config_data: configData,
        config_selected_env: configSelectedEnv,
        config_selected_qorus: configSelectedQorus,
        config_edit_popover_open: configEditPopoverOpen,
        release_step: releaseStep,
        release_branch: releaseBranch,
        release_commit: releaseCommit,
        release_commits: releaseCommits,
        release_commit_hash: releaseCommitHash,
        release_files: releaseFiles,
        release_pending: releasePending,
        release_package_path: releasePackagePath,
        release_saved_path: releaseSavedPath,
        release_result: releaseResult,
        release_type: releaseType,
        release_filter: releaseFilter,
    })(state, action);
}
