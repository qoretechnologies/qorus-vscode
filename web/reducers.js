import { combineReducers } from 'redux';
import { vscode } from './common/vscode';

function simpleReducer(state, action, type) {
    return action.type == type ? action[type] : state;
}

function activeTab(state = 'ProjectConfig', action) {
    return simpleReducer(state, action, 'activeTab');
}

function deleteIfacesKind(state = 'workflows', action) {
    return simpleReducer(state, action, 'deleteIfacesKind');
}

function deleteIfacesAll(state = {}, action) {
    return simpleReducer(state, action, 'deleteIfacesAll');
}

function deleteIfacesChecked(state = {}, action) {
    return simpleReducer(state, action, 'deleteIfacesChecked');
}

function configSelectedEnv(state = null, action) {
    return simpleReducer(state, action, 'configSelectedEnv');
}

function configSelectedQorus(state = null, action) {
    return simpleReducer(state, action, 'configSelectedQorus');
}

function configType(state = 'qoruses', action) {
    return simpleReducer(state, action, 'configType');
}

function configData(state = null, action) {
    return simpleReducer(state, action, 'configData');
}

function configEditPopoverOpen(state = {}, action) {
    if (action.type == 'configEditPopoverOpen') {
        return Object.assign({}, state, {[action.id]: action.open});
    }
    return state;
}

function releaseStep(state = 0, action) {
    return simpleReducer(state, action, 'releaseStep');
}

function releaseBranch(state = null, action) {
    return simpleReducer(state, action, 'releaseBranch');
}

function releaseCommitHash(state = null, action) {
    return simpleReducer(state, action, 'releaseCommitHash');
}

function releaseCommit(state = null, action) {
    return simpleReducer(state, action, 'releaseCommit');
}

function releaseCommits(state = null, action) {
    return simpleReducer(state, action, 'releaseCommits');
}

function releaseFiles(state = [], action) {
    return simpleReducer(state, action, 'releaseFiles');
}

function releasePending(state = false, action) {
    return simpleReducer(state, action, 'releasePending');
}

function releasePackagePath(state = null, action) {
    return simpleReducer(state, action, 'releasePackagePath');
}

function releaseSavedPath(state = null, action) {
    return simpleReducer(state, action, 'releaseSavedPath');
}

function releaseResult(state = null, action) {
    return simpleReducer(state, action, 'releaseResult');
}

function releaseType(state = 'full', action) {
    return simpleReducer(state, action, 'releaseType');
}

function releaseFilter(state = {hash: '', branch: '', tag: ''}, action) {
    if (action.type === 'releaseFilter') {
        return Object.assign({}, state, {[action.filter]: action.value});
    }
    return state;
}

function createIfaceTargetDir(state = null, action) {
    return simpleReducer(state, action, 'createIfaceTargetDir');
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
        activeTab,
        deleteIfacesKind,
        deleteIfacesAll,
        deleteIfacesChecked,
        msgOpen,
        configType,
        configData,
        configSelectedEnv,
        configSelectedQorus,
        configEditPopoverOpen,
        releaseStep,
        releaseBranch,
        releaseCommit,
        releaseCommits,
        releaseCommitHash,
        releaseFiles,
        releasePending,
        releasePackagePath,
        releaseSavedPath,
        releaseResult,
        releaseType,
        releaseFilter,
        createIfaceTargetDir,
    })(state, action);
}
